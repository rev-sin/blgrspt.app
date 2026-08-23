<script lang="ts">
  import MarkdownPane from "./MarkdownPane.svelte";
  import MarkdownPreview from "./MarkdownPreview.svelte";
  import EditorToolbar from "./EditorToolbar.svelte";

  interface Props {
    content?: string;
  }

  let { content = $bindable("") }: Props = $props();

  let textarea: HTMLTextAreaElement | null = $state(null);

  function setSelection(
    textarea: HTMLTextAreaElement,
    start: number,
    end: number,
  ) {
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    });
  }

  function getSelectedLines(value: string, start: number, end: number) {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;

    const nextNewline = value.indexOf("\n", end);
    const lineEnd = nextNewline === -1 ? value.length : nextNewline;

    return {
      start: lineStart,
      end: lineEnd,
      text: value.slice(lineStart, lineEnd),
    };
  }

  function formatInline(before: string, after: string) {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = content.slice(start, end);

    const replacement = `${before}${selected || "text"}${after}`;

    content = content.slice(0, start) + replacement + content.slice(end);

    const selectionStart = start + before.length;
    const selectionEnd = selectionStart + (selected || "text").length;

    setSelection(textarea, selectionStart, selectionEnd);
  }

  function formatBlock(prefix: string) {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lines = getSelectedLines(content, start, end);

    const formatted = lines.text
      .split("\n")
      .map((line) => {
        if (!line.trim()) {
          return prefix.trim() === ">" ? ">" : line;
        }

        return `${prefix}${line}`;
      })
      .join("\n");

    content =
      content.slice(0, lines.start) + formatted + content.slice(lines.end);

    const selectionStart = lines.start;
    const selectionEnd = lines.start + formatted.length;

    setSelection(textarea, selectionStart, selectionEnd);
  }

  function toggleHeading(level: 1 | 2 | 3) {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lines = getSelectedLines(content, start, end);

    const prefix = `${"#".repeat(level)} `;

    const formatted = lines.text
      .split("\n")
      .map((line) => {
        const withoutHeading = line.replace(/^#{1,6}\s+/, "");

        if (!withoutHeading.trim()) {
          return line;
        }

        if (line.startsWith(prefix)) {
          return withoutHeading;
        }

        return `${prefix}${withoutHeading}`;
      })
      .join("\n");

    content =
      content.slice(0, lines.start) + formatted + content.slice(lines.end);

    setSelection(textarea, lines.start, lines.start + formatted.length);
  }

  function toggleList(type: "bullet" | "ordered") {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lines = getSelectedLines(content, start, end);

    const sourceLines = lines.text.split("\n");

    const isAlreadyFormatted = sourceLines.every((line) => {
      if (!line.trim()) return true;

      if (type === "bullet") {
        return /^[-*+]\s+/.test(line);
      }

      return /^\d+\.\s+/.test(line);
    });

    const formatted = sourceLines
      .map((line, index) => {
        if (!line.trim()) return line;

        if (isAlreadyFormatted) {
          if (type === "bullet") {
            return line.replace(/^[-*+]\s+/, "");
          }

          return line.replace(/^\d+\.\s+/, "");
        }

        if (type === "bullet") {
          return `- ${line.replace(/^\d+\.\s+|^[-*+]\s+/, "")}`;
        }

        return `${index + 1}. ${line.replace(/^\d+\.\s+|^[-*+]\s+/, "")}`;
      })
      .join("\n");

    content =
      content.slice(0, lines.start) + formatted + content.slice(lines.end);

    setSelection(textarea, lines.start, lines.start + formatted.length);
  }

  function toggleQuote() {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const lines = getSelectedLines(content, start, end);

    const sourceLines = lines.text.split("\n");

    const isQuoted = sourceLines.every(
      (line) => !line.trim() || /^>\s?/.test(line),
    );

    const formatted = sourceLines
      .map((line) => {
        if (!line.trim()) return line;

        if (isQuoted) {
          return line.replace(/^>\s?/, "");
        }

        return `> ${line}`;
      })
      .join("\n");

    content =
      content.slice(0, lines.start) + formatted + content.slice(lines.end);

    setSelection(textarea, lines.start, lines.start + formatted.length);
  }

  function insertLink() {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = content.slice(start, end);

    const text = selected || "link text";

    const replacement = `[${text}](https://example.com)`;

    content = content.slice(0, start) + replacement + content.slice(end);

    const textStart = start + 1;
    const textEnd = textStart + text.length;

    setSelection(textarea, textStart, textEnd);
  }

  function insertImage() {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = content.slice(start, end);

    const replacement = `![${selected || "image"}](https://example.com/image.png)`;

    content = content.slice(0, start) + replacement + content.slice(end);

    const altStart = start + 2;
    const altEnd = altStart + (selected || "image").length;

    setSelection(textarea, altStart, altEnd);
  }

  function insertCode() {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = content.slice(start, end);

    // If multiple lines are selected, create a fenced code block.
    if (selected.includes("\n")) {
      const replacement = `\`\`\`ts\n${selected}\n\`\`\``;

      content = content.slice(0, start) + replacement + content.slice(end);

      setSelection(textarea, start + 7, start + 7 + selected.length);

      return;
    }

    formatInline("`", "`");
  }

  function formatMarkdown(type: string) {
    switch (type) {
      case "bold":
        formatInline("**", "**");
        break;

      case "italic":
        formatInline("*", "*");
        break;

      case "heading":
        toggleHeading(2);
        break;

      case "h1":
        toggleHeading(1);
        break;

      case "h2":
        toggleHeading(2);
        break;

      case "h3":
        toggleHeading(3);
        break;

      case "bullet":
        toggleList("bullet");
        break;

      case "ordered":
        toggleList("ordered");
        break;

      case "quote":
        toggleQuote();
        break;

      case "code":
        insertCode();
        break;

      case "link":
        insertLink();
        break;
    }
  }
</script>

<div
  class="flex h-155 w-full flex-col overflow-hidden rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f]"
>
  <div class="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
    <MarkdownPane bind:value={content} bind:textarea />

    <MarkdownPreview {content} />
  </div>

  <EditorToolbar onFormat={formatMarkdown} onImage={insertImage} />
</div>
