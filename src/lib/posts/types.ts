export type PostStatus = "draft" | "published";
export type PostVisibility = "private" | "unlisted" | "public";

export type PostListItem = {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  status: PostStatus;
  visibility: PostVisibility;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contentType: string;
  highlight?: {
    title?: string;
    slug?: string;
    authorName?: string;
    excerpt?: string;
    tag?: string;
  };
};
