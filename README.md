# Tech-Service

React 19 + TypeScript + Vite app with a production-style code-quality setup:
ESLint, Prettier, strict TypeScript, Vitest + coverage, Git hooks, Jenkins CI
and SonarQube Cloud Quality Gate.

## Prerequisites

- Node version from [`.nvmrc`](./.nvmrc) (`nvm use`)
- Yarn 4 via Corepack (`corepack enable`)

```bash
yarn install   # also installs Git hooks (Husky)
yarn dev
```

Git hooks also work from GUI clients such as GitHub Desktop: they load nvm
automatically ([`.husky/load-node.sh`](./.husky/load-node.sh)) because GUI apps
don't read your shell profile. If a hook still says `yarn not found`, run
`nvm use && corepack enable` once in a terminal.

## Scripts

| Script               | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `yarn dev`           | Start the Vite dev server (`development` mode)                  |
| `yarn dev:test`      | Dev server against the test API (`--mode test`)                 |
| `yarn dev:uat`       | Dev server against the UAT API (`--mode uat`)                   |
| `yarn dev:prod`      | Dev server against the production API (`--mode production`)     |
| `yarn build`         | Type-check and build for production                             |
| `yarn build:test`    | Type-check and build with the test API                          |
| `yarn build:uat`     | Type-check and build with the UAT API                           |
| `yarn typecheck`     | TypeScript type-check only (`strict` mode)                      |
| `yarn lint`          | ESLint                                                          |
| `yarn lint:fix`      | ESLint with auto-fix                                            |
| `yarn lint:report`   | ESLint JSON report for SonarQube (`reports/eslint-report.json`) |
| `yarn format`        | Format all files with Prettier                                  |
| `yarn format:check`  | Verify formatting (used in CI)                                  |
| `yarn test`          | Vitest in watch mode                                            |
| `yarn test:run`      | Run tests once                                                  |
| `yarn test:coverage` | Run tests with coverage (`coverage/lcov.info` for SonarQube)    |
| `yarn validate`      | Everything CI checks before Sonar: lint, format, types, tests   |
| `yarn release`       | semantic-release (run by Jenkins on `main` only)                |

## Project structure

```
src/
  components/      Reusable UI components, one folder per component + its test
    Counter/
      Counter.tsx
      Counter.test.tsx
  config/          Environment config, loaded and validated once at startup
  constants/       Static data and configuration
  hooks/           Custom React hooks (+ tests)
  services/        API client (fetch with timeout, typed results)
  types/           Shared TypeScript types
  test/            Test setup (jest-dom matchers, cleanup)
  App.tsx          Root component
  main.tsx         Entry point (excluded from coverage)
```

Conventions:

- Import from `src` with the `@/` alias, e.g. `import { Counter } from "@/components/Counter/Counter"`.
- Keep the test file next to the code it tests (`*.test.ts` / `*.test.tsx`).
- Prefer data-driven rendering over copy-pasted JSX (Sonar measures duplication).
- Never commit secrets. Use `.env.local` locally and Jenkins credentials in CI.
  Anything prefixed `VITE_` is shipped to the browser.

## Environments and API base URLs

The API base URL is chosen at build time from the Vite _mode_. Each mode has a
committed, non-secret env file:

| Mode          | File               | `VITE_APP_ENV` | `VITE_API_BASE_URL` |
| ------------- | ------------------ | -------------- | ------------------- |
| `development` | `.env.development` | `development`  | test API            |
| `test`        | `.env.test`        | `test`         | test API            |
| `uat`         | `.env.uat`         | `uat`          | UAT API             |
| `production`  | `.env.production`  | `production`   | production API      |

To reproduce an issue in a specific environment, run its dev server:

```bash
yarn dev:test   # or dev:uat / dev:prod
```

The app shows `Environment: <VITE_APP_ENV>` in the top-right corner (in every
environment, including production), so you can confirm which config is loaded.

Unit tests run with `--mode unit` and load `.env.unit`, so they never use real API URLs.

Vite loads `.env`, `.env.local`, and `.env.<mode>` (plus `.local` variants). Values in
`.env.local` override every mode, so keep personal overrides there and do not commit them.

Local dev requests go to `/api`, and the Vite dev server proxies them to
`VITE_API_BASE_URL`, so the browser makes no cross-origin calls. Production builds call the
API URL directly, so the API must allow CORS from the frontend origin.

Use the API client from `@/services/apiClient`:

```ts
const result = await apiClient.get<Ticket[]>("tickets");
if (result.ok) {
  console.log(result.data);
} else {
  console.error(result.error); // { kind: "http" | "network" | "timeout" | "parse" }
}
```

Deployments: Jenkins runs `vercel build --prod`, which builds in `production` mode and
uses `.env.production`. Do not set `VITE_API_BASE_URL` or `VITE_APP_ENV` in the Vercel
dashboard, because dashboard values override the committed env files at build time.
See [`.env.example`](./.env.example) for the variables.

## Quality checks: where each one runs

| Check                    |   IDE (on save)   | Pre-commit hook | Commit message | Jenkins CI | SonarQube |
| ------------------------ | :---------------: | :-------------: | :------------: | :--------: | :-------: |
| ESLint                   |        ✅         | ✅ staged files |                |     ✅     | imported  |
| Prettier                 |        ✅         | ✅ staged files |                |     ✅     |           |
| TypeScript strict        |        ✅         |                 |                |     ✅     |           |
| Unit tests + coverage    |                   |                 |                |     ✅     | coverage  |
| Conventional Commits     |                   |                 | ✅ commitlint  |            |           |
| Bugs / smells / security | SonarQube for IDE |                 |                |            |    ✅     |
| Quality Gate (pass/fail) |                   |                 |                |  ✅ waits  |  decides  |

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/),
e.g. `feat: add service list`, `fix: handle empty response`, `test: cover counter`.

