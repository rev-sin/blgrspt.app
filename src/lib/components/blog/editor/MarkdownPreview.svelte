<script lang="ts">
  import { marked } from "marked";

  interface Props {
    content: string;
  }

  let { content }: Props = $props();

  let rendered = $derived(marked.parse(content));
</script>

<section class="flex min-h-0 flex-col">
  <div
    class="flex h-11 shrink-0 items-center border-b border-[#ffe1ca]/10 px-5"
  >
    <span
      class="font-[Oxanium] text-[11px] font-medium uppercase tracking-[0.22em] text-[#f4ebe3]/35"
    >
      Preview
    </span>
  </div>

  <div class="min-h-0 flex-1 overflow-auto">
    <article class="markdown-preview p-6">
      {@html rendered}
    </article>
  </div>
</section>

<style>
  .markdown-preview {
    color: rgba(244, 235, 227, 0.75);
    line-height: 1.75;
    font-size: 15px;
  }

  .markdown-preview :global(h1),
  .markdown-preview :global(h2),
  .markdown-preview :global(h3),
  .markdown-preview :global(h4) {
    font-family: Oxanium, sans-serif;
    color: #f4ebe3;
    font-weight: 500;
    line-height: 1.25;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .markdown-preview :global(h1) {
    font-size: 2rem;
  }

  .markdown-preview :global(h2) {
    font-size: 1.5rem;
  }

  .markdown-preview :global(h3) {
    font-size: 1.25rem;
  }

  .markdown-preview :global(p) {
    margin: 0 0 1rem;
  }

  .markdown-preview :global(ul),
  .markdown-preview :global(ol) {
    margin: 0 0 1rem;
    padding-left: 1.5rem;
  }

  .markdown-preview :global(ul) {
    list-style-type: disc;
  }

  .markdown-preview :global(ol) {
    list-style-type: decimal;
  }

  .markdown-preview :global(li) {
    margin: 0.3rem 0;
  }

  .markdown-preview :global(strong) {
    color: #f4ebe3;
    font-weight: 600;
  }

  .markdown-preview :global(em) {
    color: rgba(244, 235, 227, 0.9);
  }

  .markdown-preview :global(blockquote) {
    margin: 1rem 0;
    padding-left: 1rem;
    border-left: 2px solid rgba(215, 167, 126, 0.35);
    color: rgba(244, 235, 227, 0.5);
  }

  .markdown-preview :global(code) {
    padding: 0.15rem 0.35rem;
    border-radius: 0.35rem;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(244, 235, 227, 0.9);
    font-family: monospace;
    font-size: 0.9em;
  }

  .markdown-preview :global(pre) {
    overflow-x: auto;
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid rgba(255, 225, 202, 0.08);
    border-radius: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
  }

  .markdown-preview :global(pre code) {
    padding: 0;
    background: transparent;
  }

  .markdown-preview :global(a) {
    color: #d7a77e;
    text-decoration: none;
  }

  .markdown-preview :global(a:hover) {
    text-decoration: underline;
  }

  .markdown-preview :global(img) {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 0.75rem;
  }

  .markdown-preview :global(hr) {
    margin: 1.5rem 0;
    border: 0;
    border-top: 1px solid rgba(255, 225, 202, 0.1);
  }
</style>
