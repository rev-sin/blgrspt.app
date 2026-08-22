import { describe, expect, test } from "bun:test";

import { apiErrorMessage, generateSlug } from "./slug";

describe("generateSlug", () => {
  test("slugifies a title", () => {
    expect(generateSlug("Hello World!")).toBe("hello-world");
  });

  test("strips leading and trailing hyphens", () => {
    expect(generateSlug("--Hello--")).toBe("hello");
  });
});

describe("apiErrorMessage", () => {
  test("prefers the first field error", () => {
    expect(
      apiErrorMessage({
        error: {
          message: "Invalid request body",
          details: {
            fieldErrors: {
              slug: ["Slug must contain only lowercase letters, numbers, and hyphens"],
            },
          },
        },
      }),
    ).toBe("Slug must contain only lowercase letters, numbers, and hyphens");
  });
});
