<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { Button } from "$lib/components/ui/button";
  import * as Avatar from "$lib/components/ui/avatar";

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }

  interface Props {
    user: User;
    active?: "feed" | "dashboard";
  }

  let { user, active = "feed" }: Props = $props();

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

<header class="px-6 pt-6">
  <nav
    class="mx-auto flex h-18 w-full max-w-6xl items-center justify-between rounded-2xl border border-[#ffe1ca]/10 bg-[#573723]/25 px-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
  >
    <a
      href="/feed"
      class="font-[Oxanium] text-2xl font-medium tracking-[-1px] text-[#f7eee7]"
    >
      BlogPost
    </a>

    <div class="flex items-center gap-3">
      <a
        href="/feed"
        class={`font-[Oxanium] text-xs uppercase tracking-[0.15em] transition ${
          active === "feed"
            ? "text-[#f7eee7]"
            : "text-[#f7eee7]/45 hover:text-[#f7eee7]"
        }`}
      >
        Feed
      </a>

      <a
        href="/dashboard"
        class={`font-[Oxanium] text-xs uppercase tracking-[0.15em] transition ${
          active === "dashboard"
            ? "text-[#f7eee7]"
            : "text-[#f7eee7]/45 hover:text-[#f7eee7]"
        }`}
      >
        Dashboard
      </a>

      <a href={`/u/${user.id}`} class="rounded-full" aria-label="Your profile">
        <Avatar.Root class="size-10 border border-[#ffe1ca]/15">
          <Avatar.Image src={user.image ?? undefined} alt={user.name} />

          <Avatar.Fallback class="bg-[#6e452d] text-sm text-[#f7eee7]">
            {user.name.slice(0, 1).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>
      </a>

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
