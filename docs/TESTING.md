# Testing

Tests use **Vitest** with the **happy-dom** environment and **Vue Test Utils**
for components. Configuration: `vitest.config.ts` (extends `vite.config.ts`).

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run typecheck     # vue-tsc
npm run check         # typecheck + tests + build (same as CI)
```

## What is covered

| File | Covers |
| --- | --- |
| `src/utils/tripSchema.test.ts` | Sanitizer: rejecting non-trips, repairing missing fields, malformed itinerary, leader rules, duplicate members/ids, bad contributions, enum fallbacks, invalid/over-long dates, length caps, time formats, checklist ids |
| `src/utils/encoding.test.ts` | v3 round trip (Khmer + emoji), 20-day trip URL ≤ 130 chars, encryption/fresh key per link, link ID matches for sender and receiver, tamper/truncation rejected, zip-bomb cap, real v2 `e.` fixture plus v1 `z.` and v0 legacy links still open, fragment vs query detection |
| `src/utils/tripBinary.test.ts` | Binary codec round trip of every field (typed + catalog text, cents, KHR, times, year change), empty trip, malformed bytes rejected |
| `src/utils/shareDictionary.test.ts` | Phrase table is append-only (hash of frozen entries), no duplicates, fits the token space, covers all catalog text |
| `src/composables/useTripShare.test.ts` | Copied link = shown link; **regression:** sharing no longer writes the link into the address bar (refresh used to overwrite later edits) |
| `src/utils/utils.test.ts` | Date helpers, amount parsing, currency conversion/formatting, validation messages, mixed-currency funding |
| `src/composables/useTrip.test.ts` | Member/leader rules, unique ids, itinerary generation, **regression:** invalid range no longer wipes activities, >90-day guard, budget totals, shared-link loading and edit tracking, broken links, autosave/restore, reset |
| `src/composables/useWeather.test.ts` | Response mapping, no guessing for unknown places, 14-day window, API failure, **regression:** stale response can't overwrite newer one |
| `src/components/DateRangePicker.test.ts` | **Regression:** picker reflects prop changes (shared link/reset) and doesn't wipe the other date; end cleared when start passes it; max end date; over-long range error |
| `src/data/features.test.ts` | Season parsing, route templates (lengths, only empty days filled, cut to trip length), Angkor Pass fees, memorial content note, checklist toggle |
| `src/data/data.test.ts` | Destination catalog integrity, suggestion matching (**regression:** Koh Rong Sanloem, empty query) |

Current result: **8 files, 73 tests, all passing.**

## Manual / end-to-end checks

There is no automated browser E2E suite yet. Before a release, run
`npm run build && npm run preview` (serves production CSP headers) and check:

1. Fresh load — planner renders, no CSP errors in the console.
2. Open a share link — banner "Shared trip", dates/travelers/activities shown.
3. Open a broken link (`/?trip=abc`) — "This share link is broken" toast.
4. Refresh mid-plan — "Welcome back" and the draft is restored.
5. Mobile width — sticky share bar, add-traveler bottom sheet.

Checks 1–3 were verified with headless Chrome against `vite preview` on
2026-11-21. Check 4 is covered by unit tests only, and check 5 has not been
re-verified after this round of changes. Adding Playwright for these flows is
the recommended next step.
