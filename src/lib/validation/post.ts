import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),

  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),

  excerpt: z.string().max(500).nullable().optional(),

  content: z.string().min(1),

  coverImage: z.string().url().nullable().optional(),

  tags: z.array(z.string().min(1).max(50)).default([]),

  status: z.enum(["draft", "published"]).default("draft"),

  contentType: z.enum(["markdown", "text", "tex"]).default("markdown"),
});

export const updatePostSchema = createPostSchema.partial().extend({
  newSlug: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),
});
