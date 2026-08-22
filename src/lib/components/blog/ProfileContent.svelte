<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";

  import BlogHeader from "./BlogHeader.svelte";
  import PostCard from "./PostCard.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Alert from "$lib/components/ui/alert";
  import { queryKeys } from "$lib/query/keys";
  import { listPosts } from "$lib/query/posts";

  interface Profile {
    id: string;
    name: string;
    image: string | null;
  }

  interface CurrentUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }

  interface Props {
    profile: Profile;
    currentUser: CurrentUser | null;
    isAdmin?: boolean;
  }

  let { profile, currentUser, isAdmin = false }: Props = $props();

  const postsQuery = createQuery(() => ({
    queryKey: queryKeys.posts.list({
      authorId: profile.id,
      status: "published",
      visibility: "public",
      sort: "publishedAt",
      order: "desc",
    }),
    queryFn: () =>
      listPosts({
        authorId: profile.id,
        status: "published",
        visibility: "public",
        sort: "publishedAt",
        order: "desc",
      }),
  }));
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  {#if currentUser}
    <BlogHeader user={currentUser} {isAdmin} />
  {:else}
    <header class="px-6 pt-6">
      <nav
        class="mx-auto flex h-18 w-full max-w-6xl items-center justify-between rounded-2xl border border-[#ffe1ca]/10 bg-[#573723]/25 px-5"
      >
        <a
          href="/"
          class="font-[Oxanium] text-2xl font-medium tracking-[-1px] text-[#f7eee7]"
        >
          BlogPost
        </a>
      </nav>
    </header>
  {/if}

  <main class="mx-auto w-full max-w-6xl px-6 py-16">
    <section class="flex items-center gap-5">
      <Avatar.Root class="size-16 border border-[#ffe1ca]/15">
        <Avatar.Image src={profile.image ?? undefined} alt={profile.name} />

        <Avatar.Fallback class="bg-[#6e452d] text-lg text-[#f7eee7]">
          {profile.name.slice(0, 1).toUpperCase()}
        </Avatar.Fallback>
      </Avatar.Root>

      <div>
        <p
          class="mb-2 font-[Oxanium] text-xs uppercase tracking-[0.3em] text-[#f7eee7]/40"
        >
          Profile
        </p>

        <h1
          class="font-[Oxanium] text-4xl font-medium tracking-[-2px] text-[#f7eee7] md:text-5xl"
        >
          {profile.name}
        </h1>

        {#if isAdmin && currentUser?.id === profile.id}
          <a
            href="/admin"
            class="mt-4 inline-flex rounded-xl border border-[#ffe1ca]/10 bg-[#1b1411] px-4 py-2 font-[Oxanium] text-xs uppercase tracking-[0.15em] text-[#d7a77e] transition hover:border-[#ffe1ca]/20 hover:text-[#f4ebe3]"
          >
            Admin dashboard
          </a>
        {/if}
      </div>
    </section>

    <section class="mt-16">
      {#if postsQuery.isPending}
        <div class="py-20 text-center">
          <p class="text-sm text-[#f4ebe3]/30">Loading posts...</p>
        </div>
      {:else if postsQuery.isError}
        <Alert.Root
          variant="destructive"
          class="border-red-400/10 bg-red-400/[0.03]"
        >
          <Alert.Description class="text-red-300/70">
            {postsQuery.error.message}
          </Alert.Description>
        </Alert.Root>
      {:else if (postsQuery.data ?? []).length === 0}
        <div
          class="rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] p-12 text-center"
        >
          <p class="text-sm text-[#f4ebe3]/30">No public posts yet.</p>
        </div>
      {:else}
        <div class="grid gap-5 md:grid-cols-2">
          {#each postsQuery.data ?? [] as post (post.id)}
            <PostCard {post} currentUserId={currentUser?.id} />
          {/each}
        </div>
      {/if}
    </section>
  </main>
</div>
