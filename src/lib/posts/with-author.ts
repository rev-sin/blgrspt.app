import { post, user } from "$lib/db/schema";

export const postWithAuthorColumns = {
  id: post.id,
  authorId: post.authorId,
  authorName: user.name,
  authorImage: user.image,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  content: post.content,
  coverImage: post.coverImage,
  tags: post.tags,
  status: post.status,
  visibility: post.visibility,
  publishedAt: post.publishedAt,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  contentType: post.contentType,
};
