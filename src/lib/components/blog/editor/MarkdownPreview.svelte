<script lang="ts">
  import { onMount, tick } from "svelte";
  import { marked } from "marked";

  interface Props {
    content: string;
  }

  let { content }: Props = $props();

  let rendered = $derived(marked.parse(content));

  let container: HTMLElement | null = null;

  let mermaid: typeof import("mermaid").default | null = null;

  onMount(async () => {
    try {
      const module = await import("mermaid");

      mermaid = module.default;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "dark",
        fontFamily: "Noto Sans Variable, sans-serif",

        themeVariables: {
          background: "#0d0a09",

          primaryColor: "#1b1411",
          primaryTextColor: "#f4ebe3",
          primaryBorderColor: "#d7a77e",

          lineColor: "#d7a77e",

          secondaryColor: "#17110f",
          secondaryTextColor: "#f4ebe3",
          secondaryBorderColor: "#d7a77e",

          tertiaryColor: "#1b1411",
          tertiaryTextColor: "#f4ebe3",
          tertiaryBorderColor: "#d7a77e",

          edgeLabelBackground: "#15100e",

          clusterBkg: "#17110f",
          clusterBorder: "#d7a77e",
        },
      });

      await renderMermaid();
    } catch (error) {
      console.error("Mermaid initialization failed:", error);
    }
  });

  $effect(() => {
    if (!mermaid) {
      return;
    }

    updateMarkdown(content);
  });

  async function updateMarkdown(markdown: string) {
    rendered = await marked.parse(markdown);

    await tick();

    await renderMermaid();
  }

  async function renderMermaid() {
    if (!container || !mermaid) {
      return;
    }

    const blocks = container.querySelectorAll("pre code.language-mermaid");

    if (!blocks.length) {
      return;
    }

    for (const block of blocks) {
      const pre = block.parentElement;

      if (!pre) {
        continue;
      }

      const source = block.textContent?.trim();

      if (!source) {
        continue;
      }

      const wrapper = document.createElement("div");

      wrapper.className = "mermaid-container";

      wrapper.textContent = "Rendering diagram...";

      pre.replaceWith(wrapper);

      try {
        const id = `mermaid-${crypto.randomUUID()}`;

        const { svg } = await mermaid.render(id, source);

        wrapper.innerHTML = svg;
      } catch (error) {
        console.error("Mermaid rendering failed:", error);

        wrapper.className = "mermaid-container mermaid-error";

        wrapper.textContent = "Unable to render Mermaid diagram.";
      }
    }
  }
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
    <article bind:this={container} class="markdown-content p-6">
      {@html rendered}
    </article>
  </div>
</section>

<style>
  .markdown-content {
    color: rgba(244, 235, 227, 0.75);
    font-size: 15px;
    line-height: 1.75;
  }

  .markdown-content :global(h1),
  .markdown-content :global(h2),
  .markdown-content :global(h3),
  .markdown-content :global(h4),
  .markdown-content :global(h5),
  .markdown-content :global(h6) {
    font-family: Oxanium, sans-serif;
    color: #f4ebe3;
    font-weight: 500;
    line-height: 1.25;
  }

  .markdown-content :global(h1) {
    font-size: 2rem;
    margin: 2rem 0 1rem;
  }

  .markdown-content :global(h2) {
    font-size: 1.5rem;
    margin: 1.75rem 0 0.85rem;
  }

  .markdown-content :global(h3) {
    font-size: 1.25rem;
    margin: 1.5rem 0 0.75rem;
  }

  .markdown-content :global(h4) {
    font-size: 1.1rem;
    margin: 1.25rem 0 0.65rem;
  }

  .markdown-content :global(h5),
  .markdown-content :global(h6) {
    font-size: 1rem;
    margin: 1rem 0 0.5rem;
  }

  .markdown-content :global(p) {
    margin: 0 0 1rem;
  }

  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    margin: 0 0 1rem;
    padding-left: 1.5rem;
  }

  .markdown-content :global(ul) {
    list-style-type: disc;
  }

  .markdown-content :global(ol) {
    list-style-type: decimal;
  }

  .markdown-content :global(ul ul) {
    list-style-type: circle;
  }

  .markdown-content :global(ul ul ul) {
    list-style-type: square;
  }

  .markdown-content :global(li) {
    margin: 0.35rem 0;
  }

  .markdown-content :global(strong) {
    color: #f4ebe3;
    font-weight: 600;
  }

  .markdown-content :global(em) {
    color: rgba(244, 235, 227, 0.9);
  }

  .markdown-content :global(del) {
    color: rgba(244, 235, 227, 0.45);
    text-decoration: line-through;
  }

  .markdown-content :global(blockquote) {
    margin: 1.25rem 0;
    padding: 0.25rem 0 0.25rem 1rem;
    border-left: 2px solid rgba(215, 167, 126, 0.4);
    color: rgba(244, 235, 227, 0.55);
  }

  .markdown-content :global(blockquote p:last-child) {
    margin-bottom: 0;
  }

  .markdown-content :global(code) {
    padding: 0.15rem 0.35rem;
    border-radius: 0.35rem;
    background: rgba(255, 255, 255, 0.05);
    color: #d7a77e;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      monospace;
    font-size: 0.9em;
  }

  .markdown-content :global(pre) {
    overflow-x: auto;
    margin: 1.25rem 0;
    padding: 1.25rem;
    border: 1px solid rgba(255, 225, 202, 0.08);
    border-radius: 0.8rem;
    background: #0d0a09;
  }

  .markdown-content :global(pre code) {
    display: block;
    padding: 0;
    background: transparent;
    color: #f4ebe3;
    font-size: 14px;
    line-height: 1.7;
  }

  .markdown-content :global(table) {
    width: 100%;
    margin: 1.5rem 0;
    border-collapse: collapse;
  }

  .markdown-content :global(th),
  .markdown-content :global(td) {
    padding: 0.7rem 0.9rem;
    border: 1px solid rgba(255, 225, 202, 0.1);
    text-align: left;
  }

  .markdown-content :global(th) {
    background: #1b1411;
    color: #f4ebe3;
    font-weight: 600;
  }

  .markdown-content :global(tr:nth-child(even) td) {
    background: rgba(255, 225, 202, 0.02);
  }

  .markdown-content :global(a) {
    color: #d7a77e;
    text-decoration: none;
  }

  .markdown-content :global(a:hover) {
    text-decoration: underline;
  }

  .markdown-content :global(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.25rem 0;
    border-radius: 0.75rem;
  }

  .markdown-content :global(hr) {
    margin: 2rem 0;
    border: 0;
    border-top: 1px solid rgba(255, 225, 202, 0.1);
  }

  .markdown-content :global(input[type="checkbox"]) {
    margin-right: 0.5rem;
    accent-color: #d7a77e;
  }

  :global(.mermaid-container) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 1.5rem 0;
    padding: 1.5rem;
    overflow-x: auto;
    border: 1px solid rgba(255, 225, 202, 0.08);
    border-radius: 0.8rem;
    background: #0d0a09;
  }

  :global(.mermaid-container svg) {
    display: block;
    max-width: 100%;
    height: auto;
  }

  :global(.mermaid-error) {
    color: rgba(248, 113, 113, 0.8);
    font-family: monospace;
    font-size: 13px;
  }
</style>
