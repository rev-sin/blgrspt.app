import { z } from "zod";

import { ADMIN_ROLE, USER_ROLE } from "$lib/auth/rbac";

export const setUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum([ADMIN_ROLE, USER_ROLE]),
});