## CI pipeline (Jenkins)

```
Install → Lint (+report) → Format Check → Typecheck → Unit Tests + Coverage
        → SonarQube Cloud Analysis + Quality Gate   (main and pull requests only)
        → branches: Build
        → main:     Release (semantic-release) → Deploy to Vercel
```

SonarQube Cloud's Free plan analyses only the main branch and pull requests, so
plain feature-branch builds skip the Sonar stage. Open a PR to get the Sonar check.

## Releases and versioning

Versions are created automatically by [semantic-release](https://semantic-release.gitbook.io/)
in the Jenkins `Release (main)` stage, after the Quality Gate passes. It reads the
Conventional Commits merged since the last release:

| Commit                                           | Release                 |
| ------------------------------------------------ | ----------------------- |
| `fix: ...`                                       | patch (`1.0.0 → 1.0.1`) |
| `feat: ...`                                      | minor (`1.0.0 → 1.1.0`) |
| `feat!: ...` or a `BREAKING CHANGE:` footer      | major (`1.0.0 → 2.0.0`) |
| `chore:`, `docs:`, `test:`, `refactor:`, `ci:` … | no release              |

It then pushes a `vX.Y.Z` git tag and creates a GitHub Release with generated
notes. Nothing is committed back to `main`.

- **The git tag is the source of truth for the version.** `version` in
  `package.json` stays `0.0.0` and is not used.
- The first release is `1.0.0`.
- Config: [`.releaserc.json`](./.releaserc.json).
- Jenkins needs a _Secret text_ credential `github-token`: a fine-grained GitHub
  token for this repository with **Contents**, **Issues** and **Pull requests**
  set to read & write (tag + Release, plus "released in vX.Y.Z" comments on
  merged PRs).
- If merging with **Squash and merge**, the PR title becomes the commit message,
  so it must follow Conventional Commits too.

## Pull request summary (Copilot)

When a pull request is opened, the GitHub Actions workflow
[`pr-summary.yml`](./.github/workflows/pr-summary.yml) asks GitHub Copilot to
summarise the diff and writes the result at the top of the PR description
(above the PR template checklist): **What changed**, **Why** and **Review focus**.

- Runs once per new PR. Dependabot and fork PRs are skipped (no access to secrets).
- `yarn.lock` is left out of the diff and very large diffs are truncated.
- Edit the instructions in [`pr-summary.system.txt`](./.github/prompts/pr-summary.system.txt).
- To regenerate, re-run the workflow from the PR's _Checks_ tab; the old summary is replaced.
- Jenkins is still the CI. This workflow only writes the summary and is not a required check.

Setup (once):

1. Create a **fine-grained personal access token** (GitHub → Settings → Developer settings)
   from an account with a GitHub Copilot plan, with the **Copilot Requests** permission.
2. Add it as a repository secret: _Settings → Secrets and variables → Actions →
   New repository secret_, name **`COPILOT_PAT`**.
3. Make sure GitHub Actions is enabled: _Settings → Actions → General → Allow all actions_.

Each summary uses Copilot requests from the token owner's plan.

## SonarQube Cloud

Analysis runs on [SonarQube Cloud](https://sonarcloud.io) (hosted by Sonar, free
for public repositories). Nothing needs to be installed or hosted.

Project settings live in [`sonar-project.properties`](./sonar-project.properties)
(organization, project key, sources, tests, exclusions, coverage and ESLint
report paths). The server URL and token are **not** in the repo; Jenkins
injects them.

One-time setup:

1. **SonarQube Cloud** (log in at `https://sonarcloud.io` with GitHub):
   - _+ → Analyze new project_ → import the GitHub organization, then select `Tech-Service`.
   - Check the keys in _Project → Information_ and make sure they match
     `sonar.organization` and `sonar.projectKey` in `sonar-project.properties`.
   - _Administration → Analysis Method_: **turn off Automatic Analysis**. Jenkins runs
     the analysis, and both cannot be on at the same time.
   - _My Account → Security_: generate a token.
   - _Administration → New Code_: **Previous version**. Jenkins sends the latest release
     tag as `sonar.projectVersion`, so the new-code period restarts after each release.
     Pull requests always use the PR diff.
   - No webhook is needed. The scanner waits for the Quality Gate itself
     (`sonar.qualitygate.wait=true` in the Jenkinsfile); webhooks are not sent on the Free plan.
2. **Jenkins**:
   - Install the **SonarQube Scanner** plugin.
   - Add the token as a _Secret text_ credential, e.g. ID `sonarcloud-token`.
   - _Manage Jenkins → System → SonarQube servers_: name `sonarcloud`, URL `https://sonarcloud.io`,
     token `sonarcloud-token`.
   - _Manage Jenkins → Tools → SonarQube Scanner installations_: name `sonar-scanner`, install automatically.
   - Use a **Multibranch Pipeline** job with **Discover pull requests from origin**, so PRs are
     analysed and reported on GitHub. Optionally set branch discovery to
     _Exclude branches that are also filed as PRs_ to avoid building the same code twice.

Until this is done, run the build with the `RUN_SONAR` parameter unchecked.

Developers can see the same issues in VS Code with **SonarQube for IDE** in connected mode
(connect to SonarQube Cloud, organization `padhiyarshail15-cpu`).
