<script lang="ts">
  import FeedContent from "./FeedContent.svelte";
  import QueryProvider from "$lib/components/query/QueryProvider.svelte";

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }

  interface Props {
    user: User;
    isAdmin?: boolean;
  }

  let { user, isAdmin = false }: Props = $props();
</script>

<QueryProvider>
  <FeedContent {user} {isAdmin} />
</QueryProvider>
