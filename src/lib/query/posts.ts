import type { PostListItem } from "$lib/posts/types";
import { fetchJson } from "./http";

type PostListResponse = {
  data: PostListItem[];
};

export async function listPosts(params: Record<string, string>) {
  const search = new URLSearchParams(params);
  const result = await fetchJson<PostListResponse>(`/api/v1/posts?${search.toString()}`);
  return result.data;
}

export function deletePost(slug: string) {
  return fetchJson<{ data?: { id: string } }>(`/api/v1/posts/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}
