import { describe, expect, test } from "bun:test";

import { createPostSchema, updatePostSchema } from "./post";

const validPost = {
  title: "Hello World",
  slug: "hello-world",
  content: "Body text",
};

describe("createPostSchema", () => {
  test("accepts a minimal valid post and applies defaults", () => {
    const result = createPostSchema.safeParse(validPost);

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data).toEqual({
      ...validPost,
      tags: [],
      status: "draft",
      visibility: "private",
      contentType: "markdown",
    });
  });

  test("accepts optional fields", () => {
    const result = createPostSchema.safeParse({
      ...validPost,
      excerpt: "A short summary",
      coverImage: "https://example.com/cover.png",
      tags: ["astro", "svelte"],
      status: "published",
      visibility: "public",
      contentType: "tex",
    });

    expect(result.success).toBe(true);
  });

  test("allows nullable excerpt and coverImage", () => {
    const result = createPostSchema.safeParse({
      ...validPost,
      excerpt: null,
      coverImage: null,
    });

    expect(result.success).toBe(true);
  });

  test("rejects an empty title", () => {
    const result = createPostSchema.safeParse({
      ...validPost,
      title: "",
    });

    expect(result.success).toBe(false);
  });

  test("rejects a title longer than 200 characters", () => {
    const result = createPostSchema.safeParse({
      ...validPost,
      title: "a".repeat(201),
    });

    expect(result.success).toBe(false);
  });

  test.each(["Hello", "hello_world", "hello--world", "-hello", "hello-", "hello world", ""])(
    "rejects invalid slug %p",
    (slug: string) => {
      const result = createPostSchema.safeParse({
        ...validPost,
        slug,
      });

      expect(result.success).toBe(false);
    },
  );

  test("rejects empty content", () => {
    const result = createPostSchema.safeParse({
      ...validPost,
      content: "",
    });

    expect(result.success).toBe(false);
  });

  test("rejects a non-url coverImage", () => {
    const result = createPostSchema.safeParse({
      ...validPost,
      coverImage: "not-a-url",
    });

    expect(result.success).toBe(false);
  });

  test("rejects an excerpt longer than 500 characters", () => {
    const result = createPostSchema.safeParse({
      ...validPost,
      excerpt: "a".repeat(501),
    });

    expect(result.success).toBe(false);
  });

  test("rejects empty tags and tags longer than 50 characters", () => {
    expect(
      createPostSchema.safeParse({
        ...validPost,
        tags: [""],
      }).success,
    ).toBe(false);

    expect(
      createPostSchema.safeParse({
        ...validPost,
        tags: ["a".repeat(51)],
      }).success,
    ).toBe(false);
  });

  test("rejects unknown status, visibility, and contentType values", () => {
    expect(
      createPostSchema.safeParse({
        ...validPost,
        status: "archived",
      }).success,
    ).toBe(false);

    expect(
      createPostSchema.safeParse({
        ...validPost,
        visibility: "friends",
      }).success,
    ).toBe(false);

    expect(
      createPostSchema.safeParse({
        ...validPost,
        contentType: "html",
      }).success,
    ).toBe(false);
  });
});

describe("updatePostSchema", () => {
  test("accepts an empty object", () => {
    const result = updatePostSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  test("accepts a partial update", () => {
    const result = updatePostSchema.safeParse({
      title: "Updated title",
      status: "published",
    });

    expect(result.success).toBe(true);
  });

  test("accepts a valid newSlug", () => {
    const result = updatePostSchema.safeParse({
      newSlug: "updated-slug-2",
    });

    expect(result.success).toBe(true);
  });

  test("rejects an invalid newSlug", () => {
    const result = updatePostSchema.safeParse({
      newSlug: "Invalid Slug",
    });

    expect(result.success).toBe(false);
  });
});
