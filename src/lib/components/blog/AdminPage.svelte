<script lang="ts">
  import { onMount } from "svelte";

  import BlogHeader from "./BlogHeader.svelte";
  import { Button } from "$lib/components/ui/button";

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }

  interface AdminUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    isAdmin: boolean;
  }

  interface AdminPost {
    id: string;
    authorId: string;
    authorName: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    status: "draft" | "published";
    visibility: "private" | "unlisted" | "public";
    updatedAt: string;
    createdAt: string;
    publishedAt: string | null;
  }

  interface Props {
    user: User;
  }

  let { user }: Props = $props();

  let admins = $state<AdminUser[]>([]);
  let userResults = $state<AdminUser[]>([]);
  let postResults = $state<AdminPost[]>([]);

  let userQuery = $state("");
  let postQuery = $state("");

  let loadingAdmins = $state(true);
  let searchingUsers = $state(false);
  let searchingPosts = $state(false);
  let updatingUserId = $state("");
  let deletingSlug = $state("");
  let error = $state("");

  function visibilityLabel(post: AdminPost) {
    if (post.status === "draft") {
      return "Draft";
    }

    if (post.visibility === "private") {
      return "Private";
    }

    if (post.visibility === "unlisted") {
      return "Unlisted";
    }

    return "Public";
  }

  async function loadAdmins() {
    loadingAdmins = true;
    error = "";

    try {
      const response = await fetch("/api/v1/admin/users?role=admin&limit=100");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Failed to load admins");
      }

      admins = result.data ?? [];
    } catch (err) {
      console.error("Failed to load admins:", err);
      error = err instanceof Error ? err.message : "Failed to load admins";
    } finally {
      loadingAdmins = false;
    }
  }

  async function searchUsers(event?: SubmitEvent) {
    event?.preventDefault();

    searchingUsers = true;
    error = "";

    try {
      const params = new URLSearchParams({
        limit: "20",
      });

      if (userQuery.trim()) {
        params.set("q", userQuery.trim());
      }

      const response = await fetch(`/api/v1/admin/users?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Failed to search users");
      }

      userResults = result.data ?? [];
    } catch (err) {
      console.error("Failed to search users:", err);
      error = err instanceof Error ? err.message : "Failed to search users";
    } finally {
      searchingUsers = false;
    }
  }

  async function searchPosts(event?: SubmitEvent) {
    event?.preventDefault();

    searchingPosts = true;
    error = "";

    try {
      const params = new URLSearchParams({
        scope: "admin",
        sort: "updatedAt",
        order: "desc",
        limit: "50",
      });

      if (postQuery.trim()) {
        params.set("q", postQuery.trim());
      }

      const response = await fetch(`/api/v1/posts?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Failed to search posts");
      }

      postResults = result.data ?? [];
    } catch (err) {
      console.error("Failed to search posts:", err);
      error = err instanceof Error ? err.message : "Failed to search posts";
    } finally {
      searchingPosts = false;
    }
  }

  async function setRole(target: AdminUser, role: "admin" | "user") {
    if (updatingUserId || target.id === user.id) {
      return;
    }

    updatingUserId = target.id;
    error = "";

    try {
      const response = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: target.id,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Failed to update role");
      }

      const updated = result.data as AdminUser;

      userResults = userResults.map((item) =>
        item.id === updated.id ? updated : item,
      );

      await loadAdmins();
    } catch (err) {
      console.error("Failed to update role:", err);
      error = err instanceof Error ? err.message : "Failed to update role";
    } finally {
      updatingUserId = "";
    }
  }

  async function deletePost(post: AdminPost) {
    if (deletingSlug) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${post.title}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deletingSlug = post.slug;

    try {
      const response = await fetch(
        `/api/v1/posts/${encodeURIComponent(post.slug)}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Failed to delete post");
      }

      postResults = postResults.filter((item) => item.id !== post.id);
    } catch (err) {
      console.error("Failed to delete post:", err);
      error = err instanceof Error ? err.message : "Failed to delete post";
    } finally {
      deletingSlug = "";
    }
  }

  onMount(() => {
    loadAdmins();
    searchPosts();
  });
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

    {#if error}
      <div
        class="mt-8 rounded-2xl border border-red-400/10 bg-red-400/[0.03] p-6"
      >
        <p class="text-sm text-red-300/70">{error}</p>
      </div>
    {/if}

    <section class="mt-12 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div class="rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] p-6">
        <h2
          class="font-[Oxanium] text-sm uppercase tracking-[0.18em] text-[#f7eee7]/70"
        >
          Admins
        </h2>

        {#if loadingAdmins}
          <p class="mt-4 text-sm text-[#f4ebe3]/30">Loading...</p>
        {:else if admins.length === 0}
          <p class="mt-4 text-sm text-[#f4ebe3]/30">No admins yet.</p>
        {:else}
          <ul class="mt-4 space-y-3">
            {#each admins as admin (admin.id)}
              <li class="min-w-0">
                <p class="truncate text-sm text-[#f7eee7]">{admin.name}</p>
                <p class="truncate text-xs text-[#f4ebe3]/40">{admin.email}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] p-6">
        <h2
          class="font-[Oxanium] text-sm uppercase tracking-[0.18em] text-[#f7eee7]/70"
        >
          Add admins
        </h2>

        <form class="mt-4 flex flex-wrap gap-3" onsubmit={searchUsers}>
          <input
            bind:value={userQuery}
            type="search"
            placeholder="Search name or email"
            class="h-10 min-w-56 flex-1 rounded-xl border border-[#ffe1ca]/10 bg-[#15100e] px-4 text-sm text-[#f4ebe3] outline-none placeholder:text-[#f4ebe3]/30 focus:border-[#ffe1ca]/25"
          />

          <Button
            type="submit"
            size="sm"
            class="rounded-xl"
            disabled={searchingUsers}
          >
            {searchingUsers ? "Searching..." : "Search"}
          </Button>
        </form>

        {#if userResults.length === 0}
          <p class="mt-6 text-sm text-[#f4ebe3]/30">
            Search for a user to grant admin access.
          </p>
        {:else}
          <div class="mt-6 divide-y divide-[#ffe1ca]/10">
            {#each userResults as result (result.id)}
              <div class="flex items-center justify-between gap-4 py-3">
                <div class="min-w-0">
                  <p class="truncate text-sm text-[#f7eee7]">{result.name}</p>
                  <p class="truncate text-xs text-[#f4ebe3]/40">
                    {result.email}
                  </p>
                </div>

                {#if result.id === user.id}
                  <span
                    class="font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#d7a77e]/80"
                  >
                    You
                  </span>
                {:else if result.isAdmin}
                  <button
                    type="button"
                    class="rounded-lg border border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#f4ebe3]/50 transition hover:text-[#f4ebe3] disabled:opacity-40"
                    disabled={updatingUserId === result.id}
                    onclick={() => setRole(result, "user")}
                  >
                    {updatingUserId === result.id
                      ? "Saving..."
                      : "Remove admin"}
                  </button>
                {:else}
                  <button
                    type="button"
                    class="rounded-lg border border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#d7a77e] transition hover:text-[#f4ebe3] disabled:opacity-40"
                    disabled={updatingUserId === result.id}
                    onclick={() => setRole(result, "admin")}
                  >
                    {updatingUserId === result.id ? "Saving..." : "Make admin"}
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </section>

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

        <form class="flex flex-wrap gap-3" onsubmit={searchPosts}>
          <input
            bind:value={postQuery}
            type="search"
            placeholder="Search title or user"
            class="h-10 min-w-56 rounded-xl border border-[#ffe1ca]/10 bg-[#17110f] px-4 text-sm text-[#f4ebe3] outline-none placeholder:text-[#f4ebe3]/30 focus:border-[#ffe1ca]/25"
          />

          <Button
            type="submit"
            size="sm"
            class="rounded-xl"
            disabled={searchingPosts}
          >
            {searchingPosts ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      {#if searchingPosts && postResults.length === 0}
        <div class="py-20 text-center">
          <p class="text-sm text-[#f4ebe3]/30">Searching posts...</p>
        </div>
      {:else if postResults.length === 0}
        <div
          class="mt-8 rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f] p-12 text-center"
        >
          <p class="text-sm text-[#f4ebe3]/30">No posts found.</p>
        </div>
      {:else}
        <div
          class="mt-8 overflow-hidden rounded-2xl border border-[#ffe1ca]/10 bg-[#17110f]"
        >
          <div
            class="hidden grid-cols-[minmax(0,1fr)_10rem_8rem_12rem] gap-4 border-b border-[#ffe1ca]/10 px-5 py-3 md:grid"
          >
            <span
              class="font-[Oxanium] text-[10px] uppercase tracking-[0.18em] text-[#f4ebe3]/35"
            >
              Post
            </span>
            <span
              class="font-[Oxanium] text-[10px] uppercase tracking-[0.18em] text-[#f4ebe3]/35"
            >
              Author
            </span>
            <span
              class="font-[Oxanium] text-[10px] uppercase tracking-[0.18em] text-[#f4ebe3]/35"
            >
              Visibility
            </span>
            <span
              class="text-right font-[Oxanium] text-[10px] uppercase tracking-[0.18em] text-[#f4ebe3]/35"
            >
              Actions
            </span>
          </div>

          {#each postResults as post (post.id)}
            <div
              class="grid gap-3 border-b border-[#ffe1ca]/10 px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_10rem_8rem_12rem] md:items-center md:gap-4"
            >
              <a href={`/blog/${post.slug}`} class="min-w-0">
                <h3
                  class="truncate font-[Oxanium] text-base font-medium tracking-[-0.3px] text-[#f7eee7]"
                >
                  {post.title}
                </h3>
              </a>

              <a
                href={`/u/${post.authorId}`}
                class="truncate text-sm text-[#f4ebe3]/50 hover:text-[#f4ebe3]"
              >
                {post.authorName}
              </a>

              <span
                class="w-fit rounded-full border border-[#ffe1ca]/15 px-2.5 py-1 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#d7a77e]/80"
              >
                {visibilityLabel(post)}
              </span>

              <div
                class="flex flex-wrap items-center justify-start gap-2 md:justify-end"
              >
                <a
                  href={`/blog/edit/${post.slug}`}
                  class="rounded-lg border border-[#ffe1ca]/10 px-3 py-2 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-[#f4ebe3]/50 transition hover:border-[#ffe1ca]/20 hover:text-[#f4ebe3]"
                >
                  Edit
                </a>

                <button
                  type="button"
                  onclick={() => deletePost(post)}
                  disabled={deletingSlug === post.slug}
                  class="rounded-lg border border-red-300/10 px-3 py-2 font-[Oxanium] text-[10px] uppercase tracking-[0.12em] text-red-200/40 transition hover:border-red-300/20 hover:text-red-200/70 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deletingSlug === post.slug ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </main>
</div>
