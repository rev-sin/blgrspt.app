<script lang="ts">
  import { Button } from "$lib/components/ui/button";

  interface Props {
    saving?: boolean;
    onSave: () => void;
    onPublish: () => void;
  }

  let { saving = false, onSave, onPublish }: Props = $props();
</script>

<header class="border-b border-[#ffe1ca]/10 bg-[#15100e]/95 backdrop-blur-xl">
  <div
    class="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-6"
  >
    <a
      href="/blog"
      class="font-[Oxanium] text-sm text-[#f7eee7]/60 transition hover:text-[#f7eee7]"
    >
      ← Back
    </a>

    <div class="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={saving}
        onclick={onSave}
        class="rounded-xl border-[#ffe2cd]/10 bg-white/3 text-[#f5eee8] hover:bg-white/[0.07] hover:text-[#f5eee8]"
      >
        {saving ? "Saving..." : "Save Draft"}
      </Button>

      <Button
        size="sm"
        disabled={saving}
        onclick={onPublish}
        class="rounded-xl bg-[#f4ebe3] text-[#15100e] hover:bg-[#fff7f0]"
      >
        Publish
      </Button>
    </div>
  </div>
</header>
