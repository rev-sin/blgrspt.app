export type PostSearchFilterInput = {
  adminScope: boolean;
  listingOwn: boolean;
  userId?: string | null;
  status: string | null;
  visibility: string | null;
  tag: string | null;
  authorId: string | null;
};

function quoteFilterValue(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

export function buildPostSearchFilters(input: PostSearchFilterInput): string | undefined {
  const parts: string[] = [];

  if (input.adminScope) {
    // Admins can search every post.
  } else if (input.listingOwn && input.userId) {
    parts.push(`authorId:${quoteFilterValue(input.userId)}`);
  } else {
    parts.push("status:published", "visibility:public");
  }

  if (input.status) {
    parts.push(`status:${quoteFilterValue(input.status)}`);
  }

  if (input.visibility) {
    parts.push(`visibility:${quoteFilterValue(input.visibility)}`);
  }

  if (input.tag) {
    parts.push(`tags:${quoteFilterValue(input.tag)}`);
  }

  if (input.authorId) {
    parts.push(`authorId:${quoteFilterValue(input.authorId)}`);
  }

  return parts.length > 0 ? parts.join(" AND ") : undefined;
}

export function buildPostNumericFilters(
  createdAfterDate?: Date,
  createdBeforeDate?: Date,
): string[] | undefined {
  const parts: string[] = [];

  if (createdAfterDate) {
    parts.push(`createdAt >= ${createdAfterDate.getTime()}`);
  }

  if (createdBeforeDate) {
    parts.push(`createdAt <= ${createdBeforeDate.getTime()}`);
  }

  return parts.length > 0 ? parts : undefined;
}

export function buildUserSearchFilters(adminsOnly: boolean): string | undefined {
  if (!adminsOnly) {
    return undefined;
  }

  return "role:admin";
}
