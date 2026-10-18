# ADR-0001: Static local-first MVP

- React, TypeScript and Vite frontend.
- GitHub Pages: https://ydk-of.github.io/character-sheet/.
- Versioned character JSON in browser localStorage; JSON import/export for backup.
- Rules engine will use pure functions under src/rules after rules approval.
- Vitest and TypeScript checks in CI.
- No backend, login or cloud sync in MVP.
- Browser storage can be cleared; export is the user's backup.
