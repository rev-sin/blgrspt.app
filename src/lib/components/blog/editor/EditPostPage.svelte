<script lang="ts">
  import EditorHeader from "./EditorHeader.svelte";
  import EditorMeta from "./EditorMeta.svelte";
  import MarkdownEditor from "./MarkdownEditor.svelte";
  import * as Alert from "$lib/components/ui/alert";
  import { apiErrorMessage, generateSlug } from "$lib/posts/slug";

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

  let { post: initialPost, backHref = "/dashboard" }: Props = $props();

  /*
   * The post is loaded once when the editor opens.
   *
   * We intentionally copy the prop into local editable state.
   * Using an effect avoids Svelte's "state_referenced_locally"
   * warning while preserving the editor's local state.
   */

  let initialized = $state(false);

  let title = $state("");
  let slug = $state("");
  let excerpt = $state("");
  let tags = $state<string[]>([]);
  let content = $state("");

  $effect(() => {
    if (initialized) {
      return;
    }

    title = initialPost.title;
    slug = initialPost.slug;
    excerpt = initialPost.excerpt ?? "";
    tags = [...initialPost.tags];
    content = initialPost.content;

    initialized = true;
  });

  let saving = $state(false);
  let error = $state("");

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
    if (saving) {
      return;
    }

    const nextTitle = title.trim();
    const nextSlug = generateSlug(slug || nextTitle);

    if (!nextTitle) {
      error = "Add a title before saving.";
      return;
    }

    if (!nextSlug) {
      error = "Add a slug before saving.";
      return;
    }

    if (status === "published" && !content.trim()) {
      error = "Write some content before publishing.";
      return;
    }

    saving = true;
    error = "";

    const payload = {
      title: nextTitle,
      newSlug: nextSlug,
      excerpt: excerpt.trim() || null,
      content,
      tags: [...tags],
      status,
      visibility,
    };

    try {
      const response = await fetch(
        `/api/v1/posts/${encodeURIComponent(initialPost.slug)}`,
        {
          method: "PUT",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        error = apiErrorMessage(result, "Failed to update post");
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
    } catch (err) {
      console.error("Update request failed:", err);
      error = "Failed to update post";
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

    {#if error}
      <Alert.Root
        variant="destructive"
        class="mt-6 border-red-400/10 bg-red-400/[0.03]"
      >
        <Alert.Description class="text-red-300/70">
          {error}
        </Alert.Description>
      </Alert.Root>
    {/if}

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
