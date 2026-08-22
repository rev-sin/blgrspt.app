<script lang="ts">
  import { marked } from "marked";

  interface Post {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    tags: string[];
    contentType: "markdown" | "text" | "tex";
    publishedAt: string | null;
    createdAt: string;
  }

  interface Props {
    post: Post;
  }

  let { post }: Props = $props();

  let renderedMarkdown = $derived(
    post.contentType === "markdown" ? marked.parse(post.content) : "",
  );

  function formatDate(date: string | null) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<div class="min-h-screen bg-[#15100e] text-[#f4ebe3]">
  <main class="mx-auto w-full max-w-4xl px-6 py-16">
    <a
      href="/blog"
      class="font-[Oxanium] text-xs uppercase tracking-[0.2em] text-[#f7eee7]/30 transition hover:text-[#f7eee7]/60"
    >
      ← Back to blog
    </a>

    <article class="mt-12">
      <header>
        <div class="flex flex-wrap items-center gap-3">
          <span
            class="font-[Oxanium] text-[10px] uppercase tracking-[0.2em] text-[#f7eee7]/30"
          >
            {post.contentType}
          </span>

          {#if post.publishedAt}
            <span class="text-[#f7eee7]/15">•</span>

            <time
              class="font-[Oxanium] text-[10px] uppercase tracking-[0.15em] text-[#f7eee7]/30"
              datetime={post.publishedAt}
            >
              {formatDate(post.publishedAt)}
            </time>
          {/if}
        </div>

        <h1
          class="mt-5 font-[Oxanium] text-5xl font-medium tracking-[-2px] text-[#f7eee7] md:text-6xl"
        >
          {post.title}
        </h1>

        {#if post.excerpt}
          <p class="mt-6 text-lg leading-8 text-[#f7eee7]/45">
            {post.excerpt}
          </p>
        {/if}

        {#if post.tags.length > 0}
          <div class="mt-6 flex flex-wrap gap-2">
            {#each post.tags as tag}
              <span
                class="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-[#f7eee7]/40"
              >
                #{tag}
              </span>
            {/each}
          </div>
        {/if}
      </header>

      <div class="my-10 h-px bg-[#ffe1ca]/10"></div>

      {#if post.contentType === "markdown"}
        <article
          class="prose prose-invert max-w-none
                 prose-headings:font-[Oxanium]
                 prose-headings:font-medium
                 prose-headings:text-[#f4ebe3]
                 prose-p:text-[#f4ebe3]/75
                 prose-p:leading-8
                 prose-li:text-[#f4ebe3]/75
                 prose-strong:text-[#f4ebe3]
                 prose-code:text-[#f4ebe3]/80
                 prose-code:before:content-none
                 prose-code:after:content-none
                 prose-a:text-[#d7a77e]
                 prose-a:no-underline
                 hover:prose-a:underline
                 prose-blockquote:border-[#d7a77e]/30
                 prose-blockquote:text-[#f4ebe3]/50"
        >
          {@html renderedMarkdown}
        </article>
      {:else if post.contentType === "text"}
        <div class="whitespace-pre-wrap text-base leading-8 text-[#f4ebe3]/75">
          {post.content}
        </div>
      {:else if post.contentType === "tex"}
        <div
          class="whitespace-pre-wrap font-mono text-sm leading-8 text-[#f4ebe3]/75"
        >
          {post.content}
        </div>
      {:else}
        <p class="text-sm text-red-300">Unsupported content type.</p>
      {/if}
    </article>
  </main>
</div>
