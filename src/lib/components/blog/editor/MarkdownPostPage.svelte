<script lang="ts">
  import EditorHeader from "./EditorHeader.svelte";
  import EditorMeta from "./EditorMeta.svelte";
  import MarkdownEditor from "./MarkdownEditor.svelte";

  let title = $state("");
  let slug = $state("");
  let excerpt = $state("");
  let tags = $state<string[]>([]);
  let content = $state("");

  let slugManuallyEdited = $state(false);
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

    if (!slugManuallyEdited) {
      slug = generateSlug(value);
    }
  }

  function handleSlugChange(value: string) {
    slugManuallyEdited = true;
    slug = generateSlug(value);
  }

  async function createPost(status: "draft" | "published") {
    if (saving) return;

    saving = true;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content,
      coverImage: null,
      tags: [...tags],
      status,
      contentType: "markdown",
    };

    try {
      const response = await fetch("/api/v1/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Create post failed:", result);
        return;
      }

      console.log("Post created:", result);

      // Redirect to blog after successful creation
      window.location.href = "/blog";
    } catch (error) {
      console.error("Create post request failed:", error);
    } finally {
      saving = false;
    }
  }
  function saveDraft() {
    return createPost("draft");
  }

  function publish() {
    return createPost("published");
  }
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  <div class="mx-auto w-full max-w-7xl px-6 py-6">
    <EditorHeader onSave={saveDraft} onPublish={publish} />

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
