<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { Button } from "$lib/components/ui/button";
  import * as Avatar from "$lib/components/ui/avatar";

  interface User {
    name: string;
    email: string;
    image?: string | null;
  }

  interface Props {
    user: User;
  }

  let { user }: Props = $props();

  let loading = $state(false);

  async function logout() {
    loading = true;

    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      loading = false;
    }
  }
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  <header class="px-6 pt-6">
    <nav
      class="mx-auto flex h-18 w-full max-w-6xl items-center justify-between rounded-2xl border border-[#ffe1ca]/10 bg-[#573723]/25 px-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
    >
      <a
        href="/blog"
        class="font-[Oxanium] text-2xl font-medium tracking-[-1px] text-[#f7eee7]"
      >
        BlogPost
      </a>

      <div class="flex items-center gap-3">
        <Avatar.Root class="size-10 border border-[#ffe1ca]/15">
          <Avatar.Image
            src={user.image ?? undefined}
            alt={user.name}
          />

          <Avatar.Fallback
            class="bg-[#6e452d] text-sm text-[#f7eee7]"
          >
            {user.name.slice(0, 1).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>

        <Button
          variant="outline"
          size="sm"
          class="rounded-xl border-[#ffe2cd]/10 bg-white/4 text-[#f5eee8] hover:bg-white/9 hover:text-[#f5eee8]"
          onclick={logout}
          disabled={loading}
        >
          {loading ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </nav>
  </header>

  <main
    class="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-6xl items-center justify-center px-6 py-16"
  >
    <section class="text-center">
      <p
        class="mb-4 font-[Oxanium] text-xs uppercase tracking-[0.3em] text-[#f7eee7]/40"
      >
        Welcome
      </p>

      <h1
        class="font-[Oxanium] text-5xl font-medium tracking-[-2px] text-[#f7eee7] md:text-6xl"
      >
        {user.name}
      </h1>

      <p class="mt-4 text-sm text-[#f7eee7]/45">
        Your blog starts here.
      </p>
    </section>
  </main>
</div>