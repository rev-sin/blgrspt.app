<script lang="ts">
  import { Textarea } from "$lib/components/ui/textarea";

  interface Props {
    value: string;
    textarea?: HTMLTextAreaElement | null;
  }

  let { value = $bindable(""), textarea = $bindable(null) }: Props = $props();
</script>

<section
  class="flex min-h-0 flex-col border-b border-[#ffe1ca]/10 md:border-b-0 md:border-r"
>
  <div
    class="flex h-11 shrink-0 items-center border-b border-[#ffe1ca]/10 px-5"
  >
    <span
      class="font-[Oxanium] text-[11px] font-medium uppercase tracking-[0.22em] text-[#f4ebe3]/35"
    >
      Markdown
    </span>
  </div>

  <div class="min-h-0 flex-1 overflow-auto">
    <Textarea
      bind:ref={textarea}
      bind:value
      spellcheck={false}
      placeholder="# Start writing..."
      class="block h-full min-h-full w-full resize-none rounded-none border-0 bg-transparent p-6 font-mono text-[15px] leading-7 text-[#f4ebe3]/90 placeholder:text-[#f4ebe3]/20"
    />
  </div>
</section>
