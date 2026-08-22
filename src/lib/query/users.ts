import { fetchJson } from "./http";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isAdmin: boolean;
};

type UsersResponse = {
  data: AdminUser[];
};

export async function listUsers(params: Record<string, string>) {
  const search = new URLSearchParams(params);
  const result = await fetchJson<UsersResponse>(`/api/v1/admin/users?${search.toString()}`);
  return result.data;
}

export async function setUserRole(userId: string, role: "admin" | "user") {
  const result = await fetchJson<{ data: AdminUser }>("/api/v1/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, role }),
  });
  return result.data;
}
