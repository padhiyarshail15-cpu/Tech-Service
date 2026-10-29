import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/  |  https://vitest.dev/config/

// Local dev only: the app calls /api and this proxy forwards it to the selected environment,
// which avoids CORS errors. Builds call VITE_API_BASE_URL directly.
function createApiProxy(apiBaseUrl: string) {
  const target = new URL(apiBaseUrl);
  const basePath = target.pathname.replace(/\/$/, "");
  return {
    "/api": {
      target: target.origin,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, basePath),
    },
  };
}

// Modes deployed to Vercel. Every build bundles all of them, and the app picks one at runtime
// from the domain, so the exact deployment verified on test can be promoted to production.
const DEPLOYED_MODES = ["test", "production"] as const;

function loadDeployedEnvironments() {
  return DEPLOYED_MODES.map((deployedMode) =>
    loadEnv(deployedMode, process.cwd(), "VITE_"),
  ).filter((env) => Boolean(env.VITE_APP_HOSTS));
}

export default defineConfig(({ mode }) => {
  const { VITE_API_BASE_URL: apiBaseUrl } = loadEnv(
    mode,
    process.cwd(),
    "VITE_",
  );

  return {
    plugins: [react()],
    define: {
      __DEPLOYED_ENVIRONMENTS__: JSON.stringify(loadDeployedEnvironments()),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: apiBaseUrl ? createApiProxy(apiBaseUrl) : undefined,
    },
    test: {
      // Unit tests load only .env.unit (fake URL), never the real test/uat/production values.
      // This is applied by `--mode unit` in the test scripts, since Vitest's CLI defaults to `test`.
      mode: "unit",
      environment: "jsdom",
      setupFiles: ["./src/test/setupTests.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      css: false,
      coverage: {
        provider: "v8",
        // lcov.info is what SonarQube reads (sonar.javascript.lcov.reportPaths)
        reporter: ["text", "html", "lcov"],
        reportsDirectory: "./coverage",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/main.tsx",
          "src/**/*.d.ts",
          "src/**/*.test.{ts,tsx}",
          "src/test/**",
        ],
      },
    },
  };
});
