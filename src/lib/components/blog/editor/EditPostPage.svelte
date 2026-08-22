<script lang="ts">
  import EditorHeader from "./EditorHeader.svelte";
  import EditorMeta from "./EditorMeta.svelte";
  import MarkdownEditor from "./MarkdownEditor.svelte";

  interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    tags: string[];
    status: "draft" | "published";
    visibility: "private" | "unlisted" | "public";
    contentType: string;
  }

  interface Props {
    post: Post;
    backHref?: string;
  }

  let { post, backHref = "/dashboard" }: Props = $props();

  let title = $state(post.title);
  let slug = $state(post.slug);
  let excerpt = $state(post.excerpt ?? "");
  let tags = $state<string[]>([...post.tags]);
  let content = $state(post.content);

  let saving = $state(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleTitleChange(value: string) {
    title = value;
  }

  function handleSlugChange(value: string) {
    slug = generateSlug(value);
  }

  async function updatePost(
    status: "draft" | "published",
    visibility: "private" | "unlisted" | "public",
  ) {
    if (saving) return;

    saving = true;

    const payload = {
      title: title.trim(),
      newSlug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content,
      coverImage: post.coverImage,
      tags: [...tags],
      status,
      visibility,
    };

    try {
      const response = await fetch(
        `/api/v1/posts/${encodeURIComponent(post.slug)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Update failed:", result);
        return;
      }

      if (
        status === "draft" ||
        visibility === "private" ||
        visibility === "unlisted"
      ) {
        window.location.href = backHref;
        return;
      }

      window.location.href = `/blog/${result.data.slug}`;
    } catch (error) {
      console.error("Update request failed:", error);
    } finally {
      saving = false;
    }
  }

  function saveDraft() {
    return updatePost("draft", "private");
  }

  function publishPrivate() {
    return updatePost("published", "private");
  }

  function publishUnlisted() {
    return updatePost("published", "unlisted");
  }

  function publishPublic() {
    return updatePost("published", "public");
  }
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  <div class="mx-auto w-full max-w-7xl px-6 py-6">
    <EditorHeader
      {saving}
      {backHref}
      onSave={saveDraft}
      onPublishPrivate={publishPrivate}
      onPublishUnlisted={publishUnlisted}
      onPublishPublic={publishPublic}
    />

    <div class="mt-8">
      <EditorMeta
        bind:title
        bind:slug
        bind:excerpt
        bind:tags
        onTitleInput={handleTitleChange}
        onSlugInput={handleSlugChange}
      />
    </div>

    <div class="mt-8">
      <MarkdownEditor bind:content />
    </div>
  </div>
</div>
