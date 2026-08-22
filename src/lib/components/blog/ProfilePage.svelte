<script lang="ts">
  import { onMount } from "svelte";

  import BlogHeader from "./BlogHeader.svelte";
  import PostCard from "./PostCard.svelte";
  import * as Avatar from "$lib/components/ui/avatar";

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

  interface Post {
    id: string;
    authorId: string;
    authorName: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    tags: string[];
    status: "draft" | "published";
    visibility: "private" | "unlisted" | "public";
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    contentType: string;
  }

  interface Props {
    profile: Profile;
    currentUser: CurrentUser | null;
  }

  let { profile, currentUser }: Props = $props();

  let posts = $state<Post[]>([]);
  let loading = $state(true);
  let error = $state("");

  async function loadPosts() {
    loading = true;
    error = "";

    try {
      const response = await fetch(
        `/api/v1/posts?authorId=${encodeURIComponent(profile.id)}&status=published&visibility=public&sort=publishedAt&order=desc`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Failed to load posts");
      }

      posts = result.data ?? [];
    } catch (err) {
      console.error("Failed to load profile posts:", err);

      error = err instanceof Error ? err.message : "Failed to load posts";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadPosts();
  });
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  {#if currentUser}
    <BlogHeader user={currentUser} />
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
      </div>
    </section>

    <section class="mt-16">
      {#if loading}
        <div class="py-20 text-center">
          <p class="text-sm text-[#f4ebe3]/30">Loading posts...</p>
        </div>
      {:else if error}
        <div
          class="rounded-2xl border border-red-400/10 bg-red-400/[0.03] p-8 text-center"
        >
          <p class="text-sm text-red-300/70">{error}</p>
        </div>
      {:else if posts.length === 0}
        <div
          class="rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] p-12 text-center"
        >
          <p class="text-sm text-[#f4ebe3]/30">No public posts yet.</p>
        </div>
      {:else}
        <div class="grid gap-5 md:grid-cols-2">
          {#each posts as post (post.id)}
            <PostCard {post} currentUserId={currentUser?.id} />
          {/each}
        </div>
      {/if}
    </section>
  </main>
</div>
