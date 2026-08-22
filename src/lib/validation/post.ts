import { z } from "zod";

const postFields = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),

  excerpt: z.string().max(500).nullable().optional(),

  content: z.string(),

  coverImage: z.string().url().nullable().optional(),

  tags: z.array(z.string().min(1).max(50)).default([]),

  status: z.enum(["draft", "published"]).default("draft"),

  visibility: z.enum(["private", "unlisted", "public"]).default("private"),

  contentType: z.enum(["markdown", "text", "tex"]).default("markdown"),
});

export const createPostSchema = postFields.superRefine((data, ctx) => {
  if (data.status === "published" && data.content.trim().length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["content"],
      message: "Write some content before publishing",
    });
  }
});

export const updatePostSchema = postFields
  .partial()
  .extend({
    newSlug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === "published" &&
      data.content !== undefined &&
      data.content.trim().length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Write some content before publishing",
      });
    }
  });
