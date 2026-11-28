# Destination & activity content

The travel content in the app is based on the research report
[Cambodia-destination.md](Cambodia-destination.md) (prices and rules checked
November 2026). This page explains how that report maps into code and how to
keep it current.

## Where the data lives

| File | Contents |
| --- | --- |
| `src/data/destinations.ts` | One entry per destination: `name`, `region`, `emoji`, `tagline`, `suggestedName` (auto trip name), optional `image`, `days`, `bestSeason`, `advisory`, `fees`, `tips`, `coordinates` (used for weather) |
| `src/data/activities.ts` | Suggested activities per destination. **Only the first 6 are shown**, so lists start with the must-sees. |
| `src/data/essentials.ts` | "Before you go" crew checklist and practical info (airports, seasons, getting around, safety) |
| `src/data/routes.ts` | 7 / 10 / 14-day route templates from the report's *Sample itineraries* |

When a destination is selected the panel shows: suggested stay and best season
(from the report's *Destination data for the app* table), a "good time to go?"
line for the trip's start month (or the current month), a travel-advice callout
(`advisory`), **entry fees** (`fees`, foreign adult prices with the
`FEES_CHECKED` date) and **good-to-know tips** (`tips`: dress codes, timing,
the memorial-site content note for Phnom Penh, ethical elephant sanctuaries,
landmine safety).

**Regions** follow the report's data table, with two deliberate deviations:
Phnom Penh keeps "Capital" (a "Phnom Penh" badge on the Phnom Penh card would be
redundant), and the report's "Siem Reap & Angkor" is shortened to "Angkor" so it
fits the photo-card badge.

## Entry fees in the app

| Destination | Fees |
| --- | --- |
| Siem Reap, Angkor Wat | Angkor Pass 1 day $37 · 3 days $62 · 7 days $72 |
| Phnom Penh | Royal Palace ~$10 · Tuol Sleng $5 (+$5 audio) · Choeung Ek $3 (+$3 audio) |
| Kulen Mountain | $20 cash, not on the Angkor Pass |
| Koh Ker | $15, not on the Angkor Pass |
| Beng Mealea | Angkor Pass or single ticket |
| Sambor Prei Kuk | Small fee, cash |
| Battambang | Bamboo train ~$5 |
| Mondulkiri | Elephant Valley Project day visit $55–85 |

## Before you go & route templates

- **Step 8 "Before you go"** (optional): a 6-item crew checklist — visa,
  e-Arrival card, clean USD notes, temple clothing, ride-hailing app, travel
  advice. Ticks are stored in `trip.checklist` and travel in the share link;
  unknown ids are dropped by the sanitizer. Below it: airports, seasons,
  getting around and safety cards.
- **Route templates** appear in step 7 while no day has activities. Applying
  one fills empty days only; a template longer than the trip is cut to the trip
  length. Templates span several cities, so they don't change the trip's
  destination.

## Destinations (26)

| Destination | Region (app) | Stay | Best season | Advisory | Photo |
| --- | --- | --- | --- | --- | --- |
| Phnom Penh | Capital | 2–3 days | Nov–Mar | | ✓ |
| Siem Reap | Angkor | 3–4 days | Nov–Mar | | ✓ |
| Angkor Wat | Angkor | 3–4 days | Nov–Mar | | ✓ |
| Kampot | South coast | 2–3 days | Nov–May | | ✓ |
| Kep | South coast | 1–2 days | Nov–May | | ✓ |
| Koh Rong | South coast | 2–3 days | Nov–May | | ✓ |
| Koh Rong Sanloem | South coast | 2–3 days | Nov–May | | Commons |
| Sihanoukville | South coast | 0–1 day | Nov–May | | Commons |
| Battambang | Northwest | 2 days | Nov–Mar | | ✓ |
| Mondulkiri | Northeast | 2–3 days | Nov–Apr | | Commons |
| Ratanakiri | Northeast | 2–3 days | Nov–Apr | | Commons |
| Koh Kong | Southwest | 1–2 days | Nov–Apr | Thai border area | Commons |
| Bokor | South coast | 1 day | Nov–May | | ✓ |
| Kulen Mountain | Angkor | 1 day | Jun–Dec | | Commons |
| Tonle Sap | Angkor | Half day | Jul–Dec | | Commons |
| Beng Mealea | Northwest | Half day | All year | | Commons |
| Koh Ker | Northwest | 1 day | Nov–Mar | | Commons |
| Sambor Prei Kuk | Northwest | ½–1 day | Nov–Mar | | |
| Kratie | Northeast | 1–2 days | Dec–May | | Commons |
| Chi Phat | Southwest | 2–3 days | Nov–Apr | | Commons |
| Banteay Srei | Angkor | ½ day | Nov–Mar | | Commons |
| Roluos Group | Angkor | ½ day | Nov–Mar | | Commons |
| Koh Dach | Capital | ½ day | Nov–Mar | | Commons |
| Koh Tonsay | South coast | 1 day | Nov–May | | Commons |
| Tatai River | Southwest | 1–2 days | Nov–Apr | Thai border area | Commons |
| Stung Treng | Northeast | 1–2 days | Dec–May | | Commons |

The 7 destinations with bundled photos are the "Popular in Cambodia" cards; all
others are listed under "More places" (grouped by region) and can also be typed. "Commons" photos are linked directly
from Wikimedia Commons with credits — see [IMAGE_CREDITS.md](IMAGE_CREDITS.md). Coordinates for the six destinations added
from the report (Tonle Sap → Kampong Phluk, Beng Mealea, Koh Ker, Sambor Prei
Kuk, Kratie, Chi Phat) are approximate town/site centres, which is enough for a
regional forecast. The same applies to the six places added later from the
report's "must-see" and "beyond the temples" notes (Banteay Srei, Roluos Group,
Koh Dach, Koh Tonsay, Tatai River, Stung Treng).

**Intentionally not included:** Preah Vihear Temple — the report lists it as
closed (Thai border area). Add it back with an `advisory` once it reopens.

## Status of the report's feature ideas

Implemented from *Suggested product features*: advisory badge, entry fees
with a checked date, a season indicator (per destination, for the trip month),
shared pre-trip checklist, and the route templates. Etiquette and the
memorial-site content note are shown as destination tips.

Still not implemented:
- **Per-vehicle cost split** — needs a budget design decision (expenses vs. the
  current contributions model).
- **PassApp / Grab deep links** — not added because their deep-link URLs could
  not be verified; the checklist mentions both apps instead.
- **Season filter** that reorders activity suggestions by wet/dry season.
- **Photo for Sambor Prei Kuk** (see IMAGE_CREDITS.md).

## Keeping content current

Border advice, entry fees and opening times change. Before each travel season
(at least every November):

1. Re-check the *Safety* section sources in the report and update `advisory`
   values (and add/remove destinations near the Thai border accordingly).
   Re-check fees and update `FEES_CHECKED` (`destinations.ts`) and
   `ESSENTIALS_CHECKED` (`essentials.ts`).
2. Update the report itself, including the "checked" date.
3. Run `npm test` — `src/data/data.test.ts` verifies every destination has
   coordinates inside Cambodia, suggestions, stay length and season, and that
   suggestion lists have no duplicates.
4. New destination names, suggested trip names, activities or route stops:
   **append** them to the end of `SHARE_DICTIONARY` in
   `src/utils/shareDictionary.ts` so share links stay short
   (`shareDictionary.test.ts` lists anything missing). Never edit, reorder or
   delete existing entries, even when the catalog text changes, because old
   share links refer to them by position.
