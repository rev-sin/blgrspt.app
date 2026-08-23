import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",

    highlight(code, lang) {
      const language = lang?.trim().toLowerCase();

      // Mermaid is handled separately on the client.
      if (language === "mermaid") {
        return code;
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

export async function renderMarkdown(content: string) {
  return marked.parse(content);
}
