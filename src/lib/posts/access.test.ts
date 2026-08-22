import { describe, expect, test } from "bun:test";

import { canViewPost, isInPublicFeed, isRestrictedListQuery, isShareablePost } from "./access";

const publicPost = {
  status: "published",
  visibility: "public",
  authorId: "author-1",
};

const unlistedPost = {
  status: "published",
  visibility: "unlisted",
  authorId: "author-1",
};

const privatePost = {
  status: "published",
  visibility: "private",
  authorId: "author-1",
};

const draftPost = {
  status: "draft",
  visibility: "private",
  authorId: "author-1",
};

describe("isInPublicFeed", () => {
  test("only published public posts appear in the feed", () => {
    expect(isInPublicFeed(publicPost)).toBe(true);
    expect(isInPublicFeed(unlistedPost)).toBe(false);
    expect(isInPublicFeed(privatePost)).toBe(false);
    expect(isInPublicFeed(draftPost)).toBe(false);
  });
});

describe("isShareablePost", () => {
  test("public and unlisted published posts can be opened by link", () => {
    expect(isShareablePost(publicPost)).toBe(true);
    expect(isShareablePost(unlistedPost)).toBe(true);
    expect(isShareablePost(privatePost)).toBe(false);
    expect(isShareablePost(draftPost)).toBe(false);
  });
});

describe("canViewPost", () => {
  test("anyone can view a published public post", () => {
    expect(canViewPost(publicPost, null)).toBe(true);
    expect(canViewPost(publicPost, "someone-else")).toBe(true);
  });

  test("anyone with the link can view an unlisted post", () => {
    expect(canViewPost(unlistedPost, null)).toBe(true);
    expect(canViewPost(unlistedPost, "someone-else")).toBe(true);
  });

  test("only the author can view drafts and private posts", () => {
    expect(canViewPost(draftPost, null)).toBe(false);
    expect(canViewPost(draftPost, "someone-else")).toBe(false);
    expect(canViewPost(draftPost, "author-1")).toBe(true);

    expect(canViewPost(privatePost, null)).toBe(false);
    expect(canViewPost(privatePost, "someone-else")).toBe(false);
    expect(canViewPost(privatePost, "author-1")).toBe(true);
  });
});

describe("isRestrictedListQuery", () => {
  test("drafts, private, and unlisted listings are restricted", () => {
    expect(isRestrictedListQuery("draft", null)).toBe(true);
    expect(isRestrictedListQuery(null, "private")).toBe(true);
    expect(isRestrictedListQuery(null, "unlisted")).toBe(true);
    expect(isRestrictedListQuery("published", "public")).toBe(false);
    expect(isRestrictedListQuery(null, null)).toBe(false);
  });
});
