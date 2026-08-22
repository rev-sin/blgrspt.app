export const ADMIN_ROLE = "admin";
export const USER_ROLE = "user";

export type UserWithRole = {
  id: string;
  role?: string | null;
};

export function getAdminUserIds(value = process.env.ADMIN_USER_IDS): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function parseRoles(role: string | null | undefined): string[] {
  if (!role) {
    return [];
  }

  return role
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasAdminRole(role: string | null | undefined): boolean {
  return parseRoles(role).includes(ADMIN_ROLE);
}

export function isAdminUser(
  user: UserWithRole | null | undefined,
  adminUserIds = getAdminUserIds(),
): boolean {
  if (!user) {
    return false;
  }

  return adminUserIds.includes(user.id) || hasAdminRole(user.role);
}
