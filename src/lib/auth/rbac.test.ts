import { describe, expect, test } from "bun:test";

import { getAdminUserIds, hasAdminRole, isAdminUser, parseRoles } from "./rbac";

describe("parseRoles", () => {
  test("splits comma-separated roles", () => {
    expect(parseRoles("admin,user")).toEqual(["admin", "user"]);
    expect(parseRoles(" admin , user ")).toEqual(["admin", "user"]);
  });

  test("returns an empty list when role is missing", () => {
    expect(parseRoles(null)).toEqual([]);
    expect(parseRoles(undefined)).toEqual([]);
    expect(parseRoles("")).toEqual([]);
  });
});

describe("hasAdminRole", () => {
  test("accepts the admin role", () => {
    expect(hasAdminRole("admin")).toBe(true);
    expect(hasAdminRole("user,admin")).toBe(true);
    expect(hasAdminRole("user")).toBe(false);
    expect(hasAdminRole(null)).toBe(false);
  });
});

describe("getAdminUserIds", () => {
  test("parses a comma-separated allow list", () => {
    expect(getAdminUserIds("user-1, user-2")).toEqual(["user-1", "user-2"]);
    expect(getAdminUserIds("")).toEqual([]);
    expect(getAdminUserIds(undefined)).toEqual([]);
  });
});

describe("isAdminUser", () => {
  test("grants access by role or allow-listed user id", () => {
    expect(isAdminUser({ id: "user-1", role: "admin" })).toBe(true);
    expect(isAdminUser({ id: "user-1", role: "user" }, ["user-1"])).toBe(true);
    expect(isAdminUser({ id: "user-1", role: "user" }, ["user-2"])).toBe(false);
    expect(isAdminUser(null, ["user-1"])).toBe(false);
  });
});
