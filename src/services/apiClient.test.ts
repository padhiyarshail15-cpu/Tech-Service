import { type Mock, afterEach, describe, expect, it, vi } from "vitest";
import { buildUrl, createApiClient } from "@/services/apiClient";

const BASE = "https://api.example.com/v1";

const sentInit = (fetchFn: Mock<typeof fetch>, index = 0) =>
  fetchFn.mock.calls[index]?.[1];

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("buildUrl", () => {
  it.each([
    ["https://api.example.com", "items", "https://api.example.com/items"],
    ["https://api.example.com/", "/items", "https://api.example.com/items"],
    [
      "https://api.example.com/v1/",
      "items",
      "https://api.example.com/v1/items",
    ],
    ["/api", "users/1", "/api/users/1"],
  ])("joins %s and %s", (base, path, expected) => {
    expect(buildUrl(base, path)).toBe(expected);
  });
});

describe("createApiClient", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON for a successful GET", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ id: 1 }));
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000, fetchFn });

    const result = await client.get<{ id: number }>("items/1");

    expect(result).toEqual({ ok: true, data: { id: 1 } });
    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.example.com/v1/items/1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("sends a JSON body and content type for POST", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ ok: true }));
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000, fetchFn });

    await client.post("tickets", { title: "Printer down" });

    const init = sentInit(fetchFn);

    expect(init?.body).toBe(JSON.stringify({ title: "Printer down" }));
    expect(init?.headers).toEqual({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
  });

  it("sends PUT and DELETE with the right method", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000, fetchFn });

    await client.put("tickets/1", { status: "closed" });
    await client.delete("tickets/1");

    expect(sentInit(fetchFn, 0)?.method).toBe("PUT");
    expect(sentInit(fetchFn, 1)?.method).toBe("DELETE");
    expect(sentInit(fetchFn, 1)?.body).toBeUndefined();
  });

  it("omits the body and content type when none is given", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}));
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000, fetchFn });

    await client.post("ping");

    const init = sentInit(fetchFn);
    expect(init?.body).toBeUndefined();
    expect(init?.headers).toEqual({ Accept: "application/json" });
  });

  it("returns undefined data for an empty body", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000, fetchFn });

    const result = await client.delete<void>("tickets/1");

    expect(result).toEqual({ ok: true, data: undefined });
  });

  it("returns an http error with the status code", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ message: "nope" }, 404));
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000, fetchFn });

    const result = await client.get("missing");

    expect(result).toEqual({ ok: false, error: { kind: "http", status: 404 } });
  });

  it("returns a parse error when the body is not JSON", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("<html>", { status: 200 }));
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000, fetchFn });

    const result = await client.get("page");

    expect(result).toEqual({ ok: false, error: { kind: "parse" } });
  });

  it("returns a network error when fetch rejects", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000, fetchFn });

    const result = await client.get("items");

    expect(result).toEqual({ ok: false, error: { kind: "network" } });
  });

  it("returns a timeout error when the request runs past timeoutMs", async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn<typeof fetch>().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 500, fetchFn });

    const pending = client.get("slow");
    await vi.advanceTimersByTimeAsync(500);

    await expect(pending).resolves.toEqual({
      ok: false,
      error: { kind: "timeout" },
    });
  });

  it("uses the global fetch when fetchFn is not provided", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ hello: "world" }));
    vi.stubGlobal("fetch", fetchMock);
    const client = createApiClient({ baseUrl: BASE, timeoutMs: 1000 });

    const result = await client.get("hello");

    expect(result).toEqual({ ok: true, data: { hello: "world" } });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
