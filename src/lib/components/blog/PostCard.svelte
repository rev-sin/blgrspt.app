<script lang="ts">
  interface Post {
    id: string;
    authorId: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    tags: string[];
    status: "draft" | "published";
    publishedAt?: string | null;
    createdAt: string;
    contentType: string;
  }

  interface Props {
    post: Post;
    currentUserId?: string;
  }

  let { post, currentUserId }: Props = $props();

  let deleting = $state(false);

  const isOwner = $derived(!!currentUserId && currentUserId === post.authorId);

  async function deletePost() {
    if (deleting || !isOwner) return;

    const confirmed = window.confirm(
      `Delete "${post.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    deleting = true;

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

      window.location.reload();
    } catch (error) {
      console.error("Delete request failed:", error);
    } finally {
      deleting = false;
    }
  }
</script>

<article
  class="group rounded-2xl border border-[#ffe1ca]/10
         bg-[#15100e] p-7 transition
         hover:border-[#ffe1ca]/20"
>
  <div class="mb-6 flex items-center gap-3">
    <span
      class="font-[Oxanium] text-xs uppercase
             tracking-[0.2em] text-[#d7a77e]/70"
    >
      {post.contentType}
    </span>

    <span class="text-xs text-[#f4ebe3]/30">
      {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      )}
    </span>
  </div>

  <a href={`/blog/${post.slug}`} class="block">
    <h2
      class="font-[Oxanium] text-2xl font-medium
             tracking-[-0.5px] text-[#f7eee7]"
    >
      {post.title}
    </h2>

    {#if post.excerpt}
      <p
        class="mt-4 line-clamp-2 text-sm
               leading-7 text-[#f4ebe3]/45"
      >
        {post.excerpt}
      </p>
    {:else}
      <p
        class="mt-4 line-clamp-2 text-sm
               leading-7 text-[#f4ebe3]/45"
      >
        {post.content.replace(/[#*`>-]/g, "").trim()}
      </p>
    {/if}
  </a>

  <div class="mt-7 border-t border-[#ffe1ca]/10 pt-5">
    <div class="flex items-center justify-between">
      <a
        href={`/blog/${post.slug}`}
        class="font-[Oxanium] text-xs uppercase
               tracking-[0.15em] text-[#f4ebe3]/35
               transition hover:text-[#f4ebe3]"
      >
        Read post
      </a>

      {#if isOwner}
        <div class="flex items-center gap-2">
          <a
            href={`/blog/edit/${post.slug}`}
            class="rounded-lg border border-[#ffe1ca]/10
                   px-3 py-2 font-[Oxanium] text-[10px]
                   uppercase tracking-[0.12em]
                   text-[#f4ebe3]/50 transition
                   hover:border-[#ffe1ca]/20
                   hover:text-[#f4ebe3]"
          >
            Edit
          </a>

          <button
            type="button"
            onclick={deletePost}
            disabled={deleting}
            class="rounded-lg border border-red-300/10
                   px-3 py-2 font-[Oxanium] text-[10px]
                   uppercase tracking-[0.12em]
                   text-red-200/40 transition
                   hover:border-red-300/20
                   hover:text-red-200/70
                   disabled:cursor-not-allowed
                   disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      {:else}
        <span
          class="text-lg text-[#f4ebe3]/20 transition
                 group-hover:text-[#f4ebe3]/50"
        >
          →
        </span>
      {/if}
    </div>
  </div>
</article>
