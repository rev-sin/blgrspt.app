import { describe, expect, test } from "bun:test";

import { countPostVisibility, visibilityLabel } from "./labels";

describe("visibilityLabel", () => {
  test("treats drafts as Draft regardless of visibility", () => {
    expect(visibilityLabel({ status: "draft", visibility: "public" })).toBe("Draft");
  });

  test("labels published posts by visibility", () => {
    expect(visibilityLabel({ status: "published", visibility: "private" })).toBe("Private");
    expect(visibilityLabel({ status: "published", visibility: "unlisted" })).toBe("Unlisted");
    expect(visibilityLabel({ status: "published", visibility: "public" })).toBe("Public");
  });
});

describe("countPostVisibility", () => {
  test("counts each bucket", () => {
    expect(
      countPostVisibility([
        { status: "draft", visibility: "private" },
        { status: "published", visibility: "private" },
        { status: "published", visibility: "public" },
        { status: "published", visibility: "public" },
      ]),
    ).toEqual([
      { label: "Draft", value: 1 },
      { label: "Private", value: 1 },
      { label: "Unlisted", value: 0 },
      { label: "Public", value: 2 },
    ]);
  });
});
