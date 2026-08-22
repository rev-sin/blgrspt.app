import { POST_CONTENT_PREVIEW_LENGTH } from "./config";

export type PostSearchRecordInput = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  tags: string[];
  status: string;
  visibility: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt: Date | string | null;
};

export type PostSearchRecord = {
  objectID: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: string;
  visibility: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
};

export type UserSearchRecordInput = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
};

export type UserSearchRecord = {
  objectID: string;
  name: string;
  email: string;
  role: string;
};

function toTimestamp(value: Date | string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();

  return Number.isNaN(time) ? null : time;
}

export function toPostSearchRecord(post: PostSearchRecordInput): PostSearchRecord {
  return {
    objectID: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content.slice(0, POST_CONTENT_PREVIEW_LENGTH),
    tags: post.tags,
    status: post.status,
    visibility: post.visibility,
    authorId: post.authorId,
    authorName: post.authorName,
    authorEmail: post.authorEmail,
    createdAt: toTimestamp(post.createdAt) ?? 0,
    updatedAt: toTimestamp(post.updatedAt) ?? 0,
    publishedAt: toTimestamp(post.publishedAt),
  };
}

export function toUserSearchRecord(user: UserSearchRecordInput): UserSearchRecord {
  return {
    objectID: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
  };
}
