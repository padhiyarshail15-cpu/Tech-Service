# Tech-Service: Copilot instructions

React 19 + TypeScript (strict) + Vite single-page app. Yarn 4 with `node_modules`,
Node version from `.nvmrc`. Setup, scripts, CI and SonarQube details are in [README.md](../README.md).

## Quality bar for every change

- A change is done only when `yarn validate` passes (ESLint, Prettier, `tsc` strict,
  Vitest with coverage). Run it and report the result.
- SonarQube Cloud Quality Gate on new code: 0 new bugs and vulnerabilities, all security
  hotspots reviewed, coverage ≥ 80%, duplication ≤ 3%. Write code and tests that pass it.
- Never make a check pass by suppressing it: no `// NOSONAR`, `eslint-disable`,
  `@ts-ignore`, `@ts-expect-error`, `as any`, or new Sonar/coverage exclusions. Fix the
  cause. If something is truly unavoidable, explain why in a comment and in the PR.
- New or changed logic needs tests in the same change, covering every branch.

## Architecture

- `src/components/<Name>/<Name>.tsx` with `<Name>.test.tsx` next to it; one component per folder.
- `src/hooks/` custom hooks, `src/config/` env config (validated once, `appConfig`),
  `src/services/` API client, `src/constants/` static data, `src/types/` shared types,
  `src/test/` test setup. `main.tsx` only bootstraps the app.
- Import from `src` with the `@/` alias (`@/hooks/useCounter`), not `../../`.
- Keep logic in hooks or pure functions; keep components presentational.
- Render repeated UI from data instead of copy-pasting JSX (see `src/constants/links.ts`
  with `src/components/LinkList/`).

## Conventions

- Model variants with discriminated unions (see `src/types/link.ts`); prefer `unknown` to `any`.
- Keep functions small and flat; Sonar flags cognitive complexity above 15.
- Security: no secrets in code. `VITE_*` env vars are public in the browser. Avoid
  `dangerouslySetInnerHTML`. Never use `Math.random()` for tokens, IDs or anything security-related.
- Dependencies: add with `yarn add` (or `yarn add -D` for tooling) and commit `yarn.lock`.
  Prefer what is already installed before adding a new library.

## Commits and pull requests

- Conventional Commits with a lowercase subject, enforced by commitlint. The type decides
  the release: `feat:` minor, `fix:` patch, `feat!:` major; `build:`, `ci:`, `docs:`,
  `test:`, `refactor:`, `chore:` do not release.
- Branch from the latest `main` and change `main` only through a pull request.
