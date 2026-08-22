import type { APIRoute } from "astro";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";

import { isAdminUser } from "$lib/auth/rbac";
import { db } from "$lib/db";
import { post, user } from "$lib/db/schema";
import { isRestrictedListQuery } from "$lib/posts/access";
import { postWithAuthorColumns } from "$lib/posts/with-author";
import { buildPostNumericFilters, buildPostSearchFilters } from "$lib/search/filters";
import { getPostsIndexName, isAlgoliaConfigured } from "$lib/search/config";
import { indexPostById, searchIndexIds } from "$lib/search/sync";
import { createPostSchema } from "$lib/validation/post";
import { parsePostListQuery } from "$lib/validation/post-list";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const parsed = parsePostListQuery(url.searchParams);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const {
      page,
      limit,
      offset,
      status,
      visibility,
      tag,
      authorId,
      mine,
      scope,
      q,
      createdAfter,
      createdBefore,
      createdAfterDate,
      createdBeforeDate,
      sort,
      order,
    } = parsed.data;

    const adminScope = scope === "admin";
    const viewerIsAdmin = isAdminUser(locals.user);
    const listingOwn = mine || (isRestrictedListQuery(status, visibility) && !adminScope);

    if ((listingOwn || adminScope) && !locals.user) {
      return new Response(
        JSON.stringify({
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (adminScope && !viewerIsAdmin) {
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "Admin access required",
          },
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const conditions = [];

    if (!adminScope) {
      if (listingOwn && locals.user) {
        conditions.push(eq(post.authorId, locals.user.id));
      } else {
        conditions.push(and(eq(post.status, "published"), eq(post.visibility, "public")));
      }
    }

    if (status) {
      conditions.push(eq(post.status, status));
    }

    if (visibility) {
      conditions.push(eq(post.visibility, visibility));
    }

    if (tag) {
      conditions.push(sql`${post.tags} @> ARRAY[${tag}]::text[]`);
    }

    if (authorId) {
      conditions.push(eq(post.authorId, authorId));
    }

    if (q) {
      const pattern = `%${q}%`;

      conditions.push(
        or(ilike(post.title, pattern), ilike(user.name, pattern), ilike(user.email, pattern)),
      );
    }

    if (createdAfterDate) {
      conditions.push(gte(post.createdAt, createdAfterDate));
    }

    if (createdBeforeDate) {
      conditions.push(lte(post.createdAt, createdBeforeDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (q && isAlgoliaConfigured()) {
      try {
        const algolia = await searchIndexIds({
          indexName: getPostsIndexName(),
          query: q,
          page: page - 1,
          hitsPerPage: limit,
          filters: buildPostSearchFilters({
            adminScope,
            listingOwn,
            userId: locals.user?.id,
            status,
            visibility,
            tag,
            authorId,
          }),
          numericFilters: buildPostNumericFilters(createdAfterDate, createdBeforeDate),
        });

        if (algolia) {
          const rankedPosts =
            algolia.objectIDs.length > 0
              ? await db
                  .select(postWithAuthorColumns)
                  .from(post)
                  .innerJoin(user, eq(post.authorId, user.id))
                  .where(inArray(post.id, algolia.objectIDs))
              : [];

          const postsById = new Map(rankedPosts.map((item) => [item.id, item]));
          const posts = algolia.objectIDs.flatMap((id) => {
            const item = postsById.get(id);

            if (!item) {
              return [];
            }

            return [
              {
                ...item,
                highlight: algolia.highlights.get(id),
              },
            ];
          });

          return new Response(
            JSON.stringify({
              data: posts,
              pagination: {
                page,
                limit,
                total: algolia.total,
                totalPages: algolia.totalPages,
              },
              filters: {
                status,
                visibility,
                tag,
                authorId,
                mine,
                scope,
                q,
                createdAfter,
                createdBefore,
              },
              sorting: {
                sort,
                order,
              },
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
      } catch (error) {
        console.error("ALGOLIA POST SEARCH ERROR:", error);
      }
    }

    const sortColumn = {
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
      title: post.title,
    }[sort];

    const orderBy = order === "asc" ? asc(sortColumn) : desc(sortColumn);

    const posts = await db
      .select(postWithAuthorColumns)
      .from(post)
      .innerJoin(user, eq(post.authorId, user.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(post);

    const [{ count }] = q
      ? await countQuery.innerJoin(user, eq(post.authorId, user.id)).where(whereClause)
      : await countQuery.where(whereClause);

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    return new Response(
      JSON.stringify({
        data: posts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters: {
          status,
          visibility,
          tag,
          authorId,
          mine,
          scope,
          q,
          createdAfter,
          createdBefore,
        },
        sorting: {
          sort,
          order,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve posts",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(
      JSON.stringify({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const body = await request.json();

    const result = createPostSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: result.error.flatten(),
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { title, slug, excerpt, content, coverImage, tags, status, visibility, contentType } =
      result.data;

    const nextVisibility = status === "draft" ? "private" : visibility;
    const publishedAt = status === "published" ? new Date() : null;

    const [createdPost] = await db
      .insert(post)
      .values({
        id: crypto.randomUUID(),

        authorId: locals.user.id,

        title,

        slug,

        excerpt: excerpt ?? null,

        content,

        coverImage: coverImage ?? null,

        tags,

        status,

        visibility: nextVisibility,

        contentType,

        publishedAt,
      })
      .returning();

    await indexPostById(createdPost.id);

    return new Response(
      JSON.stringify({
        data: createdPost,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    const cause =
      typeof error === "object" && error !== null && "cause" in error ? error.cause : null;

    if (typeof cause === "object" && cause !== null && "code" in cause && cause.code === "23505") {
      return new Response(
        JSON.stringify({
          error: {
            code: "SLUG_ALREADY_EXISTS",
            message: "A post with this slug already exists",
          },
        }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create post",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
