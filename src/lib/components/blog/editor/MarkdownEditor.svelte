<script lang="ts">
  import MarkdownPane from "./MarkdownPane.svelte";
  import MarkdownPreview from "./MarkdownPreview.svelte";
  import EditorToolbar from "./EditorToolbar.svelte";

  interface Props {
    content?: string;
  }

  let { content = $bindable("") }: Props = $props();

  let textarea: HTMLTextAreaElement | null = $state(null);
  let editorContainer: HTMLDivElement | null = $state(null);

  function getTextarea() {
    if (textarea && editorContainer?.contains(textarea)) {
      return textarea;
    }

    textarea = editorContainer?.querySelector("textarea") ?? null;

    return textarea;
  }

  function formatMarkdown(type: string) {
    const textarea = getTextarea();

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = content.slice(start, end);

    let before = "";
    let after = "";
    let replacement = selected;

    switch (type) {
      case "bold":
        before = "**";
        after = "**";
        break;

      case "italic":
        before = "*";
        after = "*";
        break;

      case "heading":
        before = "## ";
        break;

      case "bullet":
        before = "- ";
        break;

      case "ordered":
        before = "1. ";
        break;

      case "quote":
        before = "> ";
        break;

      case "code":
        before = "`";
        after = "`";
        break;

      case "link":
        replacement = selected || "link text";
        before = "[";
        after = "](https://example.com)";
        break;

      default:
        return;
    }

    replacement = `${before}${replacement}${after}`;

    content = content.slice(0, start) + replacement + content.slice(end);

    requestAnimationFrame(() => {
      const textarea = getTextarea();

      if (!textarea) return;

      const cursorPosition = start + replacement.length;

      textarea.focus();

      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  function handleImage() {
    const textarea = getTextarea();

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = content.slice(start, end);

    const imageMarkdown = `![${selected || "image"}](image-url)`;

    content = content.slice(0, start) + imageMarkdown + content.slice(end);

    requestAnimationFrame(() => {
      const textarea = getTextarea();

      if (!textarea) return;

      const cursorPosition = start + imageMarkdown.length;

      textarea.focus();

      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  }
</script>

<div
  bind:this={editorContainer}
  class="flex h-155 w-full flex-col overflow-hidden rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f]"
>
  <div class="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
    <MarkdownPane bind:value={content} />

    <MarkdownPreview {content} />
  </div>

  <EditorToolbar onFormat={formatMarkdown} onImage={handleImage} />
</div>
