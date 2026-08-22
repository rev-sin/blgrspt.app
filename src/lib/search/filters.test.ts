import { describe, expect, test } from "bun:test";

import { buildPostNumericFilters, buildPostSearchFilters, buildUserSearchFilters } from "./filters";

describe("buildPostSearchFilters", () => {
  test("limits the public feed to published public posts", () => {
    expect(
      buildPostSearchFilters({
        adminScope: false,
        listingOwn: false,
        status: null,
        visibility: null,
        tag: null,
        authorId: null,
      }),
    ).toBe("status:published AND visibility:public");
  });

  test("scopes an author's listing to their posts", () => {
    expect(
      buildPostSearchFilters({
        adminScope: false,
        listingOwn: true,
        userId: "user-1",
        status: "draft",
        visibility: null,
        tag: null,
        authorId: null,
      }),
    ).toBe('authorId:"user-1" AND status:"draft"');
  });

  test("lets admins search across every post", () => {
    expect(
      buildPostSearchFilters({
        adminScope: true,
        listingOwn: false,
        status: null,
        visibility: null,
        tag: "astro",
        authorId: "user-2",
      }),
    ).toBe('tags:"astro" AND authorId:"user-2"');
  });
});

describe("buildPostNumericFilters", () => {
  test("uses createdAt timestamps", () => {
    const after = new Date("2026-01-01T00:00:00.000Z");
    const before = new Date("2026-12-31T00:00:00.000Z");

    expect(buildPostNumericFilters(after, before)).toEqual([
      `createdAt >= ${after.getTime()}`,
      `createdAt <= ${before.getTime()}`,
    ]);
  });
});

describe("buildUserSearchFilters", () => {
  test("filters the admin role when requested", () => {
    expect(buildUserSearchFilters(false)).toBeUndefined();
    expect(buildUserSearchFilters(true)).toBe("role:admin");
  });
});
