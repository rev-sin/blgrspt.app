import { describe, expect, test } from "bun:test";

import { isAlgoliaSearchConfigured, isAlgoliaWriteConfigured } from "./config";

describe("Algolia config", () => {
  test("requires an app id and search key for search", () => {
    expect(isAlgoliaSearchConfigured("APP", "search-key")).toBe(true);
    expect(isAlgoliaSearchConfigured("APP", undefined)).toBe(false);
    expect(isAlgoliaSearchConfigured(undefined, "search-key")).toBe(false);
  });

  test("requires an app id and write key for indexing", () => {
    expect(isAlgoliaWriteConfigured("APP", "write-key")).toBe(true);
    expect(isAlgoliaWriteConfigured("APP", undefined)).toBe(false);
  });
});
