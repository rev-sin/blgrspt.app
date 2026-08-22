<script lang="ts" module>
  import {
    createSortedRowModel,
    rowSortingFeature,
    sortFns,
    tableFeatures,
    type ColumnDef,
  } from "@tanstack/svelte-table";

  import { visibilityLabel } from "$lib/posts/labels";
  import type { PostListItem } from "$lib/posts/types";

  const features = tableFeatures({
    rowSortingFeature,
    sortedRowModel: createSortedRowModel(),
    sortFns,
  });

  const columns: Array<ColumnDef<typeof features, PostListItem>> = [
    {
      accessorKey: "title",
      header: "Post",
    },
    {
      accessorKey: "authorName",
      header: "Author",
    },
    {
      id: "visibility",
      accessorFn: (row) => visibilityLabel(row),
      header: "Visibility",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
    },
  ];
</script>

<script lang="ts">
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { createTable, FlexRender } from "@tanstack/svelte-table";

  import VisibilityChart from "./VisibilityChart.svelte";
  import BlogHeader from "../BlogHeader.svelte";
  import SearchForm from "$lib/components/forms/SearchForm.svelte";
  import * as Alert from "$lib/components/ui/alert";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { queryKeys } from "$lib/query/keys";
  import { deletePost, listPosts } from "$lib/query/posts";
  import { listUsers, setUserRole, type AdminUser } from "$lib/query/users";

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

  const queryClient = useQueryClient();

  let userSearch = $state("");
  let usersSearched = $state(false);
  let postSearch = $state("");

  const adminsQuery = createQuery(() => ({
    queryKey: queryKeys.users.list({ role: "admin", limit: "100" }),
    queryFn: () => listUsers({ role: "admin", limit: "100" }),
  }));

  const usersQuery = createQuery(() => ({
    queryKey: queryKeys.users.list({ q: userSearch, limit: "20" }),
    queryFn: () => {
      const params: Record<string, string> = { limit: "20" };

      if (userSearch) {
        params.q = userSearch;
      }

      return listUsers(params);
    },
    enabled: usersSearched,
  }));

  const postsQuery = createQuery(() => {
    const params: Record<string, string> = {
      scope: "admin",
      sort: "updatedAt",
      order: "desc",
      limit: "50",
    };

    if (postSearch) {
      params.q = postSearch;
    }

    return {
      queryKey: queryKeys.posts.list(params),
      queryFn: () => listPosts(params),
    };
  });

  const setRoleMutation = createMutation(() => ({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "user";
    }) => setUserRole(userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  }));

  const deletePostMutation = createMutation(() => ({
    mutationFn: (slug: string) => deletePost(slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  }));

  const table = createTable({
    features,
    columns,
    get data() {
      return postsQuery.data ?? [];
    },
  });

  const pageError = $derived(
    adminsQuery.error?.message ??
      usersQuery.error?.message ??
      postsQuery.error?.message ??
      setRoleMutation.error?.message ??
      deletePostMutation.error?.message ??
      "",
  );

  function searchUsers(query: string) {
    userSearch = query;
    usersSearched = true;
  }

  function searchPosts(query: string) {
    postSearch = query;
  }

  function handleSetRole(target: AdminUser, role: "admin" | "user") {
    if (target.id === user.id || setRoleMutation.isPending) {
      return;
    }

    setRoleMutation.mutate({ userId: target.id, role });
  }

  function handleDeletePost(post: PostListItem) {
    if (deletePostMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${post.title}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deletePostMutation.mutate(post.slug);
  }
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  <BlogHeader {user} active="admin" isAdmin={true} />

  <main class="mx-auto w-full max-w-6xl px-6 py-16">
    <section>
      <p
        class="mb-4 font-[Oxanium] text-xs uppercase tracking-[0.3em] text-[#f7eee7]/40"
      >
        Admin
      </p>

      <h1
        class="font-[Oxanium] text-5xl font-medium tracking-[-2px] text-[#f7eee7] md:text-6xl"
      >
        Dashboard
      </h1>

      <p class="mt-4 text-sm text-[#f7eee7]/45">
        Promote admins and search posts by title or author.
      </p>
    </section>

    {#if pageError}
      <Alert.Root
        variant="destructive"
        class="mt-8 border-red-400/10 bg-red-400/[0.03]"
      >
        <Alert.Description class="text-red-300/70"
          >{pageError}</Alert.Description
        >
      </Alert.Root>
    {/if}

    <section class="mt-12 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <Card.Root
        class="rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] shadow-none ring-0"
      >
        <Card.Header>
          <Card.Title
            class="font-[Oxanium] text-sm uppercase tracking-[0.18em] text-[#f7eee7]/70"
          >
            Admins
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {#if adminsQuery.isPending}
            <p class="text-sm text-[#f4ebe3]/30">Loading...</p>
          {:else if (adminsQuery.data ?? []).length === 0}
            <p class="text-sm text-[#f4ebe3]/30">No admins yet.</p>
          {:else}
            <ul class="space-y-3">
              {#each adminsQuery.data ?? [] as admin (admin.id)}
                <li class="min-w-0">
                  <p class="truncate text-sm text-[#f7eee7]">{admin.name}</p>
                  <p class="truncate text-xs text-[#f4ebe3]/40">
                    {admin.email}
                  </p>
                </li>
              {/each}
            </ul>
          {/if}
        </Card.Content>
      </Card.Root>

      <Card.Root
        class="rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] shadow-none ring-0"
      >
        <Card.Header>
          <Card.Title
            class="font-[Oxanium] text-sm uppercase tracking-[0.18em] text-[#f7eee7]/70"
          >
            Add admins
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <SearchForm
            class="mt-4 flex flex-wrap gap-3"
            placeholder="Search name or email"
            pending={usersQuery.isFetching && usersSearched}
            onSearch={searchUsers}
          />

          {#if !usersSearched}
            <p class="mt-6 text-sm text-[#f4ebe3]/30">
              Search for a user to grant admin access.
            </p>
          {:else if (usersQuery.data ?? []).length === 0}
            <p class="mt-6 text-sm text-[#f4ebe3]/30">No users found.</p>
          {:else}
            <div class="mt-6 divide-y divide-[#ffe1ca]/10">
              {#each usersQuery.data ?? [] as result (result.id)}
                <div class="flex items-center justify-between gap-4 py-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm text-[#f7eee7]">{result.name}</p>
                    <p class="truncate text-xs text-[#f4ebe3]/40">
                      {result.email}
                    </p>
                  </div>

                  {#if result.id === user.id}
                    <Badge class="font-[Oxanium] text-[#d7a77e]/80">You</Badge>
                  {:else if result.isAdmin}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      class="h-auto rounded-lg border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] tracking-[0.12em] text-[#f4ebe3]/50"
                      disabled={setRoleMutation.isPending}
                      onclick={() => handleSetRole(result, "user")}
                    >
                      {setRoleMutation.isPending &&
                      setRoleMutation.variables?.userId === result.id
                        ? "Saving..."
                        : "Remove admin"}
                    </Button>
                  {:else}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      class="h-auto rounded-lg border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] tracking-[0.12em] text-[#d7a77e]"
                      disabled={setRoleMutation.isPending}
                      onclick={() => handleSetRole(result, "admin")}
                    >
                      {setRoleMutation.isPending &&
                      setRoleMutation.variables?.userId === result.id
                        ? "Saving..."
                        : "Make admin"}
                    </Button>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </section>

    {#if postsQuery.data}
      <section class="mt-12">
        <VisibilityChart posts={postsQuery.data} />
      </section>
    {/if}

    <section class="mt-12">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            class="font-[Oxanium] text-sm uppercase tracking-[0.18em] text-[#f7eee7]/70"
          >
            Posts
          </h2>
          <p class="mt-2 text-sm text-[#f7eee7]/45">
            Search by title or author, then edit any post.
          </p>
        </div>

        <SearchForm
          class="flex flex-wrap gap-3"
          placeholder="Search title or user"
          pending={postsQuery.isFetching}
          onSearch={searchPosts}
        />
      </div>

      {#if postsQuery.isPending}
        <div class="py-20 text-center">
          <p class="text-sm text-[#f4ebe3]/30">Searching posts...</p>
        </div>
      {:else if (postsQuery.data ?? []).length === 0}
        <div
          class="mt-8 rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] p-12 text-center"
        >
          <p class="text-sm text-[#f4ebe3]/30">No posts found.</p>
        </div>
      {:else}
        <div
          class="mt-8 overflow-hidden rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f]"
        >
          <Table.Root>
            <Table.Header>
              {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                <Table.Row class="border-[#ffe1ca]/10 hover:bg-transparent">
                  {#each headerGroup.headers as header (header.id)}
                    <Table.Head class="text-[#f4ebe3]/35">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        class="h-auto px-0 font-[Oxanium] text-[10px] tracking-[0.18em] text-[#f4ebe3]/35 hover:bg-transparent hover:text-[#f4ebe3]"
                        disabled={!header.column.getCanSort()}
                        onclick={header.column.getToggleSortingHandler()}
                      >
                        <FlexRender {header} />
                        {#if header.column.getIsSorted() === "asc"}
                          ↑
                        {:else if header.column.getIsSorted() === "desc"}
                          ↓
                        {/if}
                      </Button>
                    </Table.Head>
                  {/each}
                </Table.Row>
              {/each}
            </Table.Header>
            <Table.Body>
              {#each table.getRowModel().rows as row (row.id)}
                {@const post = row.original}
                <Table.Row class="border-[#ffe1ca]/10 hover:bg-[#ffe1ca]/5">
                  <Table.Cell class="whitespace-normal">
                    <a href={`/blog/${post.slug}`} class="min-w-0">
                      <span
                        class="truncate font-[Oxanium] text-base font-medium tracking-[-0.3px] text-[#f7eee7]"
                      >
                        {post.title}
                      </span>
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      href={`/u/${post.authorId}`}
                      class="truncate text-sm text-[#f4ebe3]/50 hover:text-[#f4ebe3]"
                    >
                      {post.authorName}
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge class="font-[Oxanium] text-[#d7a77e]/80">
                      {visibilityLabel(post)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <div class="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        href={`/blog/edit/${post.slug}`}
                        variant="outline"
                        size="sm"
                        class="h-auto rounded-lg border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] tracking-[0.12em] text-[#f4ebe3]/50"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onclick={() => handleDeletePost(post)}
                        disabled={deletePostMutation.isPending}
                        class="h-auto rounded-lg px-3 py-2 font-[Oxanium] text-[10px] tracking-[0.12em]"
                      >
                        {deletePostMutation.isPending &&
                        deletePostMutation.variables === post.slug
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}
    </section>
  </main>
</div>
