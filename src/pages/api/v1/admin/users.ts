import type { APIRoute } from "astro";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";

import { ADMIN_ROLE, getAdminUserIds, isAdminUser } from "$lib/auth/rbac";
import { requireAdmin } from "$lib/auth/require-admin";
import { db } from "$lib/db";
import { user } from "$lib/db/schema";
import { getUsersIndexName, isAlgoliaConfigured } from "$lib/search/config";
import { buildUserSearchFilters } from "$lib/search/filters";
import { saveUserRecord, searchIndexIds } from "$lib/search/sync";
import { setUserRoleSchema } from "$lib/validation/admin";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const denied = requireAdmin(locals.user);

  if (denied) {
    return denied;
  }

  const q = url.searchParams.get("q")?.trim() ?? "";
  const adminsOnly = url.searchParams.get("role") === ADMIN_ROLE;
  const limitParam = Number(url.searchParams.get("limit") ?? "20");
  const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;

  const conditions = [];

  if (q && isAlgoliaConfigured()) {
    try {
      const algolia = await searchIndexIds({
        indexName: getUsersIndexName(),
        query: q,
        page: 0,
        hitsPerPage: limit,
        filters: buildUserSearchFilters(adminsOnly),
      });

      if (algolia) {
        const rankedUsers =
          algolia.objectIDs.length > 0
            ? await db
                .select({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image,
                  role: user.role,
                })
                .from(user)
                .where(inArray(user.id, algolia.objectIDs))
            : [];

        const usersById = new Map(rankedUsers.map((item) => [item.id, item]));
        const users = algolia.objectIDs.flatMap((id) => {
          const item = usersById.get(id);
          return item ? [item] : [];
        });

        return new Response(
          JSON.stringify({
            data: users.map((item) => ({
              ...item,
              isAdmin: isAdminUser(item),
            })),
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
      console.error("ALGOLIA USER SEARCH ERROR:", error);
    }
  }

  if (q) {
    const pattern = `%${q}%`;

    conditions.push(or(ilike(user.name, pattern), ilike(user.email, pattern)));
  }

  if (adminsOnly) {
    const adminUserIds = getAdminUserIds();

    conditions.push(
      adminUserIds.length > 0
        ? or(eq(user.role, ADMIN_ROLE), inArray(user.id, adminUserIds))
        : eq(user.role, ADMIN_ROLE),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    })
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(limit);

  return new Response(
    JSON.stringify({
      data: users.map((item) => ({
        ...item,
        isAdmin: isAdminUser(item),
      })),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = requireAdmin(locals.user);

  if (denied) {
    return denied;
  }

  try {
    const body = await request.json();
    const result = setUserRoleSchema.safeParse(body);

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

    const { userId, role } = result.data;

    if (userId === locals.user?.id) {
      return new Response(
        JSON.stringify({
          error: {
            code: "FORBIDDEN",
            message: "You cannot change your own role",
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

    const [existingUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!existingUser) {
      return new Response(
        JSON.stringify({
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
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

    const [updatedUser] = await db
      .update(user)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      });

    await saveUserRecord(updatedUser);

    return new Response(
      JSON.stringify({
        data: {
          ...updatedUser,
          isAdmin: isAdminUser(updatedUser),
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
    console.error("SET USER ROLE ERROR:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user role",
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
