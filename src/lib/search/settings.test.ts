import { describe, expect, test } from "bun:test";

import { postsIndexSettings } from "./settings";

describe("postsIndexSettings", () => {
  test("ranks titles and slugs ahead of body copy", () => {
    expect(postsIndexSettings.searchableAttributes[0]).toBe("unordered(title)");
    expect(postsIndexSettings.searchableAttributes[1]).toBe("unordered(slug)");
    expect(postsIndexSettings.searchableAttributes.at(-1)).toBe("content");
  });

  test("uses prefix matching and typo tolerance for lookup", () => {
    expect(postsIndexSettings.queryType).toBe("prefixAll");
    expect(postsIndexSettings.typoTolerance).toBe(true);
    expect(postsIndexSettings.removeWordsIfNoResults).toBe("allOptional");
    expect(postsIndexSettings.separatorsToIndex).toBe("-_");
  });
});
