export const POST_STATUSES = ["draft", "published"] as const;
export const POST_VISIBILITIES = ["private", "unlisted", "public"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];
export type PostVisibility = (typeof POST_VISIBILITIES)[number];

export type PostAccessFields = {
  status: string;
  visibility: string;
  authorId: string;
};

export function isInPublicFeed(post: Pick<PostAccessFields, "status" | "visibility">): boolean {
  return post.status === "published" && post.visibility === "public";
}

export function isShareablePost(post: Pick<PostAccessFields, "status" | "visibility">): boolean {
  return (
    post.status === "published" && (post.visibility === "public" || post.visibility === "unlisted")
  );
}

export function canViewPost(
  post: PostAccessFields,
  userId: string | null | undefined,
  isAdmin = false,
): boolean {
  if (isAdmin) {
    return true;
  }

  if (isShareablePost(post)) {
    return true;
  }

  return Boolean(userId && post.authorId === userId);
}

export function canManagePost(
  post: Pick<PostAccessFields, "authorId">,
  userId: string | null | undefined,
  isAdmin = false,
): boolean {
  if (isAdmin) {
    return true;
  }

  return Boolean(userId && post.authorId === userId);
}

export function isRestrictedListQuery(status: string | null, visibility: string | null): boolean {
  return status === "draft" || visibility === "private" || visibility === "unlisted";
}
