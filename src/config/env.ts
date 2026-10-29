import type { AppConfig, AppEnv } from "@/types/env";

export type EnvVars = Record<string, string | undefined>;

export interface ParseEnvOptions {
  // When true, requests go to /api and the Vite dev server proxies them to VITE_API_BASE_URL
  useDevProxy: boolean;
}

const APP_ENVS: readonly AppEnv[] = [
  "development",
  "test",
  "uat",
  "production",
];
const DEFAULT_TIMEOUT_MS = 10_000;
const DEV_PROXY_BASE_URL = "/api";
const FALLBACK_DEPLOYED_ENV: AppEnv = "test";

const isAppEnv = (value: string): value is AppEnv =>
  (APP_ENVS as readonly string[]).includes(value);

function parseAppEnv(value: string | undefined): AppEnv {
  if (value === undefined || !isAppEnv(value)) {
    throw new Error(
      `VITE_APP_ENV must be one of ${APP_ENVS.join(", ")}; got "${value ?? ""}"`,
    );
  }
  return value;
}

function parseApiBaseUrl(value: string | undefined): string {
  if (!value) {
    throw new Error("VITE_API_BASE_URL is required");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `VITE_API_BASE_URL must be an absolute URL; got "${value}"`,
    );
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`VITE_API_BASE_URL must use http or https; got "${value}"`);
  }
  return url.href;
}

function parseTimeoutMs(value: string | undefined): number {
  if (value === undefined || value === "") {
    return DEFAULT_TIMEOUT_MS;
  }
  const timeoutMs = Number(value);
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error(
      `VITE_API_TIMEOUT_MS must be a positive integer; got "${value}"`,
    );
  }
  return timeoutMs;
}

// Validates the Vite env once and fails fast with a message naming the bad variable
export function parseEnv(
  raw: EnvVars,
  { useDevProxy }: ParseEnvOptions,
): AppConfig {
  const env = parseAppEnv(raw.VITE_APP_ENV);
  const apiBaseUrl = parseApiBaseUrl(raw.VITE_API_BASE_URL);
  return {
    env,
    apiBaseUrl: useDevProxy ? DEV_PROXY_BASE_URL : apiBaseUrl,
    apiTimeoutMs: parseTimeoutMs(raw.VITE_API_TIMEOUT_MS),
  };
}

export function parseHosts(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host !== "");
}

// Picks the environment whose VITE_APP_HOSTS lists the hostname. Unknown hosts (raw deployment
// URLs, local `vite preview`) use the fallback so they can never reach the production API.
export function resolveDeployedEnv(
  hostname: string,
  deployed: readonly EnvVars[],
  fallbackEnv: AppEnv = FALLBACK_DEPLOYED_ENV,
): EnvVars {
  const host = hostname.toLowerCase();
  const match = deployed.find((entry) =>
    parseHosts(entry.VITE_APP_HOSTS).includes(host),
  );
  if (match) {
    return match;
  }
  const fallback = deployed.find((entry) => entry.VITE_APP_ENV === fallbackEnv);
  if (!fallback) {
    throw new Error(
      `No deployed environment for "${hostname}" and no "${fallbackEnv}" fallback`,
    );
  }
  return fallback;
}

export interface LoadAppConfigOptions {
  isDevServer: boolean;
  buildEnv: EnvVars;
  deployed: readonly EnvVars[];
  hostname: string;
}

// Dev server: the Vite mode decides (yarn dev:test, dev:uat, ...). Deployed: the domain decides,
// so one build serves test on the test URL and production once promoted to the prod domain.
export function loadAppConfig({
  isDevServer,
  buildEnv,
  deployed,
  hostname,
}: LoadAppConfigOptions): AppConfig {
  if (isDevServer) {
    return parseEnv(buildEnv, { useDevProxy: true });
  }
  return parseEnv(resolveDeployedEnv(hostname, deployed), {
    useDevProxy: false,
  });
}

export const appConfig = loadAppConfig({
  isDevServer: import.meta.env.DEV,
  buildEnv: import.meta.env,
  deployed: __DEPLOYED_ENVIRONMENTS__,
  hostname: globalThis.location.hostname,
});
