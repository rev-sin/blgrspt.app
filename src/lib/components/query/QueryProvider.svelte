<script lang="ts">
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import type { Snippet } from "svelte";

  import { createQueryClient } from "$lib/query/client";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  const queryClient = createQueryClient();
</script>

<QueryClientProvider client={queryClient} {children} />
