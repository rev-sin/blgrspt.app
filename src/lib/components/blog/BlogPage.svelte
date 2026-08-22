<script lang="ts">
  import { onMount } from "svelte";

  import BlogHeader from "./BlogHeader.svelte";
  import CopyLinkButton from "./CopyLinkButton.svelte";
  import CreatePostButton from "./CreatePostButton.svelte";

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }

  interface Post {
    id: string;
    authorId: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    status: "draft" | "published";
    visibility: "private" | "unlisted" | "public";
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }

  interface Props {
    user: User;
  }

  let { user }: Props = $props();

  let posts = $state<Post[]>([]);
  let loading = $state(true);
  let error = $state("");
  let deletingSlug = $state("");

  function visibilityLabel(post: Post) {
    if (post.status === "draft") {
      return "Draft";
    }

    if (post.visibility === "private") {
      return "Private";
    }

    if (post.visibility === "unlisted") {
      return "Unlisted";
    }

    return "Public";
  }

  function snippet(post: Post) {
    if (post.excerpt) {
      return post.excerpt;
    }

    return post.content.replace(/[#*`>-]/g, "").trim();
  }

  function formatDate(post: Post) {
    return new Date(
      post.updatedAt ?? post.publishedAt ?? post.createdAt,
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function loadPosts() {
    loading = true;
    error = "";

    try {
      const response = await fetch(
        "/api/v1/posts?mine=true&sort=updatedAt&order=desc&limit=100",
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Failed to load posts");
      }

      posts = result.data ?? [];
    } catch (err) {
      console.error("Failed to load posts:", err);

      error = err instanceof Error ? err.message : "Failed to load posts";
    } finally {
      loading = false;
    }
  }

  async function deletePost(post: Post) {
    if (deletingSlug) return;

    const confirmed = window.confirm(
      `Delete "${post.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    deletingSlug = post.slug;

    try {
      const response = await fetch(
        `/api/v1/posts/${encodeURIComponent(post.slug)}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Delete failed:", result);
        return;
      }

      posts = posts.filter((item) => item.id !== post.id);
    } catch (err) {
      console.error("Delete request failed:", err);
    } finally {
      deletingSlug = "";
    }
  }

  onMount(() => {
    loadPosts();
  });
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  <BlogHeader {user} active="dashboard" />

  <main class="mx-auto w-full max-w-6xl px-6 py-16">
    <div class="flex items-start justify-between gap-8">
      <section>
        <p
          class="mb-4 font-[Oxanium] text-xs uppercase tracking-[0.3em] text-[#f7eee7]/40"
        >
          Dashboard
        </p>

        <h1
          class="font-[Oxanium] text-5xl font-medium tracking-[-2px] text-[#f7eee7] md:text-6xl"
        >
          Content
        </h1>

        <p class="mt-4 text-sm text-[#f7eee7]/45">
          All of your posts in one place.
        </p>
      </section>

      <CreatePostButton />
    </div>

    <section class="mt-12">
      {#if loading}
        <div class="py-20 text-center">
          <p class="text-sm text-[#f4ebe3]/30">Loading posts...</p>
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
          <p class="text-sm text-[#f4ebe3]/30">No posts yet.</p>
        </div>
      {:else}
        <div
          class="overflow-hidden rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f]"
        >
          <div
            class="hidden grid-cols-[minmax(0,1fr)_8rem_8rem_14rem] gap-4 border-b border-[#ffe1ca]/10 px-5 py-3 md:grid"
          >
            <span
              class="font-[Oxanium] text-[10px] uppercase tracking-[0.18em] text-[#f4ebe3]/35"
            >
              Post
            </span>
            <span
              class="font-[Oxanium] text-[10px] uppercase tracking-[0.18em] text-[#f4ebe3]/35"
            >
              Visibility
            </span>
            <span
              class="font-[Oxanium] text-[10px] uppercase tracking-[0.18em] text-[#f4ebe3]/35"
            >
              Date
            </span>
            <span
              class="text-right font-[Oxanium] text-[10px] uppercase tracking-[0.18em] text-[#f4ebe3]/35"
            >
              Actions
            </span>
          </div>

          {#each posts as post (post.id)}
            <div
              class="grid gap-3 border-b border-[#ffe1ca]/10 px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_8rem_8rem_14rem] md:items-center md:gap-4"
            >
              <a href={`/blog/${post.slug}`} class="min-w-0">
                <h2
                  class="truncate font-[Oxanium] text-base font-medium tracking-[-0.3px] text-[#f7eee7]"
                >
                  {post.title}
                </h2>
                <p class="mt-1 line-clamp-1 text-sm text-[#f4ebe3]/40">
                  {snippet(post)}
                </p>
              </a>

              <span
                class="w-fit rounded-full border border-[#ffe1ca]/15 px-2.5 py-1 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#d7a77e]/80"
              >
                {visibilityLabel(post)}
              </span>

              <span
                class="font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#f4ebe3]/35"
              >
                {formatDate(post)}
              </span>

              <div
                class="flex flex-wrap items-center justify-start gap-2 md:justify-end"
              >
                <CopyLinkButton slug={post.slug} />

                <a
                  href={`/blog/edit/${post.slug}`}
                  class="rounded-lg border border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#f4ebe3]/50 transition hover:border-[#ffe1ca]/20 hover:text-[#f4ebe3]"
                >
                  Edit
                </a>

                <button
                  type="button"
                  onclick={() => deletePost(post)}
                  disabled={deletingSlug === post.slug}
                  class="rounded-lg border border-red-300/10 px-3 py-2 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-red-200/40 transition hover:border-red-300/20 hover:text-red-200/70 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deletingSlug === post.slug ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </main>
</div>
