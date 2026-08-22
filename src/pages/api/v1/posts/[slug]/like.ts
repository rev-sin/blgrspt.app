import type { APIRoute } from "astro";
import { eq, sql } from "drizzle-orm";
import { db } from "$lib/db";
import { post, postLike } from "$lib/db/schema";
import { isShareablePost } from "$lib/posts/access";

export const prerender = false;

export const POST: APIRoute = async ({ locals, params }) => {
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

  const slug = params.slug;

  if (!slug) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INVALID_REQUEST",
          message: "Post slug is required",
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

  try {
    const [existingPost] = await db
      .select({
        id: post.id,
        status: post.status,
        visibility: post.visibility,
      })
      .from(post)
      .where(eq(post.slug, slug))
      .limit(1);

    if (!existingPost || !isShareablePost(existingPost)) {
      return new Response(
        JSON.stringify({
          error: {
            code: "POST_NOT_FOUND",
            message: "Post not found",
          },
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    await db.insert(postLike).values({
      postId: existingPost.id,
      userId: locals.user.id,
    });

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(postLike)
      .where(eq(postLike.postId, existingPost.id));

    return new Response(
      JSON.stringify({
        data: {
          liked: true,
          likes: Number(count),
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("LIKE POST ERROR:", error);

    const cause =
      typeof error === "object" && error !== null && "cause" in error ? error.cause : null;

    if (typeof cause === "object" && cause !== null && "code" in cause && cause.code === "23505") {
      return new Response(
        JSON.stringify({
          error: {
            code: "ALREADY_LIKED",
            message: "You have already liked this post",
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
          message: "Failed to like post",
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

export const DELETE: APIRoute = async ({ locals, params }) => {
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

  const slug = params.slug;

  if (!slug) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INVALID_REQUEST",
          message: "Post slug is required",
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

  try {
    const [existingPost] = await db
      .select({
        id: post.id,
        status: post.status,
        visibility: post.visibility,
      })
      .from(post)
      .where(eq(post.slug, slug))
      .limit(1);

    if (!existingPost || !isShareablePost(existingPost)) {
      return new Response(
        JSON.stringify({
          error: {
            code: "POST_NOT_FOUND",
            message: "Post not found",
          },
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const deleted = await db
      .delete(postLike)
      .where(
        sql`${postLike.postId} = ${existingPost.id}
        AND ${postLike.userId} = ${locals.user.id}`,
      )
      .returning();

    if (deleted.length === 0) {
      return new Response(
        JSON.stringify({
          error: {
            code: "NOT_LIKED",
            message: "You have not liked this post",
          },
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(postLike)
      .where(eq(postLike.postId, existingPost.id));

    return new Response(
      JSON.stringify({
        data: {
          liked: false,
          likes: Number(count),
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
    console.error("UNLIKE POST ERROR:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unlike post",
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
