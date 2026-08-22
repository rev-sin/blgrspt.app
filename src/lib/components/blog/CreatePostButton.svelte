<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";

  let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Create Post +</Button>

<Dialog.Root bind:open>
  <Dialog.Content class="border-[#ffe1ca]/10 bg-[#15100e] text-[#f7eee7]">
    <Dialog.Header>
      <Dialog.Title class="font-[Oxanium] text-xl">Create a post</Dialog.Title>

      <Dialog.Description class="text-[#f7eee7]/45">
        Choose how you want to write your post.
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-3 py-4">
      <Button
        variant="outline"
        class="justify-start"
        onclick={() => (window.location.href = "/blog/create/markdown")}
      >
        Markdown
      </Button>

      <Button variant="outline" class="justify-start">Text</Button>

      <Button variant="outline" class="justify-start">TeX</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
