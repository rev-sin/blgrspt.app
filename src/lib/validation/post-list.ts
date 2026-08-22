export const POST_SORT_FIELDS = ["createdAt", "updatedAt", "publishedAt", "title"] as const;

export type PostSortField = (typeof POST_SORT_FIELDS)[number];

export type PostListOrder = "asc" | "desc";

const POST_STATUSES = new Set(["draft", "published"]);
const POST_VISIBILITIES = new Set(["private", "unlisted", "public"]);

export type PostListQuery = {
  page: number;
  limit: number;
  offset: number;
  status: string | null;
  visibility: string | null;
  tag: string | null;
  authorId: string | null;
  mine: boolean;
  scope: "admin" | null;
  q: string | null;
  createdAfter: string | null;
  createdBefore: string | null;
  createdAfterDate: Date | undefined;
  createdBeforeDate: Date | undefined;
  sort: PostSortField;
  order: PostListOrder;
};

type ParsePostListQueryError = {
  code: "INVALID_REQUEST";
  message: string;
};

export type ParsePostListQueryResult =
  | { success: true; data: PostListQuery }
  | { success: false; error: ParsePostListQueryError };

const SORT_FIELDS = new Set<string>(POST_SORT_FIELDS);

function isPostSortField(value: string): value is PostSortField {
  return SORT_FIELDS.has(value);
}

export function parsePostListQuery(searchParams: URLSearchParams): ParsePostListQueryResult {
  const pageParam = Number(searchParams.get("page") ?? "1");
  const limitParam = Number(searchParams.get("limit") ?? "10");

  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 10;

  const offset = (page - 1) * limit;

  const status = searchParams.get("status");
  const visibility = searchParams.get("visibility");
  const tag = searchParams.get("tag");
  const authorId = searchParams.get("authorId");
  const mine = searchParams.get("mine") === "true";
  const scopeParam = searchParams.get("scope");
  const qParam = searchParams.get("q");
  const createdAfter = searchParams.get("createdAfter");
  const createdBefore = searchParams.get("createdBefore");

  const sort = searchParams.get("sort") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";

  let createdAfterDate: Date | undefined;

  if (createdAfter) {
    const date = new Date(createdAfter);

    if (Number.isNaN(date.getTime())) {
      return {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid createdAfter date",
        },
      };
    }

    createdAfterDate = date;
  }

  let createdBeforeDate: Date | undefined;

  if (createdBefore) {
    const date = new Date(createdBefore);

    if (Number.isNaN(date.getTime())) {
      return {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid createdBefore date",
        },
      };
    }

    createdBeforeDate = date;
  }

  if (status && !POST_STATUSES.has(status)) {
    return {
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid status. Allowed values: draft, published",
      },
    };
  }

  if (visibility && !POST_VISIBILITIES.has(visibility)) {
    return {
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid visibility. Allowed values: private, unlisted, public",
      },
    };
  }

  if (!isPostSortField(sort)) {
    return {
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid sort field. Allowed values: createdAt, updatedAt, publishedAt, title",
      },
    };
  }

  if (order !== "asc" && order !== "desc") {
    return {
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid order. Allowed values: asc, desc",
      },
    };
  }

  if (scopeParam && scopeParam !== "admin") {
    return {
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Invalid scope. Allowed values: admin",
      },
    };
  }

  const q = qParam?.trim() || null;

  if (q && q.length > 200) {
    return {
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Search query must be 200 characters or fewer",
      },
    };
  }

  return {
    success: true,
    data: {
      page,
      limit,
      offset,
      status,
      visibility,
      tag,
      authorId,
      mine,
      scope: scopeParam === "admin" ? "admin" : null,
      q,
      createdAfter,
      createdBefore,
      createdAfterDate,
      createdBeforeDate,
      sort,
      order,
    },
  };
}
