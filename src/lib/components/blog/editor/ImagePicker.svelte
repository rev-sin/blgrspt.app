<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";

  interface Props {
    open: boolean;
    onSelect: (url: string, alt?: string) => void;
  }

  let { open = $bindable(false), onSelect }: Props = $props();

  let url = $state("");
  let alt = $state("");

  function selectUrl() {
    if (!url.trim()) return;

    onSelect(url.trim(), alt.trim() || "image");

    url = "";
    alt = "";
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="border-[#ffe1ca]/10 bg-[#15100e] text-[#f7eee7]">
    <Dialog.Header>
      <Dialog.Title class="font-[Oxanium]">Add image</Dialog.Title>

      <Dialog.Description class="text-[#f7eee7]/45">
        Choose where you want to get your image from.
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-3 py-4">
      <Button variant="outline" class="justify-start">
        Upload from computer
      </Button>

      <Button variant="outline" class="justify-start">Google Drive</Button>

      <div class="my-2 h-px bg-[#ffe1ca]/10"></div>

      <div class="space-y-3">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="text-xs text-[#f7eee7]/40"> Or paste an image URL </label>

        <input
          bind:value={url}
          placeholder="https://..."
          class="w-full rounded-xl border border-[#ffe1ca]/10 bg-white/2.5 px-4 py-3 text-sm outline-none"
        />

        <input
          bind:value={alt}
          placeholder="Image description"
          class="w-full rounded-xl border border-[#ffe1ca]/10 bg-white/2.5 px-4 py-3 text-sm outline-none"
        />

        <Button class="w-full" disabled={!url.trim()} onclick={selectUrl}>
          Insert Image
        </Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
