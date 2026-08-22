<script lang="ts">
  import { authClient } from "$lib/auth-client";

  let loading = false;

  async function signIn(provider: "google" | "github") {
    loading = true;

    await authClient.signIn.social({
      provider,
      callbackURL: "/blog",
    });

    loading = false;
  }
</script>

<div>
  <button disabled={loading} onclick={() => signIn("google")}>
    Continue with Google
  </button>

  <button disabled={loading} onclick={() => signIn("github")}>
    Continue with GitHub
  </button>
</div>
