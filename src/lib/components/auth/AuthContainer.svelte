<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";

  let loading = false;

  async function signIn(provider: "google" | "github") {
    loading = true;

    await authClient.signIn.social({
      provider,
      callbackURL: "/blog",
    });
  }
</script>

<div
  class="flex min-h-screen w-full items-center justify-center bg-[#15100e] p-6 text-[#f4ebe3]"
>
  {#if loading}
    <Card.Root
      class="w-full max-w-137.5 rounded-[30px] border border-[#ffe1ca]/15 bg-[#573723]/40 text-[#f7eee7] shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-3xl"
    >
      <Card.Content class="flex min-h-75 items-center justify-center">
        <span
          class="font-[Oxanium] text-[13px] font-medium tracking-[0.28em] text-[#f7eee7]/65"
        >
          WAITING...
        </span>
      </Card.Content>
    </Card.Root>
  {:else}
    <Card.Root
      class="w-full max-w-137.5 rounded-[30px] border border-[#ffe1ca]/15 bg-linear-to-br from-[#6e452d]/42 to-[#452b1d]/32 text-[#f7eee7] shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-3xl"
    >
      <Card.Header class="space-y-3 pb-9 text-center">
        <Card.Title
          class="font-[Oxanium] text-[46px] font-medium tracking-[-2px] text-[#f7eee7]"
        >
          BlogPost
        </Card.Title>

        <Card.Description class="text-sm text-[#f7eee7]/50">
          Welcome back
        </Card.Description>
      </Card.Header>

      <Card.Content class="space-y-3">
        <Button
          variant="outline"
          class="h-14.5 w-full rounded-2xl border-[#ffe2cd]/13 bg-white/5.5 text-[#f5eee8] hover:bg-white/9.5 hover:text-[#f5eee8]"
          onclick={() => signIn("github")}
          disabled={loading}
        >
          <img src="/github_white.svg" alt="GitHub" class="size-5.25 object-contain" />
          <span>Continue with GitHub</span>
        </Button>

        <Button
          variant="outline"
          class="h-14.5 w-full rounded-2xl border-[#ffe2cd]/13 bg-white/5.5 text-[#f5eee8] hover:bg-white/9.5 hover:text-[#f5eee8]"
          onclick={() => signIn("google")}
          disabled={loading}
        >
          <img src="/google-color.svg" alt="Google" class="size-5.25 object-contain" />
          <span>Continue with Google</span>
        </Button>
      </Card.Content>
    </Card.Root>
  {/if}
</div>