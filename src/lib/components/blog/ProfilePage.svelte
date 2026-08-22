<script lang="ts">
  import ProfileContent from "./ProfileContent.svelte";
  import QueryProvider from "$lib/components/query/QueryProvider.svelte";

  interface Profile {
    id: string;
    name: string;
    image: string | null;
  }

  interface CurrentUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }

  interface Props {
    profile: Profile;
    currentUser: CurrentUser | null;
    isAdmin?: boolean;
  }

  let { profile, currentUser, isAdmin = false }: Props = $props();
</script>

<QueryProvider>
  <ProfileContent {profile} {currentUser} {isAdmin} />
</QueryProvider>
