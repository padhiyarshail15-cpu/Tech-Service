// ---------- Imports ----------
import js from "@eslint/js"; // ESLint's built-in recommended rules (no-undef, no-unused-vars, etc.)
import globals from "globals"; // Lists of known globals (window, document, process...) so ESLint doesn't flag them
import react from "eslint-plugin-react"; // React-specific rules (jsx-key, no-danger, etc.)
import reactHooks from "eslint-plugin-react-hooks"; // Rules of Hooks + exhaustive-deps
import reactRefresh from "eslint-plugin-react-refresh"; // Warns when a file breaks Vite's Fast Refresh
import jsxA11y from "eslint-plugin-jsx-a11y"; // Accessibility checks for JSX (alt text, labels, ARIA)
import prettier from "eslint-config-prettier"; // Disables ESLint formatting rules that conflict with Prettier
import tseslint from "typescript-eslint"; // TypeScript parser + TS-specific rules
import { defineConfig, globalIgnores } from "eslint/config"; // Helpers for writing flat config with type hints

export default defineConfig([
  // Folders ESLint should skip completely
  globalIgnores([
    "dist",
    "build",
    "coverage",
    "reports",
    ".scannerwork",
    "node_modules",
    ".yarn",
    ".pnp.cjs",
    ".pnp.loader.mjs",
    ".vercel",
  ]),

  {
    // Apply this block only to TypeScript files
    files: ["**/*.{ts,tsx}"],

    // Preset rule sets. Later entries override earlier ones.
    extends: [
      js.configs.recommended, // Core JS best-practice rules
      tseslint.configs.recommended, // TS rules; also turns off base rules that TS handles better
      react.configs.flat.recommended, // React recommended rules
      react.configs.flat["jsx-runtime"], // Turns off "React must be in scope" (not needed in modern React)
      jsxA11y.flatConfigs.recommended, // Accessibility recommended rules
      reactHooks.configs.flat.recommended, // Hooks rules (rules-of-hooks, exhaustive-deps)
      reactRefresh.configs.vite, // Fast Refresh safety rules for Vite
      prettier, // KEEP LAST: switches off formatting rules so Prettier owns formatting
    ],

    languageOptions: {
      globals: globals.browser, // Allow browser globals like window, document, fetch
    },

    settings: {
      react: { version: "detect" }, // Auto-detect installed React version for eslint-plugin-react
    },

    // Your own rules. They override everything in `extends`.
    rules: {
      // ---------- General JavaScript ----------
      "no-console": ["warn", { allow: ["warn", "error"] }], // Warn on console.log, but allow console.warn/error
      "no-debugger": "error", // Block leftover `debugger` statements
      eqeqeq: ["error", "always"], // Require === and !== (avoids type coercion bugs)
      "prefer-const": "error", // Use const when a variable is never reassigned
      "no-var": "error", // Use let/const, never var
      curly: ["error", "all"], // Always use braces for if/else/for blocks
      "no-else-return": "warn", // Remove unnecessary else after a return
      "no-nested-ternary": "warn", // Nested ternaries are hard to read
      "no-duplicate-imports": "error", // Merge multiple imports from the same module
      "no-param-reassign": "warn", // Avoid mutating function arguments
      "object-shorthand": "warn", // Use { name } instead of { name: name }
      "prefer-template": "warn", // Use `Hello ${name}` instead of string concatenation

      // ---------- TypeScript ----------
      "@typescript-eslint/no-explicit-any": "warn", // Discourage `any`; prefer `unknown` or real types
      "@typescript-eslint/no-unused-vars": [
        // Flag unused variables
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }, // ...but allow ones prefixed with _ (intentionally unused)
      ],
      "@typescript-eslint/consistent-type-imports": "warn", // Use `import type { X }` for type-only imports
      "@typescript-eslint/no-non-null-assertion": "warn", // Discourage the `!` operator

      // ---------- React ----------
      "react/prop-types": "off", // Not needed, TypeScript already checks props
      "react/jsx-key": "error", // Require `key` when rendering lists
      "react/no-array-index-key": "warn", // Avoid using array index as key
      "react/self-closing-comp": "warn", // Use <Foo /> instead of <Foo></Foo> when empty
      "react/jsx-no-useless-fragment": "warn", // Remove unnecessary <></>
      "react/jsx-no-target-blank": "error", // Add rel="noreferrer" on target="_blank" links (security)
      "react/jsx-curly-brace-presence": [
        "warn",
        { props: "never", children: "never" },
      ], // Avoid {"text"} when "text" works

      // ---------- React Hooks ----------
      "react-hooks/rules-of-hooks": "error", // Hooks only at top level of components/custom hooks
      "react-hooks/exhaustive-deps": "warn", // Keep dependency arrays complete (avoids stale closures)

      // ---------- Accessibility ----------
      "jsx-a11y/alt-text": "error", // Images need alt text
      "jsx-a11y/anchor-is-valid": "error", // Links must have a valid href
      "jsx-a11y/click-events-have-key-events": "warn", // Clickable non-buttons need keyboard support
    },
  },
]);
