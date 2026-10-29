export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_ENV?: string;
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_API_TIMEOUT_MS?: string;
    readonly VITE_APP_HOSTS?: string;
  }

  // Injected by vite.config.ts: the VITE_* values of every deployable mode (.env.test, .env.production)
  const __DEPLOYED_ENVIRONMENTS__: Record<string, string | undefined>[];
}
