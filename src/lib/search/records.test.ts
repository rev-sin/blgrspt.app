import { describe, expect, test } from "bun:test";

import { toPostSearchRecord, toUserSearchRecord } from "./records";

describe("toPostSearchRecord", () => {
  test("maps a post into an Algolia record", () => {
    const record = toPostSearchRecord({
      id: "post-1",
      title: "Hello",
      slug: "hello",
      excerpt: null,
      content: "a".repeat(5000),
      tags: ["astro"],
      status: "published",
      visibility: "public",
      authorId: "user-1",
      authorName: "Revanth",
      authorEmail: "revanth@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      publishedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(record.objectID).toBe("post-1");
    expect(record.excerpt).toBe("");
    expect(record.content).toHaveLength(4000);
    expect(record.createdAt).toBe(Date.parse("2026-01-01T00:00:00.000Z"));
    expect(record.publishedAt).toBe(Date.parse("2026-01-01T00:00:00.000Z"));
  });
});

describe("toUserSearchRecord", () => {
  test("defaults missing roles to user", () => {
    expect(
      toUserSearchRecord({
        id: "user-1",
        name: "Mukesh",
        email: "mukesh@example.com",
      }),
    ).toEqual({
      objectID: "user-1",
      name: "Mukesh",
      email: "mukesh@example.com",
      role: "user",
    });
  });
});
