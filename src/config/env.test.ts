import { describe, expect, it } from "vitest";
import { parseEnv } from "@/config/env";

const DEFAULT_TIMEOUT_MS = 10_000;

const valid = {
  VITE_APP_ENV: "uat",
  VITE_API_BASE_URL: "https://api-uat.example.com",
};

describe("parseEnv", () => {
  it.each(["development", "test", "uat", "production"])(
    "accepts the %s environment",
    (env) => {
      const config = parseEnv(
        { ...valid, VITE_APP_ENV: env },
        { useDevProxy: false },
      );

      expect(config.env).toBe(env);
    },
  );

  it("returns the normalised base URL and the default timeout", () => {
    const config = parseEnv(valid, { useDevProxy: false });

    expect(config).toEqual({
      env: "uat",
      apiBaseUrl: "https://api-uat.example.com/",
      apiTimeoutMs: DEFAULT_TIMEOUT_MS,
    });
  });

  it("uses /api as the base URL when the dev proxy is enabled", () => {
    const config = parseEnv(valid, { useDevProxy: true });

    expect(config.apiBaseUrl).toBe("/api");
  });

  it("still validates the base URL when the dev proxy is enabled", () => {
    expect(() =>
      parseEnv(
        { ...valid, VITE_API_BASE_URL: "not a url" },
        { useDevProxy: true },
      ),
    ).toThrow("VITE_API_BASE_URL must be an absolute URL");
  });

  it("reads a custom timeout", () => {
    const config = parseEnv(
      { ...valid, VITE_API_TIMEOUT_MS: "2500" },
      { useDevProxy: false },
    );

    expect(config.apiTimeoutMs).toBe(2500);
  });

  it("treats an empty timeout as the default", () => {
    const config = parseEnv(
      { ...valid, VITE_API_TIMEOUT_MS: "" },
      { useDevProxy: false },
    );

    expect(config.apiTimeoutMs).toBe(DEFAULT_TIMEOUT_MS);
  });

  it.each([
    ["missing", undefined],
    ["unknown", "staging"],
    ["empty", ""],
  ])("rejects an %s VITE_APP_ENV", (_label, value) => {
    expect(() =>
      parseEnv({ ...valid, VITE_APP_ENV: value }, { useDevProxy: false }),
    ).toThrow("VITE_APP_ENV must be one of development, test, uat, production");
  });

  it("rejects a missing base URL", () => {
    expect(() =>
      parseEnv({ VITE_APP_ENV: "uat" }, { useDevProxy: false }),
    ).toThrow("VITE_API_BASE_URL is required");
  });

  it("rejects an empty base URL", () => {
    expect(() =>
      parseEnv({ ...valid, VITE_API_BASE_URL: "" }, { useDevProxy: false }),
    ).toThrow("VITE_API_BASE_URL is required");
  });

  it("rejects a relative base URL", () => {
    expect(() =>
      parseEnv({ ...valid, VITE_API_BASE_URL: "/api" }, { useDevProxy: false }),
    ).toThrow("VITE_API_BASE_URL must be an absolute URL");
  });

  it("rejects a non-http protocol", () => {
    expect(() =>
      parseEnv(
        { ...valid, VITE_API_BASE_URL: "ftp://files.example.com" },
        { useDevProxy: false },
      ),
    ).toThrow("VITE_API_BASE_URL must use http or https");
  });

  it.each(["abc", "0", "-5", "1.5"])("rejects the timeout %s", (value) => {
    expect(() =>
      parseEnv(
        { ...valid, VITE_API_TIMEOUT_MS: value },
        { useDevProxy: false },
      ),
    ).toThrow("VITE_API_TIMEOUT_MS must be a positive integer");
  });
});
