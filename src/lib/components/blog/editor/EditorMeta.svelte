<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";

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
  <div>
    <Label for="title" class="mb-2 text-[#f7eee7]/40">Title</Label>

    <Input
      id="title"
      bind:value={title}
      oninput={(event) => {
        onTitleInput?.(event.currentTarget.value);
      }}
      placeholder="Write your title..."
      class="w-full border-0 border-b border-[#ffe1ca]/10 bg-transparent px-0 py-3 text-2xl font-medium text-[#f7eee7] placeholder:text-[#f7eee7]/20"
    />
  </div>

  <div>
    <Label for="slug" class="mb-2 text-[#f7eee7]/40">Slug</Label>

    <Input
      id="slug"
      bind:value={slug}
      oninput={(event) => {
        onSlugInput?.(event.currentTarget.value);
      }}
      placeholder="my-first-post"
      class="h-auto w-full rounded-xl border border-[#ffe1ca]/10 bg-[#1b1411] px-4 py-3 text-sm text-[#f7eee7] placeholder:text-[#f7eee7]/20"
    />
  </div>

  <div>
    <Label for="excerpt" class="mb-2 text-[#f7eee7]/40">Excerpt</Label>

    <Textarea
      id="excerpt"
      bind:value={excerpt}
      maxlength={500}
      rows={3}
      placeholder="A short description of your post..."
      class="min-h-24 w-full rounded-xl border border-[#ffe1ca]/10 bg-[#1b1411] px-4 py-3 text-sm text-[#f7eee7] placeholder:text-[#f7eee7]/20"
    />

    <div class="mt-2 text-right text-[11px] text-[#f7eee7]/25">
      {excerpt.length}/500
    </div>
  </div>

  <div>
    <Label for="tags" class="mb-2 text-[#f7eee7]/40">Tags</Label>

    <div
      class="flex flex-wrap gap-2 rounded-xl border border-[#ffe1ca]/10 bg-[#1b1411] p-3"
    >
      {#each tags as tag}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onclick={() => removeTag(tag)}
          class="h-auto rounded-lg bg-white/6 px-3 py-1.5 text-xs font-normal tracking-normal text-[#f7eee7]/70 normal-case hover:bg-white/10 hover:text-[#f7eee7]"
        >
          {tag} ×
        </Button>
      {/each}

      <Input
        id="tags"
        bind:value={tagInput}
        onkeydown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addTag();
          }
        }}
        placeholder="Add tag..."
        class="h-auto min-w-30 flex-1 border-0 bg-transparent px-0 py-1 text-sm text-[#f7eee7] placeholder:text-[#f7eee7]/20"
      />
    </div>

    <p class="mt-2 text-[11px] text-[#f7eee7]/25">Press Enter to add a tag</p>
  </div>
</section>
