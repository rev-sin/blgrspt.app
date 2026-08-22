<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { Button } from "$lib/components/ui/button";

  let loading = $state(false);

  async function signIn(provider: "google" | "github") {
    loading = true;

    await authClient.signIn.social({
      provider,
      callbackURL: "/feed",
    });

    loading = false;
  }
</script>

<div class="flex flex-col gap-3">
  <Button disabled={loading} onclick={() => signIn("google")}>
    Continue with Google
  </Button>

  <Button variant="outline" disabled={loading} onclick={() => signIn("github")}>
    Continue with GitHub
  </Button>
</div>
