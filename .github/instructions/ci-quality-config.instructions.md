---
description: "Use when changing CI/CD or quality tooling: Jenkinsfile, SonarQube Cloud settings, ESLint, TypeScript or Vite config, Git hooks, GitHub workflows, Dependabot or semantic-release."
applyTo: "Jenkinsfile, sonar-project.properties, eslint.config.js, tsconfig*.json, vite.config.ts, commitlint.config.js, .releaserc.json, .husky/**, .github/**"
---

# CI/CD and quality configuration

These files define the quality gates. Changes are reviewed by the code owners in `.github/CODEOWNERS`.

- Never weaken a gate to get a build green: no lowered thresholds, disabled rules, removed
  pipeline stages, new `sonar.exclusions`, `continue-on-error`, or `--no-verify`. Fix the
  underlying problem instead, or explain in the PR why the change is needed.
- Secrets come only from Jenkins credentials or GitHub repository secrets. Never hard-code
  them, print them, or commit `.env*.local` files. Committed `.env.<mode>` files hold only
  non-secret `VITE_*` values (base URLs, env names, deployed hosts).
- Deploys: `main` builds once and deploys a staged production deployment
  (`--prebuilt --prod --skip-domain`) aliased to the test URL. Production changes only by
  promoting a deployment that was verified on test. Never deploy straight to the production
  domain from CI, and never rebuild per environment: the app picks its environment from the
  domain (`VITE_APP_HOSTS`).
- SonarQube Cloud: keep `sonar.organization` and `sonar.projectKey`
  (`padhiyarshail15-cpu_Tech-Service`). The Free plan analyses only `main` and pull requests,
  so the Sonar stage stays limited to those builds.
- `sonar.projectVersion` comes from the latest `vX.Y.Z` git tag. Never use the build number;
  it would restart the "new code" period on every build.
- semantic-release runs only on `main` after the Quality Gate. Keep
  `conventional-changelog-conventionalcommits` on v9 until semantic-release's notes generator
  supports v10.
- Keep CI and local tooling in sync: Node from `.nvmrc`, Yarn from `packageManager`, and
  `yarn install --immutable` in CI.
- The Jenkinsfile cannot be run locally. Run `yarn validate`, and state in the PR which
  pipeline stages were affected and how the change was checked.
