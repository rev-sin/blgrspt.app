<script lang="ts">
  import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils.js";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    "data-slot": dataSlot = "textarea",
    ...restProps
  }: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
  bind:this={ref}
  data-slot={dataSlot}
  class={cn(
    "resize-none rounded-none border border-transparent border-b-input bg-transparent px-0 py-3 text-base transition-[color,border-color] focus-visible:border-b-ring aria-invalid:border-b-destructive md:text-sm dark:aria-invalid:border-b-destructive/50 flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
    className,
  )}
  bind:value
  {...restProps}></textarea>
