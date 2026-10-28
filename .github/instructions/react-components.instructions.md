---
description: "Use when creating or editing React components, hooks or App.tsx: component structure, props, state, effects and keeping SonarQube maintainability high."
applyTo: "src/**/*.tsx, src/hooks/**/*.ts"
---

# React components and hooks

- Function components with a named export and a `<Name>Props` interface declared above
  the component. `App` keeps its default export because `main.tsx` imports it.
- One component per file. Small private sub-components in the same file are fine if
  they are not exported.
- Keep state local. Once logic is more than a simple `useState`, move it into a hook in
  `src/hooks/useX.ts` with its own test (see `useCounter`).
- Derive values during render instead of copying props or state into new state with `useEffect`.
  Use effects only to sync with something outside React (timers, subscriptions, DOM APIs)
  and always return a cleanup when needed.
- List keys come from stable data (id, href), never from the array index.
- Use semantic elements (`<button>`, `<a href>`, headings in order) so components are
  accessible and testable by role.
- Styling uses class names in the existing CSS files; avoid inline `style` for layout.
- Every new component or hook ships with a test file next to it.
