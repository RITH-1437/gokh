# Changelog

## Unreleased — 2026-11-21 · More places & mobile polish

### Added
- 6 more destinations from the report, each with a credited Wikimedia photo,
  stay, season and activity ideas: Banteay Srei, Roluos Group, Koh Dach
  (Silk Island), Koh Tonsay (Rabbit Island), Tatai River (with border advice)
  and Stung Treng. The catalog now has 26 places.
- "More places" list in the destination step: every place beyond the 7 popular
  cards is now one tap away, grouped by region (previously you had to type the name).

### Fixed
- Mobile: transport/stay card titles ("Motorcycle", "Guesthouse") were cut off
  on phones; the hero trip card's dates were truncated.
- Reduced motion: entrance animations still waited for their delays and money
  totals still counted up; both now appear instantly.

## Unreleased — 2026-11-21 · Immersive redesign (continued)

### Changed
- New shared `PhotoChoiceCard`: destination, transport and stay choices are now
  full-photo cards with a clear selected state (falls back to a tile if a photo fails).
- Restyled the section headers, sticky progress bar, trip card, share panel,
  mobile share bar and footer (now dark) to match the photo hero.
- Fewer icons: removed decorative emojis and icons from the hero, header,
  destination panel, dates, budget, itinerary, travelers and "Before you go".
  Kept only the ones that carry meaning or are tap targets (selected check,
  travel-advice warning, edit/delete/add, leader crown, per-day weather).

## Unreleased — 2026-11-21 · Audit & hardening

### Fixed
- **Date picker** ignored dates set from outside (shared links, restored drafts,
  "Start over"), and picking one date overwrote the other with an empty value.
  It is now fully controlled by the trip state.
- **Itinerary data loss:** choosing an end date before the start date deleted
  every planned activity. Invalid or >90-day ranges now leave the itinerary intact.
- **Crafted or truncated share links** could crash the page (e.g. missing
  `activities` arrays). Links are now sanitized; broken links show a clear message.
- Negative budget/contribution amounts could be entered.
- Budget totals and warnings ignored contribution currency.
- Weather: out-of-order responses could show the forecast for old dates; unknown
  destinations silently showed Siem Reap weather; the note always blamed the
  14-day window. Each case now has an accurate message.
- Activities could be saved with an empty name.
- Activity suggestions: "Koh Rong Sanloem" showed Koh Rong's list and an empty
  destination showed Siem Reap's.
- Member/activity IDs could collide (`Date.now()`); now `crypto.randomUUID()`.
- Header "Share" failed silently when copying wasn't possible.
- 4 TypeScript errors; the build now type-checks before bundling.

### Added
- Draft autosave to `localStorage` with "Welcome back" restore.
- Destination content from `docs/Cambodia-destination.md`: suggested stay, best
  season, travel advisory (Koh Kong), refreshed activity lists, and 6 new
  destinations (Tonle Sap, Beng Mealea, Koh Ker, Sambor Prei Kuk, Kratie, Chi Phat).
- Security headers (CSP, frame, referrer, permissions) and immutable asset caching.
- Test suite (Vitest + Vue Test Utils, 73 tests) and GitHub Actions CI.
- Documentation: architecture, content, security, testing, deployment.

### Added — from docs/Cambodia-destination.md
- Entry fees per destination (Angkor Pass, Phnom Penh sites, Kulen, Koh Ker,
  bamboo train, Elephant Valley Project) with a "checked Nov 2026" note.
- Good-to-know tips: temple dress code, sunrise/ticket timing, memorial-site
  content note, ethical elephant sanctuaries, landmine safety, ferry piers.
- "Good time to go?" hint from each destination's best season.
- Step 8 "Before you go": shared crew checklist (stored in the trip link) and
  practical info on airports, seasons, transport and safety.
- 7 / 10 / 14-day route templates that fill empty itinerary days.
- Region labels aligned with the report (Angkor, South coast, Northwest,
  Northeast, Southwest).

- Photos for 11 more destinations, linked directly from Wikimedia Commons with
  author/license credits and an emoji fallback if a photo fails to load.

### Changed — visual redesign (immersive travel)
- Hero is now a full-bleed photo panel that switches to the chosen
  destination (crossfade + slow zoom, Angkor Wat by default), with a bold white
  headline and a frosted-glass live trip card.
- Destination cards are tall, photo-led cards with glass region badges, stay
  length, a Choose/Selected pill, hover zoom and a ring for the selected one.
- New `glass` / `glass-strong` utilities; motion respects reduced-motion.

### Changed
- Photos converted from PNG to sized WebP: 22.3 MB → 0.8 MB (the Siem Reap
  photo alone was 16 MB). Favicon is now a 192×192 square (111 KB → 19 KB).
- Dependencies: Vue 3.5.46 and Vite 8.3.8 (security fixes), vue-tsc 3.
- Input length limits on names and activities, matching the share-link limits.
