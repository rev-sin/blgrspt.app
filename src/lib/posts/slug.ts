export function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function apiErrorMessage(result: unknown, fallback = "Request failed") {
  if (!result || typeof result !== "object" || !("error" in result)) {
    return fallback;
  }

  const error = result.error as {
    message?: string;
    details?: {
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };
  };

  const fieldError = Object.values(error.details?.fieldErrors ?? {}).flat()[0];

  if (fieldError) {
    return fieldError;
  }

  if (error.details?.formErrors?.[0]) {
    return error.details.formErrors[0];
  }

  return error.message ?? fallback;
}
