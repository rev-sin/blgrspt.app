export const HIGHLIGHT_PRE_TAG = "<mark>";
export const HIGHLIGHT_POST_TAG = "</mark>";

export const postsIndexSettings = {
  searchableAttributes: [
    "unordered(title)",
    "unordered(slug)",
    "unordered(tags)",
    "unordered(authorName)",
    "excerpt",
    "content",
  ],
  attributesForFaceting: [
    "filterOnly(status)",
    "filterOnly(visibility)",
    "filterOnly(authorId)",
    "filterOnly(tags)",
  ],
  customRanking: ["desc(publishedAt)"],
  ranking: ["typo", "words", "filters", "proximity", "attribute", "exact", "custom"],
  queryType: "prefixAll" as const,
  typoTolerance: true,
  minWordSizefor1Typo: 3,
  minWordSizefor2Typos: 7,
  ignorePlurals: true,
  removeWordsIfNoResults: "allOptional" as const,
  separatorsToIndex: "-_",
  attributesToHighlight: ["title", "slug", "authorName", "excerpt", "tags"],
  attributesToSnippet: ["excerpt:18", "content:18"],
  highlightPreTag: HIGHLIGHT_PRE_TAG,
  highlightPostTag: HIGHLIGHT_POST_TAG,
};

export const usersIndexSettings = {
  searchableAttributes: ["unordered(name)", "unordered(email)"],
  attributesForFaceting: ["filterOnly(role)"],
  queryType: "prefixAll" as const,
  typoTolerance: true,
  minWordSizefor1Typo: 3,
  minWordSizefor2Typos: 7,
  removeWordsIfNoResults: "allOptional" as const,
  highlightPreTag: HIGHLIGHT_PRE_TAG,
  highlightPostTag: HIGHLIGHT_POST_TAG,
};

export const lookupSearchParams = {
  queryType: "prefixAll" as const,
  typoTolerance: true,
  removeWordsIfNoResults: "allOptional" as const,
  attributesToRetrieve: ["objectID"],
  attributesToHighlight: ["title", "slug", "authorName", "excerpt", "tags"],
  attributesToSnippet: ["excerpt:18", "content:18"],
  highlightPreTag: HIGHLIGHT_PRE_TAG,
  highlightPostTag: HIGHLIGHT_POST_TAG,
};
