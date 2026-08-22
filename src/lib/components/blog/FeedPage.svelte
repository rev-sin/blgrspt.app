<script lang="ts">
  import { onMount } from "svelte";

  import BlogHeader from "./BlogHeader.svelte";
  import CreatePostButton from "./CreatePostButton.svelte";
  import PostCard from "./PostCard.svelte";

  interface User {
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
    user: User;
  }

  let { user }: Props = $props();

  let posts = $state<Post[]>([]);
  let loading = $state(true);
  let error = $state("");

  async function loadPosts() {
    loading = true;
    error = "";

    try {
      const response = await fetch(
        "/api/v1/posts?status=published&visibility=public&sort=publishedAt&order=desc",
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Failed to load feed");
      }

      posts = result.data ?? [];
    } catch (err) {
      console.error("Failed to load feed:", err);

      error = err instanceof Error ? err.message : "Failed to load feed";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadPosts();
  });
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  <BlogHeader {user} active="feed" />

  <main class="mx-auto w-full max-w-6xl px-6 py-16">
    <div class="flex items-start justify-between gap-8">
      <section>
        <p
          class="mb-4 font-[Oxanium] text-xs uppercase tracking-[0.3em] text-[#f7eee7]/40"
        >
          Feed
        </p>

        <h1
          class="font-[Oxanium] text-5xl font-medium tracking-[-2px] text-[#f7eee7] md:text-6xl"
        >
          Latest posts
        </h1>

        <p class="mt-4 text-sm text-[#f7eee7]/45">
          Public posts from everyone.
        </p>
      </section>

      <CreatePostButton />
    </div>

    <section class="mt-16">
      {#if loading}
        <div class="py-20 text-center">
          <p class="text-sm text-[#f4ebe3]/30">Loading feed...</p>
        </div>
      {:else if error}
        <div
          class="rounded-2xl border border-red-400/10 bg-red-400/[0.03] p-8 text-center"
        >
          <p class="text-sm text-red-300/70">
            {error}
          </p>

          <button
            type="button"
            onclick={loadPosts}
            class="mt-4 text-xs uppercase tracking-[0.2em] text-[#d7a77e] hover:text-[#f4ebe3]"
          >
            Try again
          </button>
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
            <PostCard {post} currentUserId={user.id} />
          {/each}
        </div>
      {/if}
    </section>
  </main>
</div>
