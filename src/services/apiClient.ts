import { appConfig } from "@/config/env";
import type { ApiResult } from "@/types/api";

export interface ApiClientOptions {
  baseUrl: string;
  timeoutMs: number;
  fetchFn?: typeof fetch;
}

export interface ApiClient {
  get: <T>(path: string) => Promise<ApiResult<T>>;
  post: <T>(path: string, body?: unknown) => Promise<ApiResult<T>>;
  put: <T>(path: string, body?: unknown) => Promise<ApiResult<T>>;
  delete: <T>(path: string) => Promise<ApiResult<T>>;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function parseBody<T>(text: string): ApiResult<T> {
  if (text === "") {
    // Empty body (e.g. 204): callers that expect no content use T = void
    return { ok: true, data: undefined as T };
  }
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, error: { kind: "parse" } };
  }
}

export function createApiClient({
  baseUrl,
  timeoutMs,
  fetchFn = fetch,
}: ApiClientOptions): ApiClient {
  const request = async <T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
  ): Promise<ApiResult<T>> => {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;
    let text: string;
    try {
      response = await fetchFn(buildUrl(baseUrl, path), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      text = await response.text();
    } catch {
      return { ok: false, error: { kind: timedOut ? "timeout" : "network" } };
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      return { ok: false, error: { kind: "http", status: response.status } };
    }
    return parseBody<T>(text);
  };

  return {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
  };
}

export const apiClient = createApiClient({
  baseUrl: appConfig.apiBaseUrl,
  timeoutMs: appConfig.apiTimeoutMs,
});
