<script lang="ts">
  import { Button } from "$lib/components/ui/button";

  import Bold from "@lucide/svelte/icons/bold";
  import Italic from "@lucide/svelte/icons/italic";
  import Heading from "@lucide/svelte/icons/heading";
  import List from "@lucide/svelte/icons/list";
  import ListOrdered from "@lucide/svelte/icons/list-ordered";
  import Quote from "@lucide/svelte/icons/quote";
  import Code from "@lucide/svelte/icons/code";
  import Link from "@lucide/svelte/icons/link";
  import Image from "@lucide/svelte/icons/image";

  interface Props {
    onFormat: (type: string) => void;
    onImage: () => void;
  }

  let { onFormat, onImage }: Props = $props();
</script>

<div
  class="flex h-12 shrink-0 items-center gap-1 border-t border-[#ffe1ca]/10 bg-[#17110f] px-3"
>
  <Button
    variant="ghost"
    size="icon"
    title="Bold"
    onclick={() => onFormat("bold")}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <Bold class="size-4" />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    title="Italic"
    onclick={() => onFormat("italic")}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <Italic class="size-4" />
  </Button>

  <div class="mx-1 h-5 w-px bg-[#ffe1ca]/10"></div>

  <Button
    variant="ghost"
    size="icon"
    title="Heading"
    onclick={() => onFormat("heading")}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <Heading class="size-4" />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    title="Bullet list"
    onclick={() => onFormat("bullet")}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <List class="size-4" />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    title="Numbered list"
    onclick={() => onFormat("ordered")}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <ListOrdered class="size-4" />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    title="Quote"
    onclick={() => onFormat("quote")}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <Quote class="size-4" />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    title="Code"
    onclick={() => onFormat("code")}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <Code class="size-4" />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    title="Link"
    onclick={() => onFormat("link")}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <Link class="size-4" />
  </Button>

  <div class="mx-1 h-5 w-px bg-[#ffe1ca]/10"></div>

  <Button
    variant="ghost"
    size="icon"
    title="Add image"
    onclick={onImage}
    class="size-8 rounded-lg text-[#f4ebe3]/55 hover:bg-white/5 hover:text-[#f4ebe3]"
  >
    <Image class="size-4" />
  </Button>
</div>
