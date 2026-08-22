import type { PostListItem } from "./types";

export type VisibilityBucket = {
  label: "Draft" | "Private" | "Unlisted" | "Public";
  value: number;
};

export function visibilityLabel(post: Pick<PostListItem, "status" | "visibility">) {
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

export function countPostVisibility(
  posts: Array<Pick<PostListItem, "status" | "visibility">>,
): VisibilityBucket[] {
  const counts: Record<VisibilityBucket["label"], number> = {
    Draft: 0,
    Private: 0,
    Unlisted: 0,
    Public: 0,
  };

  for (const post of posts) {
    counts[visibilityLabel(post)] += 1;
  }

  return [
    { label: "Draft", value: counts.Draft },
    { label: "Private", value: counts.Private },
    { label: "Unlisted", value: counts.Unlisted },
    { label: "Public", value: counts.Public },
  ];
}

export function formatPostDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function postSnippet(post: Pick<PostListItem, "excerpt" | "content">) {
  if (post.excerpt) {
    return post.excerpt;
  }

  return post.content.replace(/[#*`>-]/g, "").trim();
}
