import { describe, expect, test } from "bun:test";

import { parsePostListQuery } from "./post-list";

describe("parsePostListQuery", () => {
  test("uses defaults when no query params are provided", () => {
    const result = parsePostListQuery(new URLSearchParams());

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data).toMatchObject({
      page: 1,
      limit: 10,
      offset: 0,
      status: null,
      visibility: null,
      tag: null,
      authorId: null,
      mine: false,
      createdAfter: null,
      createdBefore: null,
      createdAfterDate: undefined,
      createdBeforeDate: undefined,
      sort: "createdAt",
      order: "desc",
    });
  });

  test("parses pagination, filters, and sorting", () => {
    const result = parsePostListQuery(
      new URLSearchParams({
        page: "3",
        limit: "25",
        status: "published",
        visibility: "public",
        tag: "astro",
        authorId: "user-1",
        mine: "true",
        createdAfter: "2026-01-01T00:00:00.000Z",
        createdBefore: "2026-12-31T23:59:59.000Z",
        sort: "title",
        order: "asc",
      }),
    );

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.page).toBe(3);
    expect(result.data.limit).toBe(25);
    expect(result.data.offset).toBe(50);
    expect(result.data.status).toBe("published");
    expect(result.data.visibility).toBe("public");
    expect(result.data.tag).toBe("astro");
    expect(result.data.authorId).toBe("user-1");
    expect(result.data.mine).toBe(true);
    expect(result.data.sort).toBe("title");
    expect(result.data.order).toBe("asc");
    expect(result.data.createdAfterDate?.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(result.data.createdBeforeDate?.toISOString()).toBe("2026-12-31T23:59:59.000Z");
  });

  test("falls back to page 1 for invalid page values", () => {
    expect(parsePostListQuery(new URLSearchParams({ page: "0" })).success).toBe(true);
    expect(parsePostListQuery(new URLSearchParams({ page: "-1" })).success).toBe(true);
    expect(parsePostListQuery(new URLSearchParams({ page: "1.5" })).success).toBe(true);
    expect(parsePostListQuery(new URLSearchParams({ page: "abc" })).success).toBe(true);

    const result = parsePostListQuery(new URLSearchParams({ page: "0" }));

    if (result.success) {
      expect(result.data.page).toBe(1);
    }
  });

  test("caps limit at 100 and falls back to 10 for invalid limits", () => {
    const capped = parsePostListQuery(new URLSearchParams({ limit: "250" }));

    expect(capped.success).toBe(true);

    if (capped.success) {
      expect(capped.data.limit).toBe(100);
    }

    const invalid = parsePostListQuery(new URLSearchParams({ limit: "0" }));

    expect(invalid.success).toBe(true);

    if (invalid.success) {
      expect(invalid.data.limit).toBe(10);
    }
  });

  test("rejects an invalid status", () => {
    const result = parsePostListQuery(new URLSearchParams({ status: "archived" }));

    expect(result).toEqual({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid status. Allowed values: draft, published",
      },
    });
  });

  test("rejects an invalid visibility", () => {
    const result = parsePostListQuery(new URLSearchParams({ visibility: "friends" }));

    expect(result).toEqual({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid visibility. Allowed values: private, unlisted, public",
      },
    });
  });

  test("rejects an invalid createdAfter date", () => {
    const result = parsePostListQuery(new URLSearchParams({ createdAfter: "not-a-date" }));

    expect(result).toEqual({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid createdAfter date",
      },
    });
  });

  test("rejects an invalid createdBefore date", () => {
    const result = parsePostListQuery(new URLSearchParams({ createdBefore: "nope" }));

    expect(result).toEqual({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid createdBefore date",
      },
    });
  });

  test("rejects an invalid sort field", () => {
    const result = parsePostListQuery(new URLSearchParams({ sort: "likes" }));

    expect(result).toEqual({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid sort field. Allowed values: createdAt, updatedAt, publishedAt, title",
      },
    });
  });

  test("rejects an invalid order", () => {
    const result = parsePostListQuery(new URLSearchParams({ order: "newest" }));

    expect(result).toEqual({
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid order. Allowed values: asc, desc",
      },
    });
  });
});
