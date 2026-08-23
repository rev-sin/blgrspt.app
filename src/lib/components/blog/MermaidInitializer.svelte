<script lang="ts">
  import { onMount } from "svelte";

  onMount(async () => {
    const hasMermaid = document.querySelector(
      ".markdown-content pre code.language-mermaid",
    );

    if (!hasMermaid) {
      return;
    }

    try {
      const { default: mermaid } = await import("mermaid");

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

      const blocks = document.querySelectorAll(
        ".markdown-content pre code.language-mermaid",
      );

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
    } catch (error) {
      console.error("Mermaid initialization failed:", error);
    }
  });
</script>
