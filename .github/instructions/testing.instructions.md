---
description: "Use when writing or fixing unit tests with Vitest and React Testing Library: queries, user events, hooks, mocks, and reaching SonarQube coverage on new code."
applyTo: "src/**/*.test.ts, src/**/*.test.tsx"
---

# Unit tests (Vitest + React Testing Library)

- Import test APIs explicitly: `import { describe, expect, it, vi } from "vitest"`
  (globals are not enabled). jest-dom matchers and cleanup are set up in `src/test/setupTests.ts`.
- Test behaviour the user sees, not implementation details (internal state, private helpers).
- Query the way a user would, in this order: `getByRole` (with `name`), `getByLabelText`,
  `getByText`. Use `container.querySelector` only for decorative elements with no
  accessible role, as in `LinkList.test.tsx`.
- Interact with `userEvent`:
  ```ts
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Count is 0" }));
  ```
- Hooks: `renderHook` and wrap updates in `act` (see `src/hooks/useCounter.test.ts`).
- Cover every branch of new logic plus edge cases (empty data, boundaries, errors).
  SonarQube needs at least 80% coverage on new code, branches included.
- Keep tests deterministic: no real network or timers. Use `vi.fn()`, `vi.spyOn()` and
  `vi.useFakeTimers()`, and restore them after the test.
- No snapshot tests for components; assert specific text, roles and attributes instead.
- Check locally with `yarn test:coverage`; uncovered lines are listed per file.
