import { isAdminUser, type UserWithRole } from "./rbac";

function jsonError(status: number, code: string, message: string) {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

export function requireAdmin(user: UserWithRole | null | undefined) {
  if (!user) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required");
  }

  if (!isAdminUser(user)) {
    return jsonError(403, "FORBIDDEN", "Admin access required");
  }

  return null;
}
