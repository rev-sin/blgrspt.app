import { describe, expect, test } from "bun:test";

import { highlightFromResult, sanitizeHighlight } from "./highlight";

describe("sanitizeHighlight", () => {
  test("keeps mark tags and escapes everything else", () => {
    expect(sanitizeHighlight("<mark>Hello</mark> <script>alert(1)</script>")).toBe(
      "<mark>Hello</mark> &lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });
});

describe("highlightFromResult", () => {
  test("prefers matched tag values", () => {
    expect(
      highlightFromResult({
        title: { value: "<mark>Astro</mark> notes", matchLevel: "full" },
        tags: [
          { value: "css", matchLevel: "none" },
          { value: "<mark>astro</mark>", matchLevel: "full" },
        ],
      }),
    ).toEqual({
      title: "<mark>Astro</mark> notes",
      slug: undefined,
      authorName: undefined,
      excerpt: undefined,
      tag: "<mark>astro</mark>",
    });
  });
});
