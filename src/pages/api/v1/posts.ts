import type { APIRoute } from "astro";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "$lib/db";
import { post } from "$lib/db/schema";
import { createPostSchema } from "$lib/validation/post";
import { parsePostListQuery } from "$lib/validation/post-list";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
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
      tag,
      authorId,
      createdAfter,
      createdBefore,
      createdAfterDate,
      createdBeforeDate,
      sort,
      order,
    } = parsed.data;

    const conditions = [];

    if (status) {
      conditions.push(eq(post.status, status));
    }

    if (tag) {
      conditions.push(sql`${post.tags} @> ARRAY[${tag}]::text[]`);
    }

    if (authorId) {
      conditions.push(eq(post.authorId, authorId));
    }

    if (createdAfterDate) {
      conditions.push(gte(post.createdAt, createdAfterDate));
    }

    if (createdBeforeDate) {
      conditions.push(lte(post.createdAt, createdBeforeDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = {
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
      title: post.title,
    }[sort];

    const orderBy = order === "asc" ? asc(sortColumn) : desc(sortColumn);

    const posts = await db
      .select()
      .from(post)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(post)
      .where(whereClause);

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
          tag,
          authorId,
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

    const { title, slug, excerpt, content, coverImage, tags, status, contentType } = result.data;

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

        contentType,

        publishedAt,
      })
      .returning();

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
