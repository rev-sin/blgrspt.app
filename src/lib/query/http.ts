export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ErrorBody = {
  error?: {
    message?: string;
  };
};

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const result = (await response.json().catch(() => null)) as (T & ErrorBody) | null;

  if (!response.ok) {
    throw new ApiError(result?.error?.message ?? "Request failed", response.status);
  }

  if (result == null) {
    throw new ApiError("Empty response", response.status);
  }

  return result;
}
