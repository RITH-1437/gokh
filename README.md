# GoKH 🇰🇭 — Plan a Cambodia trip together

GoKH is a single-page trip planner for Cambodia. Pick a destination, add your
travel crew, choose dates, transport and accommodation, split a budget, build a
day-by-day itinerary — then share the whole plan as one link. No account and no
server: the trip lives in the link and in your browser.

## Features

- **Destinations** — 20 Cambodian destinations with suggested stay, best season
  and a "good time to go?" hint, entry fees, good-to-know tips, curated
  activity ideas and travel-advice flags (see [docs/CONTENT.md](docs/CONTENT.md)).
  Any other place can be typed in freely.
- **Crew** — add, rename and remove travelers; exactly one trip leader.
- **Dates** — start/end picker (up to 90 days); the itinerary days are generated
  automatically and keep their activities when dates change.
- **Transport & stay** — motorcycle / van / bus, hotel / guesthouse / camping.
- **Budget** — USD or KHR (fixed 1 USD = 4,000 KHR), per-traveler split and
  contribution tracking.
- **Itinerary** — activities with times and notes, one-tap suggestions,
  7 / 10 / 14-day route templates, and a live Open-Meteo forecast for trips
  within the next 14 days.
- **Before you go** — a crew checklist (visa, e-Arrival card, cash…) shared in
  the trip link, plus airports, seasons, transport and safety essentials.
- **Share** — copy a link containing the whole trip; friends open it and keep planning.
- **Autosave** — the draft is kept in `localStorage`, so a refresh doesn't lose it.

## Tech stack

Vue 3.5 (`<script setup>`, TypeScript) · Vite 8 · Tailwind CSS 3 · Vitest +
Vue Test Utils (happy-dom) · deployed on Vercel. One runtime dependency: `vue`.

## Getting started

Requires Node.js `^20.19.0 || >=22.12.0`.

```bash
git clone https://github.com/RITH-1437/gokh.git
cd gokh
npm install
npm run dev          # http://localhost:5173
```

No environment variables or API keys are needed.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`vue-tsc`) then production build to `dist/` |
| `npm run build:only` | Production build without type-check |
| `npm run typecheck` | `vue-tsc` type-check only |
| `npm test` | Run unit and component tests once |
| `npm run test:watch` | Tests in watch mode |
| `npm run preview` | Serve `dist/` with the production security headers |
| `npm run check` | Type-check + tests + build (what CI runs) |

## Documentation

| Document | Contents |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Structure, data flow, share-link format, persistence |
| [docs/CONTENT.md](docs/CONTENT.md) | Destination & activity data and how to keep it current |
| [docs/Cambodia-destination.md](docs/Cambodia-destination.md) | Source research report the content is based on |
| [docs/IMAGE_CREDITS.md](docs/IMAGE_CREDITS.md) | Credits and licenses for linked Wikimedia photos |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, input sanitization, headers |
| [docs/TESTING.md](docs/TESTING.md) | Test suite and how to run it |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel deployment and CI |
| [CHANGELOG.md](CHANGELOG.md) | Notable changes |
