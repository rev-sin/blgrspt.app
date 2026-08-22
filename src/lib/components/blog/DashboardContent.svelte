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
      id: "visibility",
      accessorFn: (row) => visibilityLabel(row),
      header: "Visibility",
    },
    {
      id: "date",
      accessorFn: (row) => row.updatedAt ?? row.publishedAt ?? row.createdAt,
      header: "Date",
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

  import BlogHeader from "./BlogHeader.svelte";
  import CopyLinkButton from "./CopyLinkButton.svelte";
  import CreatePostButton from "./CreatePostButton.svelte";
  import * as Alert from "$lib/components/ui/alert";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Table from "$lib/components/ui/table";
  import { formatPostDate, postSnippet } from "$lib/posts/labels";
  import { queryKeys } from "$lib/query/keys";
  import { deletePost, listPosts } from "$lib/query/posts";

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

  const queryClient = useQueryClient();

  const postsQuery = createQuery(() => ({
    queryKey: queryKeys.posts.list({
      mine: "true",
      sort: "updatedAt",
      order: "desc",
      limit: "100",
    }),
    queryFn: () =>
      listPosts({
        mine: "true",
        sort: "updatedAt",
        order: "desc",
        limit: "100",
      }),
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
  <BlogHeader {user} active="dashboard" {isAdmin} />

  <main class="mx-auto w-full max-w-6xl px-6 py-16">
    <div class="flex items-start justify-between gap-8">
      <section>
        <p
          class="mb-4 font-[Oxanium] text-xs uppercase tracking-[0.3em] text-[#f7eee7]/40"
        >
          Dashboard
        </p>

        <h1
          class="font-[Oxanium] text-5xl font-medium tracking-[-2px] text-[#f7eee7] md:text-6xl"
        >
          Content
        </h1>

        <p class="mt-4 text-sm text-[#f7eee7]/45">
          All of your posts in one place.
        </p>
      </section>

      <CreatePostButton />
    </div>

    <section class="mt-12">
      {#if postsQuery.isPending}
        <div class="py-20 text-center">
          <p class="text-sm text-[#f4ebe3]/30">Loading posts...</p>
        </div>
      {:else if postsQuery.isError}
        <Alert.Root
          variant="destructive"
          class="border-red-400/10 bg-red-400/[0.03]"
        >
          <Alert.Description class="text-red-300/70">
            {postsQuery.error.message}
          </Alert.Description>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onclick={() => postsQuery.refetch()}
            class="mt-2 justify-self-start text-[#d7a77e] hover:text-[#f4ebe3]"
          >
            Try again
          </Button>
        </Alert.Root>
      {:else if (postsQuery.data ?? []).length === 0}
        <div
          class="rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] p-12 text-center"
        >
          <p class="text-sm text-[#f4ebe3]/30">No posts yet.</p>
        </div>
      {:else}
        <div
          class="overflow-hidden rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f]"
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
                      <p class="mt-1 line-clamp-1 text-sm text-[#f4ebe3]/40">
                        {postSnippet(post)}
                      </p>
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge class="font-[Oxanium] text-[#d7a77e]/80">
                      {visibilityLabel(post)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell
                    class="font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#f4ebe3]/35"
                  >
                    {formatPostDate(
                      post.updatedAt ?? post.publishedAt ?? post.createdAt,
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div class="flex flex-wrap items-center justify-end gap-2">
                      <CopyLinkButton slug={post.slug} />
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
