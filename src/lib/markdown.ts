import DOMPurify from "isomorphic-dompurify";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",

    highlight(code, lang) {
      const language = lang?.trim().toLowerCase();

      // Mermaid is rendered separately on the client.
      // Escape the source so it cannot inject HTML.
      if (language === "mermaid") {
        return escapeHtml(code);
      }

      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, {
          language,
        }).value;
      }

      return hljs.highlightAuto(code).value;
    },
  }),
);

export async function renderMarkdown(content: string): Promise<string> {
  const html = await marked.parse(content);

  return DOMPurify.sanitize(html);
}
