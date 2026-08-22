export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: (params: Record<string, string>) => ["posts", "list", params] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: Record<string, string>) => ["users", "list", params] as const,
  },
};
