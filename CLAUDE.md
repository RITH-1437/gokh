# CLAUDE.md

Claude Code and other Claude-based agents: read the full operating guide here.

@AGENTS.md

## Quick start (if the import above isn't available)

GoKH is a **client-only Vue 3 + TypeScript + Vite + Tailwind** trip planner.
No backend, database, auth or API keys. Trip data lives in `localStorage` and is
shared via a `#e.<payload>` link (compressed + encrypted; legacy `?trip=` links still open).

```bash
npm run dev          # dev server (localhost:5173)
npm test             # Vitest
npm run typecheck    # vue-tsc
npm run check        # typecheck + tests + build — run before finishing
```

Key rules:

- Follow the existing style: Vue `<script setup lang="ts">`, single quotes, no
  semicolons, 2-space indent, Tailwind utility classes.
- All incoming trip data (share links, `localStorage`) must pass through
  `sanitizeTrip` in `src/utils/tripSchema.ts`.
- Domain rules (leader, contributions, itinerary dates) live in
  `src/composables/useTrip.ts`. Don't duplicate them in components.
- Never break old share links (new formats get a new prefix); never add `v-html` or new runtime deps.
- Add a regression test for every bug fix, then run `npm run check`.
- Commit with Conventional Commits; don't commit `dist/`, `node_modules/` or
  `*.tsbuildinfo`, and don't revert unrelated working-tree changes.

Full details: [AGENTS.md](AGENTS.md) and the files in [docs/](docs/).