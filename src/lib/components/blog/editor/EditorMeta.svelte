<script lang="ts">
  interface Props {
    title?: string;
    slug?: string;
    excerpt?: string;
    tags?: string[];

    onTitleInput?: (value: string) => void;
    onSlugInput?: (value: string) => void;
  }

  let {
    title = $bindable(""),
    slug = $bindable(""),
    excerpt = $bindable(""),
    tags = $bindable<string[]>([]),
    onTitleInput,
    onSlugInput,
  }: Props = $props();

  let tagInput = $state("");

  function addTag() {
    const tag = tagInput.trim();

    if (!tag || tags.includes(tag)) {
      return;
    }

    tags = [...tags, tag];
    tagInput = "";
  }

  function removeTag(tag: string) {
    tags = tags.filter((item) => item !== tag);
  }
</script>

<section class="space-y-6">
  <!-- Title -->
  <div>
    <label
      for="title"
      class="mb-2 block font-[Oxanium] text-xs uppercase tracking-[0.18em] text-[#f7eee7]/40"
    >
      Title
    </label>

    <input
      id="title"
      bind:value={title}
      oninput={(event) => {
        onTitleInput?.((event.currentTarget as HTMLInputElement).value);
      }}
      placeholder="Write your title..."
      class="w-full border-0 border-b border-[#ffe1ca]/10 bg-transparent px-0 py-3 text-2xl font-medium text-[#f7eee7] outline-none placeholder:text-[#f7eee7]/20 focus:border-[#ffe1ca]/30"
    />
  </div>

  <!-- Slug -->
  <div>
    <label
      for="slug"
      class="mb-2 block font-[Oxanium] text-xs uppercase tracking-[0.18em] text-[#f7eee7]/40"
    >
      Slug
    </label>

    <input
      id="slug"
      bind:value={slug}
      oninput={(event) => {
        onSlugInput?.((event.currentTarget as HTMLInputElement).value);
      }}
      placeholder="my-first-post"
      class="w-full rounded-xl border border-[#ffe1ca]/10 bg-[#1b1411] px-4 py-3 text-sm text-[#f7eee7] outline-none placeholder:text-[#f7eee7]/20 focus:border-[#ffe1ca]/25"
    />
  </div>

  <!-- Excerpt -->
  <div>
    <label
      for="excerpt"
      class="mb-2 block font-[Oxanium] text-xs uppercase tracking-[0.18em] text-[#f7eee7]/40"
    >
      Excerpt
    </label>

    <textarea
      id="excerpt"
      bind:value={excerpt}
      maxlength="500"
      rows="3"
      placeholder="A short description of your post..."
      class="w-full resize-none rounded-xl border border-[#ffe1ca]/10 bg-[#1b1411] px-4 py-3 text-sm text-[#f7eee7] outline-none placeholder:text-[#f7eee7]/20 focus:border-[#ffe1ca]/25"
    ></textarea>

    <div class="mt-2 text-right text-[11px] text-[#f7eee7]/25">
      {excerpt.length}/500
    </div>
  </div>

  <!-- Tags -->
  <div>
    <label
      for="tags"
      class="mb-2 block font-[Oxanium] text-xs uppercase tracking-[0.18em] text-[#f7eee7]/40"
    >
      Tags
    </label>

    <div
      class="flex flex-wrap gap-2 rounded-xl border border-[#ffe1ca]/10 bg-[#1b1411] p-3"
    >
      {#each tags as tag}
        <button
          type="button"
          onclick={() => removeTag(tag)}
          class="rounded-lg bg-white/6 px-3 py-1.5 text-xs text-[#f7eee7]/70 transition hover:bg-white/10 hover:text-[#f7eee7]"
        >
          {tag} ×
        </button>
      {/each}

      <input
        id="tags"
        bind:value={tagInput}
        onkeydown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addTag();
          }
        }}
        placeholder="Add tag..."
        class="min-w-30 flex-1 bg-transparent text-sm text-[#f7eee7] outline-none placeholder:text-[#f7eee7]/20"
      />
    </div>

    <p class="mt-2 text-[11px] text-[#f7eee7]/25">Press Enter to add a tag</p>
  </div>
</section>
