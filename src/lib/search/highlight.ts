const MARK_OPEN = "<mark>";
const MARK_CLOSE = "</mark>";

type HighlightNode = {
  value?: string;
  matchLevel?: string;
};

function fieldValue(field: HighlightNode | HighlightNode[] | undefined): string | undefined {
  if (!field) {
    return undefined;
  }

  if (Array.isArray(field)) {
    const matched = field.find((item) => item.matchLevel && item.matchLevel !== "none");
    return matched?.value ?? field[0]?.value;
  }

  return field.value;
}

export type PostHighlight = {
  title?: string;
  slug?: string;
  authorName?: string;
  excerpt?: string;
  tag?: string;
};

export function highlightFromResult(result: {
  title?: HighlightNode | HighlightNode[];
  slug?: HighlightNode | HighlightNode[];
  authorName?: HighlightNode | HighlightNode[];
  excerpt?: HighlightNode | HighlightNode[];
  tags?: HighlightNode | HighlightNode[];
}): PostHighlight | undefined {
  const highlight: PostHighlight = {
    title: fieldValue(result.title),
    slug: fieldValue(result.slug),
    authorName: fieldValue(result.authorName),
    excerpt: fieldValue(result.excerpt),
    tag: fieldValue(result.tags),
  };

  if (
    !highlight.title &&
    !highlight.slug &&
    !highlight.authorName &&
    !highlight.excerpt &&
    !highlight.tag
  ) {
    return undefined;
  }

  return highlight;
}

export function sanitizeHighlight(html: string): string {
  const escaped = html.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  return escaped.replaceAll("&lt;mark&gt;", MARK_OPEN).replaceAll("&lt;/mark&gt;", MARK_CLOSE);
}
