export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_ENV?: string;
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_API_TIMEOUT_MS?: string;
  }
}
