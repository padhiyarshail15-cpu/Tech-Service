export type AppEnv = "development" | "test" | "uat" | "production";

export interface AppConfig {
  env: AppEnv;
  apiBaseUrl: string;
  apiTimeoutMs: number;
}
