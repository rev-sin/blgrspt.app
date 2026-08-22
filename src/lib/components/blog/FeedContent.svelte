<script lang="ts">
  import { keepPreviousData, createQuery } from "@tanstack/svelte-query";

  import BlogHeader from "./BlogHeader.svelte";
  import CreatePostButton from "./CreatePostButton.svelte";
  import PostCard from "./PostCard.svelte";
  import PostLookup from "./PostLookup.svelte";
  import SearchForm from "$lib/components/forms/SearchForm.svelte";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { queryKeys } from "$lib/query/keys";
  import { listPosts } from "$lib/query/posts";
  import type { PostListItem } from "$lib/posts/types";

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

  const LOOKUP_ID = "feed-post-lookup";

  let searchInput = $state("");
  let search = $state("");
  let lookupOpen = $state(false);
  let activeIndex = $state(0);

  $effect(() => {
    const value = searchInput.trim();
    const timeout = window.setTimeout(() => {
      search = value;
    }, 120);

    return () => window.clearTimeout(timeout);
  });

  const postsQuery = createQuery(() => {
    const params: Record<string, string> = {
      status: "published",
      visibility: "public",
      sort: "publishedAt",
      order: "desc",
      limit: search ? "20" : "10",
    };

    if (search) {
      params.q = search;
    }

    return {
      queryKey: queryKeys.posts.list(params),
      queryFn: () => listPosts(params),
      placeholderData: keepPreviousData,
    };
  });

  const lookupPosts = $derived((postsQuery.data ?? []).slice(0, 8));
  const showLookup = $derived(
    lookupOpen && search.length > 0 && lookupPosts.length > 0,
  );

  $effect(() => {
    void search;
    activeIndex = 0;
  });

  function openPost(post: PostListItem) {
    window.location.href = `/blog/${post.slug}`;
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (!showLookup) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % lookupPosts.length;
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + lookupPosts.length) % lookupPosts.length;
      return;
    }

    if (event.key === "Enter") {
      const post = lookupPosts[activeIndex];

      if (post) {
        event.preventDefault();
        openPost(post);
      }
    }

    if (event.key === "Escape") {
      lookupOpen = false;
    }
  }
</script>

<div class="min-h-screen w-full bg-[#15100e] text-[#f4ebe3]">
  <BlogHeader {user} active="feed" {isAdmin} />

  <main class="mx-auto w-full max-w-6xl px-6 py-16">
    <div class="flex items-start justify-between gap-8">
      <section>
        <p
          class="mb-4 font-[Oxanium] text-xs uppercase tracking-[0.3em] text-[#f7eee7]/40"
        >
          Feed
        </p>

        <h1
          class="font-[Oxanium] text-5xl font-medium tracking-[-2px] text-[#f7eee7] md:text-6xl"
        >
          Latest posts
        </h1>

        <p class="mt-4 text-sm text-[#f7eee7]/45">
          Public posts from everyone.
        </p>
      </section>

      <CreatePostButton />
    </div>

    <div class="relative mt-10">
      <SearchForm
        live
        class="flex flex-wrap gap-3"
        placeholder="Search titles, authors, tags"
        pending={postsQuery.isFetching}
        expanded={showLookup}
        listboxId={LOOKUP_ID}
        activeOptionId={showLookup
          ? `${LOOKUP_ID}-option-${activeIndex}`
          : undefined}
        onSearch={(query) => {
          searchInput = query;
          lookupOpen = query.trim().length > 0;
        }}
        onkeydown={handleSearchKeydown}
        onfocus={() => {
          lookupOpen = search.length > 0;
        }}
        onblur={() => {
          window.setTimeout(() => {
            lookupOpen = false;
          }, 120);
        }}
      />

      {#if showLookup}
        <PostLookup
          id={LOOKUP_ID}
          posts={lookupPosts}
          {activeIndex}
          onSelect={openPost}
          onHover={(index) => {
            activeIndex = index;
          }}
        />
      {/if}
    </div>

    <section class="mt-10">
      {#if postsQuery.isPending && !postsQuery.data}
        <div class="py-20 text-center">
          <p class="text-sm text-[#f4ebe3]/30">Loading feed...</p>
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
          <p class="text-sm text-[#f4ebe3]/30">
            {search ? "No matching posts." : "No public posts yet."}
          </p>
        </div>
      {:else}
        <div class="grid gap-5 md:grid-cols-2">
          {#each postsQuery.data ?? [] as post (post.id)}
            <PostCard {post} currentUserId={user.id} />
          {/each}
        </div>
      {/if}
    </section>
  </main>
</div>
