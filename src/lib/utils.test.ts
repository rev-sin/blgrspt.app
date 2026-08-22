import { describe, expect, test } from "bun:test";

import { cn } from "./utils";

describe("cn", () => {
  test("joins class names", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  test("omits falsy values", () => {
    expect(cn("flex", false, null, undefined, "", "gap-2")).toBe("flex gap-2");
  });

  test("merges conflicting Tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  test("supports conditional objects and arrays", () => {
    expect(cn(["rounded", { "opacity-50": true, hidden: false }])).toBe("rounded opacity-50");
  });
});
