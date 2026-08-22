<script lang="ts">
  interface Props {
    slug: string;
  }

  let { slug }: Props = $props();

  let copied = $state(false);

  async function copyLink() {
    const url = `${window.location.origin}/blog/${slug}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy link", url);
    }

    copied = true;
    window.setTimeout(() => {
      copied = false;
    }, 1600);
  }
</script>

<button
  type="button"
  onclick={copyLink}
  class="rounded-lg border border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#f4ebe3]/50 transition hover:border-[#ffe1ca]/20 hover:text-[#f4ebe3]"
>
  {copied ? "Copied" : "Copy link"}
</button>
