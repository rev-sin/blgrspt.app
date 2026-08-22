import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { isAdminUser } from "$lib/auth/rbac";
import { db } from "$lib/db";
import { post, user } from "$lib/db/schema";
import { canManagePost, canViewPost } from "$lib/posts/access";
import { postWithAuthorColumns } from "$lib/posts/with-author";
import { indexPostById, removePostFromIndex } from "$lib/search/sync";
import { updatePostSchema } from "$lib/validation/post";

export const prerender = false;
export const GET: APIRoute = async ({ params, locals }) => {
  try {
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

    const [existingPost] = await db
      .select(postWithAuthorColumns)
      .from(post)
      .innerJoin(user, eq(post.authorId, user.id))
      .where(eq(post.slug, slug))
      .limit(1);

    if (!existingPost) {
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

    if (!canViewPost(existingPost, locals.user?.id, isAdminUser(locals.user))) {
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

    return new Response(
      JSON.stringify({
        data: existingPost,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("GET POST ERROR:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve post",
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

export const PUT: APIRoute = async ({ request, params, locals }) => {
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
    const [existingPost] = await db.select().from(post).where(eq(post.slug, slug)).limit(1);

    if (!existingPost) {
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

    if (!canManagePost(existingPost, locals.user.id, isAdminUser(locals.user))) {
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "You are not allowed to update this post",
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

    const body = await request.json();

    const result = updatePostSchema.safeParse(body);

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

    const { title, newSlug, excerpt, content, coverImage, tags, status, visibility } = result.data;

    const nextStatus = status ?? existingPost.status;
    const nextVisibility =
      nextStatus === "draft" ? "private" : (visibility ?? existingPost.visibility);
    const publishedAt =
      nextStatus === "published" && !existingPost.publishedAt
        ? new Date()
        : existingPost.publishedAt;

    if (newSlug && newSlug !== existingPost.slug) {
      const [slugExists] = await db
        .select({ id: post.id })
        .from(post)
        .where(eq(post.slug, newSlug))
        .limit(1);

      if (slugExists) {
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
    }

    const [updatedPost] = await db
      .update(post)
      .set({
        title: title ?? existingPost.title,
        slug: newSlug ?? existingPost.slug,
        excerpt: excerpt !== undefined ? excerpt : existingPost.excerpt,
        content: content ?? existingPost.content,
        coverImage: coverImage !== undefined ? coverImage : existingPost.coverImage,
        tags: tags ?? existingPost.tags,
        status: nextStatus,
        visibility: nextVisibility,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(post.id, existingPost.id))
      .returning();

    await indexPostById(updatedPost.id);

    return new Response(
      JSON.stringify({
        data: updatedPost,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("UPDATE POST ERROR:", error);

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
          message: "Failed to update post",
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

export const DELETE: APIRoute = async ({ params, locals }) => {
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
    const [existingPost] = await db.select().from(post).where(eq(post.slug, slug)).limit(1);

    if (!existingPost) {
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

    if (!canManagePost(existingPost, locals.user.id, isAdminUser(locals.user))) {
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "You are not allowed to delete this post",
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

    await db.delete(post).where(eq(post.id, existingPost.id));
    await removePostFromIndex(existingPost.id);

    return new Response(
      JSON.stringify({
        data: {
          message: "Post deleted successfully",
          id: existingPost.id,
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
    console.error(error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete post",
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
