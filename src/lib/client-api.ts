/**
 * Shared browser-side API client.
 *
 * Centralizes response parsing and normalizes API errors so page components
 * can focus on rendering and user interactions.
 */
export type ApiErrorBody = {
  message?: string;
  code?: string;
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

type ApiEnvelope<T> = {
  data: T;
  error?: ApiErrorBody | string | null;
};

function getErrorMessage(error: ApiEnvelope<unknown>["error"]): string | undefined {
  if (typeof error === "string") return error;
  return error?.message;
}

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | null;

  if (!response.ok) {
    const message =
      getErrorMessage(payload?.error) ??
      `Request failed with status ${response.status}.`;
    const code =
      typeof payload?.error === "object" && payload.error
        ? payload.error.code
        : undefined;

    throw new ApiRequestError(message, response.status, code);
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiRequestError(
      "The server returned an invalid response.",
      response.status,
      "INVALID_API_RESPONSE",
    );
  }

  return payload;
}
