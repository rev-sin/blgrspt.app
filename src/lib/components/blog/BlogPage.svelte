<script lang="ts">
  import DashboardContent from "./DashboardContent.svelte";
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
  <DashboardContent {user} {isAdmin} />
</QueryProvider>
