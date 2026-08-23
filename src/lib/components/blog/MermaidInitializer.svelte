<script lang="ts">
  import { onMount } from "svelte";

  onMount(async () => {
    // Mermaid is loaded dynamically in the browser; keep TypeScript from
    // requiring a local module declaration for the optional dependency.
    // @ts-expect-error Mermaid may not expose declarations in this project.
    const { default: mermaid } = await import("mermaid");

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: "Noto Sans Variable, sans-serif",
      themeVariables: {
        background: "#15100e",
        primaryColor: "#1b1411",
        primaryTextColor: "#f4ebe3",
        primaryBorderColor: "#d7a77e",
        lineColor: "#d7a77e",
        secondaryColor: "#17110f",
        tertiaryColor: "#1b1411",
        edgeLabelBackground: "#15100e",
        clusterBkg: "#17110f",
        clusterBorder: "#ffe1ca",
      },
    });

    const blocks = document.querySelectorAll(
      ".markdown-content pre code.language-mermaid",
    );

    if (blocks.length === 0) {
      return;
    }

    blocks.forEach((block) => {
      const pre = block.parentElement;

      if (!pre) {
        return;
      }

      const source = block.textContent?.trim();

      if (!source) {
        return;
      }

      const container = document.createElement("div");

      container.className = "mermaid";
      container.textContent = source;

      pre.replaceWith(container);
    });

    try {
      await mermaid.run({
        querySelector: ".markdown-content .mermaid",
      });
    } catch (error) {
      console.error("Mermaid rendering failed:", error);
    }
  });
</script>
