<script lang="ts">
  import EditorHeader from "./EditorHeader.svelte";
  import EditorMeta from "./EditorMeta.svelte";
  import MarkdownEditor from "./MarkdownEditor.svelte";
  import * as Alert from "$lib/components/ui/alert";
  import { apiErrorMessage, generateSlug } from "$lib/posts/slug";

  let title = $state("");
  let slug = $state("");
  let excerpt = $state("");
  let tags = $state<string[]>([]);
  let content = $state("");

  let slugManuallyEdited = $state(false);
  let saving = $state(false);
  let error = $state("");

  function handleTitleChange(value: string) {
    title = value;

    if (!slugManuallyEdited) {
      slug = generateSlug(value);
    }
  }

  function handleSlugChange(value: string) {
    slugManuallyEdited = true;
    slug = generateSlug(value);
  }

  async function createPost(
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

    if (!slugManuallyEdited) {
      slug = nextSlug;
    }

    const payload = {
      title: nextTitle,
      slug: nextSlug,
      excerpt: excerpt.trim() || null,
      content,
      tags: [...tags],
      status,
      visibility,
      contentType: "markdown",
    };

    try {
      const response = await fetch("/api/v1/posts", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        error = apiErrorMessage(result, "Failed to create post");
        return;
      }

      if (
        status === "draft" ||
        visibility === "private" ||
        visibility === "unlisted"
      ) {
        window.location.href = "/dashboard";
        return;
      }

      window.location.href = `/blog/${result.data.slug}`;
    } catch (err) {
      console.error("Create post request failed:", err);
      error = "Failed to create post";
    } finally {
      saving = false;
    }
  }

  function saveDraft() {
    return createPost("draft", "private");
  }

  function publishPrivate() {
    return createPost("published", "private");
  }

  function publishUnlisted() {
    return createPost("published", "unlisted");
  }

  function publishPublic() {
    return createPost("published", "public");
  }
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  <div class="mx-auto w-full max-w-7xl px-6 py-6">
    <EditorHeader
      {saving}
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
        <Alert.Description class="text-red-300/70">{error}</Alert.Description>
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
