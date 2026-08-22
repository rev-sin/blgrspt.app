<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
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
  const badge = $derived(
    post.status === "draft"
      ? "Draft"
      : post.visibility === "private"
        ? "Private"
        : post.visibility === "unlisted"
          ? "Unlisted"
          : null,
  );

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

<Card.Root
  class="group rounded-2xl border border-[#ffe1ca]/10 bg-[#15100e] shadow-none ring-[#ffe1ca]/10 transition hover:border-[#ffe1ca]/20"
>
  <Card.Header class="flex flex-row items-center gap-3">
    <a
      href={`/u/${post.authorId}`}
      class="font-[Oxanium] text-xs uppercase tracking-[0.2em] text-[#d7a77e]/70 transition hover:text-[#f4ebe3]"
    >
      {post.authorName}
    </a>

    <span class="text-xs text-[#f4ebe3]/30">·</span>

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

    {#if badge}
      <Badge class="font-[Oxanium] text-[#d7a77e]/80">{badge}</Badge>
    {/if}
  </Card.Header>

  <Card.Content>
    <a href={`/blog/${post.slug}`} class="block">
      <h2
        class="font-[Oxanium] text-2xl font-medium tracking-[-0.5px] text-[#f7eee7]"
      >
        {post.title}
      </h2>

      {#if post.excerpt}
        <p class="mt-4 line-clamp-2 text-sm leading-7 text-[#f4ebe3]/45">
          {post.excerpt}
        </p>
      {:else}
        <p class="mt-4 line-clamp-2 text-sm leading-7 text-[#f4ebe3]/45">
          {post.content.replace(/[#*`>-]/g, "").trim()}
        </p>
      {/if}
    </a>
  </Card.Content>

  <Card.Footer class="border-t border-[#ffe1ca]/10">
    <div class="flex w-full items-center justify-between">
      <Button
        href={`/blog/${post.slug}`}
        variant="link"
        class="h-auto px-0 font-[Oxanium] text-xs tracking-[0.15em] text-[#f4ebe3]/35"
      >
        Read post
      </Button>

      {#if isOwner}
        <div class="flex items-center gap-2">
          <Button
            href={`/blog/edit/${post.slug}`}
            variant="outline"
            size="sm"
            class="h-auto rounded-lg border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] tracking-[0.12em] text-[#f4ebe3]/50"
          >
            Edit
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onclick={deletePost}
            disabled={deleting}
            class="h-auto rounded-lg px-3 py-2 font-[Oxanium] text-[10px] tracking-[0.12em]"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      {:else}
        <span
          class="text-lg text-[#f4ebe3]/20 transition group-hover:text-[#f4ebe3]/50"
        >
          →
        </span>
      {/if}
    </div>
  </Card.Footer>
</Card.Root>
