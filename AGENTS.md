# AGENTS.md — Working in GoKH

GoKH is a **client-only Vue 3 trip planner for Cambodia**. There is no backend,
database, auth or server state. All trip data lives in the browser and is shared
through a `?trip=` URL.

Use this file as the operating guide. Read the linked docs in `docs/` before
large changes.

## Commands

```bash
npm install          # install (Node ^20.19 || >=22.12)
npm run dev          # Vite dev server, http://localhost:5173
npm run typecheck    # vue-tsc type-check only
npm test             # Vitest run once
npm run test:watch   # Vitest watch mode
npm run build        # typecheck + production build to dist/
npm run check        # typecheck + tests + build (mirror CI; run before finishing)
npm run preview      # serve dist/ with production security headers
```

- CI (`.github/workflows/ci.yml`) runs `npm ci`, `typecheck`, `npm test`,
  `build:only`, and `npm audit --omit=dev --audit-level=high`. Keep `npm run check` green.
- No environment variables or API keys are required.
- Do not add runtime dependencies; `vue` is the only one by design.

## Code style

- Vue 3 SFCs with `<script setup lang="ts">`; Composition API, `ref`/`computed`/`watch`.
- TypeScript throughout, no `any` for domain data. `strict` is on via `@vue/tsconfig`;
  unused locals/parameters fail the typecheck.
- Formatting seen in the repo: **single quotes, no semicolons, 2-space indent,
  trailing commas**, arrow functions, optional chaining.
- Styling is Tailwind. Reuse the shared classes in `src/index.css`
  (`btn-primary`, `btn-ghost`, `btn-gold`, `field`, `surface`, `chip`, `focus-ring`)
  before writing new utility strings.
- Components are presentational: they receive props and `emit` events. Do not add
  global stores — `App.vue` owns one `useTrip({ persist: true })` instance.
- No `v-html` / `innerHTML`; user text goes through normal Vue interpolation.

## Architecture map

| Path | Responsibility |
| --- | --- |
| `src/App.vue` | Page composition, step navigation, startup order, share/reset |
| `src/types/trip.ts` | `Trip`, `Member`, `Budget`, `ItineraryDay`, `Destination` |
| `src/composables/useTrip.ts` | **Single source of truth** + domain rules |
| `src/composables/useWeather.ts` | Open-Meteo forecast (race-safe) |
| `src/composables/useTripShare.ts` | Build/copy share URL |
| `src/composables/useToasts.ts` | Global toast queue |
| `src/utils/tripSchema.ts` | `sanitizeTrip()` — **trust boundary** for all trip data |
| `src/utils/encoding.ts` | Trip ↔ URL-safe base64 share links |
| `src/utils/storage.ts` | localStorage draft (`gokh:trip:v1`) |
| `src/utils/dates.ts` | Local-time ISO helpers, `MAX_TRIP_DAYS` |
| `src/utils/currency.ts` | USD/KHR (1 USD = 4,000 KHR), parsing, formatting |
| `src/data/` | Destination catalog, activities, routes, essentials |
| `src/components/` | One component per planner step + shared UI |
| `docs/ARCHITECTURE.md` | Full structure, data flow, share format, persistence |

See `docs/SECURITY.md` for the threat model and CSP rules.

## Invariants — do not break

- **All incoming trip data is untrusted.** Anything read from `?trip=` or
  `localStorage` must go through `sanitizeTrip` (`tripSchema.ts`). It whitelists
  enums, caps string lengths, validates real `YYYY-MM-DD` dates, caps ranges at
  90 days (`MAX_TRIP_DAYS`), limits ≤50 travelers and ≤50 activities/day, and
  forces non-negative finite amounts.
- **Share-link format is stable**: UTF-8 JSON → base64 → URL-safe (`+`→`-`,
  `/`→`_`, no padding), sent as `?trip=<payload>`. Do not change it — old links
  must keep working. Payload limit is 200 KB.
- **Domain rules live in `useTrip`**: first traveler is the leader, exactly one
  leader, removing a traveler removes their contribution, itinerary days follow
  the date range, an invalid or >90-day range leaves the itinerary untouched,
  contributions are converted to the budget currency.
- **Local dates only.** Parse/format with `parseISODate` to avoid timezone drift.
- **Currency is fixed** at 1 USD = 4,000 KHR; never introduce a live rate.
- **IDs** come from `src/utils/id.ts` (`crypto.randomUUID`).
- **Persistence is guarded**: storage failures (private mode/quota) must not break
  the app. Autosave happens 250 ms after the last change; empty drafts are not
  restored.
- **No XSS**: no raw HTML; only bundled/local image assets for `src`.

## Where to change what

| Task | Files |
| --- | --- |
| Add/change a destination or photo | `src/data/destinations.ts`, image under `src/assets/images/place/` |
| Change suggested activities | `src/data/activities.ts` (only the first 6 show) |
| Add a new planner field | `src/types/trip.ts` → `sanitizeTrip` → `useTrip` → relevant component(s) → tests |
| Change share/persistence behaviour | `encoding.ts` / `storage.ts` + `useTrip` + matching `*.test.ts` |
| Add an external service | add origin to CSP in `vercel.json` (see `docs/SECURITY.md`) |
| UI tokens/shared classes | `src/index.css`, `tailwind.config.js` |

## Testing

Tests are Vitest + happy-dom + Vue Test Utils; tests sit next to the code
(`foo.test.ts`).

- Every bug fix should include a regression test that fails before the fix.
- Every new behaviour (sanitize, domain rule, data invariant) needs a test.
- `src/data/data.test.ts` asserts catalog integrity — keep it passing when editing
  content (coordinates inside Cambodia, stay/season present, no duplicate
  suggestions).
- Component tests use `mount` from `@vue/test-utils`; prefer testing behaviour via
  props/emits over implementation details.
- There is no browser E2E suite. For UI work, at minimum run
  `npm run build && npm run preview` and check the console (CSP errors) and the
  mobile layout.
- Finish with `npm run check` (typecheck + tests + build). Report what you ran.

## Content updates

Travel content (fees, seasons, advisories) is based on `docs/Cambodia-destination.md`.
When changing it, update the data, bump `FEES_CHECKED` in `destinations.ts`, update
the report date, and run `npm test`. See `docs/CONTENT.md`.

## Git hygiene

- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
- Keep commits focused; do not commit unrelated files or generated output.
- `node_modules`, `dist`, `*.tsbuildinfo` are gitignored — never commit them.
- Do not rewrite history, force-push, or amend pushed commits.
- Do not revert user changes you did not make; the working tree may contain
  work-in-progress.
- Vercel deploys from `main`; do not change `vercel.json` build/output settings
  unless asked.

## Safety / boundaries

- Do not run destructive commands (`git reset --hard`, `git clean -f`, removing
  files outside the task) without explicit confirmation.
- Do not add secrets, API keys, analytics or tracking.
- Prefer editing existing files over creating new ones; keep changes small and
  reviewable.
- When a task is ambiguous, inspect the relevant code and docs first, then ask.