import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SKIP_KEYS = new Set(["DOPPLER_CONFIG", "DOPPLER_ENVIRONMENT", "DOPPLER_PROJECT"]);

const MAPPINGS = [
  { dopplerConfig: "prd", vercelEnv: "production" },
  { dopplerConfig: "stg", vercelEnv: "preview" },
  { dopplerConfig: "dev", vercelEnv: "development" },
] as const;

function run(command: string, args: string[], options?: { input?: string }) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed (${code}): ${stderr || stdout}`));
    });

    if (options?.input !== undefined) {
      child.stdin.write(options.input);
    }

    child.stdin.end();
  });
}

function parseSecrets(raw: string): Record<string, string> {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const secrets: Record<string, string> = {};

  for (const [key, value] of Object.entries(parsed)) {
    if (SKIP_KEYS.has(key) || typeof value !== "string") {
      continue;
    }

    secrets[key] = value;
  }

  return secrets;
}

async function uploadSecrets(config: string, secrets: Record<string, string>) {
  const dir = await mkdtemp(join(tmpdir(), "doppler-upload-"));
  const file = join(dir, `${config}.json`);

  try {
    await writeFile(file, JSON.stringify(secrets), { mode: 0o600 });
    await run("doppler", ["secrets", "upload", "--config", config, file]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function syncConfig(
  dopplerConfig: string,
  vercelEnv: string,
  secrets: Record<string, string>,
) {
  const names = Object.keys(secrets).sort();

  for (const name of names) {
    const args = ["env", "add", name, vercelEnv, "--yes", "--force"];

    if (vercelEnv !== "development") {
      args.push("--sensitive");
    }

    await run("vercel", args, { input: secrets[name] });
    console.log(`Synced ${name} → Vercel ${vercelEnv}`);
  }

  console.log(`Finished ${dopplerConfig} → ${vercelEnv} (${names.length} secrets)`);
}

const source = parseSecrets(
  await run("doppler", ["secrets", "download", "--config", "dev", "--no-file", "--format", "json"]),
);

const productionUrl = "https://blgrsptapp.vercel.app";
const prdSecrets = { ...source, BETTER_AUTH_URL: productionUrl };
const stgSecrets = { ...source, BETTER_AUTH_URL: productionUrl };

await uploadSecrets("prd", prdSecrets);
await uploadSecrets("stg", stgSecrets);

console.log("Copied Doppler dev secrets into prd and stg");

for (const mapping of MAPPINGS) {
  const secrets = parseSecrets(
    await run("doppler", [
      "secrets",
      "download",
      "--config",
      mapping.dopplerConfig,
      "--no-file",
      "--format",
      "json",
    ]),
  );

  await syncConfig(mapping.dopplerConfig, mapping.vercelEnv, secrets);
}
