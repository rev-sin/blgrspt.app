<script lang="ts">
  import AdminDashboard from "./admin/AdminDashboard.svelte";
  import QueryProvider from "$lib/components/query/QueryProvider.svelte";

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }

  interface Props {
    user: User;
  }

  let { user }: Props = $props();
</script>

<QueryProvider>
  <AdminDashboard {user} />
</QueryProvider>
