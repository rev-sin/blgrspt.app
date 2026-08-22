<script lang="ts">
  import { Chart } from "@tanstack/charts/svelte";

  import * as Card from "$lib/components/ui/card";
  import { createVisibilityChart } from "$lib/charts/visibility";
  import { countPostVisibility } from "$lib/posts/labels";
  import type { PostListItem } from "$lib/posts/types";

  interface Props {
    posts: PostListItem[];
  }

  let { posts }: Props = $props();

  const definition = $derived(
    createVisibilityChart(countPostVisibility(posts)),
  );
</script>

<Card.Root
  class="rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] shadow-none ring-0"
>
  <Card.Header>
    <Card.Title
      class="font-[Oxanium] text-sm uppercase tracking-[0.18em] text-[#f7eee7]/70"
    >
      Visibility
    </Card.Title>
    <Card.Description class="text-[#f7eee7]/45">
      Counts from the current admin post search.
    </Card.Description>
  </Card.Header>
  <Card.Content class="text-[#f4ebe3]/70">
    <Chart {definition} ariaLabel="Post visibility counts" height={220} />
  </Card.Content>
</Card.Root>
