<script lang="ts">
  import { createForm } from "@tanstack/svelte-form";
  import { z } from "zod";

  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";

  const searchSchema = z.object({
    q: z.string(),
  });

  interface Props {
    placeholder: string;
    submitLabel?: string;
    pending?: boolean;
    live?: boolean;
    class?: string;
    expanded?: boolean;
    listboxId?: string;
    activeOptionId?: string;
    onSearch: (query: string) => void;
    onkeydown?: (event: KeyboardEvent) => void;
    onfocus?: () => void;
    onblur?: (event: FocusEvent) => void;
  }

  let {
    placeholder,
    submitLabel = "Search",
    pending = false,
    live = false,
    class: className = "",
    expanded = false,
    listboxId,
    activeOptionId,
    onSearch,
    onkeydown,
    onfocus,
    onblur,
  }: Props = $props();

  const form = createForm(() => ({
    defaultValues: {
      q: "",
    },
    validators: {
      onSubmit: searchSchema,
    },
    onSubmit: async ({ value }) => {
      onSearch(value.q.trim());
    },
  }));
</script>

<form
  class={className}
  role={live ? "search" : undefined}
  onsubmit={(event) => {
    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit();
  }}
>
  <form.Field name="q">
    {#snippet children(field)}
      <Input
        name={field.name}
        value={field.state.value}
        onblur={(event) => {
          field.handleBlur();
          onblur?.(event);
        }}
        oninput={(event) => {
          const value = event.currentTarget.value;
          field.handleChange(value);

          if (live) {
            onSearch(value);
          }
        }}
        {onkeydown}
        {onfocus}
        type="search"
        {placeholder}
        autocomplete="off"
        autocorrect="off"
        spellcheck={false}
        role={live ? "combobox" : undefined}
        aria-autocomplete={live ? "list" : undefined}
        aria-expanded={live ? expanded : undefined}
        aria-controls={live ? listboxId : undefined}
        aria-activedescendant={live ? activeOptionId : undefined}
        class="h-10 min-w-56 flex-1 rounded-xl border border-[#ffe1ca]/10 bg-[#15100e] px-4 text-sm text-[#f4ebe3] placeholder:text-[#f4ebe3]/30"
      />
    {/snippet}
  </form.Field>

  {#if !live}
    <Button type="submit" size="sm" class="rounded-xl" disabled={pending}>
      {pending ? "Searching..." : submitLabel}
    </Button>
  {/if}
</form>
