# Instructions for AI agents

Build an interactive character sheet for the author's tabletop RPG. Host the static client on GitHub Pages at /character-sheet/.

- Never invent game rules, formulas, races, costs or prerequisites. Use owner-approved sources only. Mark uncertainty RULES-REVIEW REQUIRED.
- This repository is public: do not upload rulebooks, private biographies, licensed art, credentials or source documents without publication permission.
- Keep calculations in pure, typed functions under src/rules/ after rules review; UI must not duplicate formulas.
- Keep versioned character data; preserve compatibility or provide migrations.
- Work through GitHub Issues, feature branches, tests and pull requests. Owner approves merges.
- Russian UI, responsive layout, keyboard accessibility, offline-first behavior.
- No backend in the first GitHub Pages MVP.
- Run npm test and npm run build before requesting review.

Role instructions live in .agents/. These files define responsibilities; they do not automatically start separate bots.
