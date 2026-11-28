# Architecture

GoKH is a **client-only** Vue 3 single-page app. There is no backend, database,
user account or authentication — so there are no APIs, migrations or roles to
document. All state lives in the browser; sharing works by encoding the trip
into the URL.

## Folder structure

```
src/
  App.vue                 Page composition, step navigation, share/reset, startup
  main.ts                 App bootstrap
  index.css               Tailwind layers + shared component classes (btn-*, field, surface…)
  types/trip.ts           Domain types: Trip, Member, Budget, ItineraryDay, Destination…
  composables/
    useTrip.ts            Single source of truth for the trip + domain rules
    useWeather.ts         Open-Meteo forecast (race-safe)
    useTripShare.ts       Build share URL, copy to clipboard
    useToasts.ts          Global toast queue
    useAnimatedNumber.ts  rAF number tweening for budget figures
  utils/
    tripSchema.ts         sanitizeTrip(): trust boundary for untrusted trip data
    encoding.ts           Trip <-> share links (packed, compressed, encrypted)
    tripBinary.ts         Compact binary trip form used by v3 links
    shareDictionary.ts    Frozen catalog phrase table for v3 links (append-only)
    tripPack.ts           Decoder for v2 links (decode only)
    storage.ts            localStorage draft persistence (guarded)
    dates.ts              Local-time ISO date helpers, MAX_TRIP_DAYS
    currency.ts           USD/KHR conversion, formatting, safe amount parsing
    validation.ts         User-facing validation messages
    id.ts                 Collision-safe IDs (crypto.randomUUID)
    season.ts             Best-season parsing ("Nov–Mar" -> months)
  data/
    destinations.ts       Destination catalog (see docs/CONTENT.md)
    activities.ts         Activity suggestions + matching
    essentials.ts         "Before you go" checklist + practical info
    routes.ts             7/10/14-day route templates
  components/             Presentational components (one per planner step + shared UI)
```

## Data flow

```
             ┌──────────── useTrip() ────────────┐
URL ?trip= ─▶│ readTripFromUrl → sanitizeTrip    │
localStorage▶│ loadSavedTrip  → sanitizeTrip     │──▶ trip (ref<Trip>) ──▶ components (props)
             │ watchers: itinerary days, autosave│◀── events (emit) ◀───── components
             └───────────────────────────────────┘
```

- `App.vue` owns a single `useTrip({ persist: true })` instance and passes slices
  of `trip` down as props; components emit events back. No global store is
  needed at this size.
- Startup order (`App.vue` `onMounted`): a valid shared link wins → otherwise the
  saved draft is restored → otherwise an empty trip. A broken link shows a toast.
- **Domain rules live in `useTrip`**: first traveler becomes leader, exactly one
  leader, removing a traveler removes their contribution, itinerary days follow
  the date range (an invalid or >90-day range leaves the itinerary untouched),
  contributions are converted into the budget currency, amounts are never negative.

## Share-link format

Current links (v3):

```
https://<origin>/#f.<payload>
payload = base64url( key[16 bytes] ‖ AES-GCM( mode[1] ‖ body ) )   64-bit tag
body    = writeTripBinary(trip), deflated when that is smaller (mode 1)
```

- **Compact binary** (`src/utils/tripBinary.ts`): varints instead of JSON, no
  ids (regenerated on load), travelers referenced by position, dates stored as
  day offsets from the start date. The layout is documented at the top of the file.
- **Catalog phrases as codes** (`src/utils/shareDictionary.ts`): destinations,
  suggested trip names and suggested activities are stored as their position in
  a frozen, **append-only** table. The most-suggested activities come first,
  so they take 1 byte each. Typed text is stored as-is.
- **Result**: a real 20-day Kampot trip went from 379 characters (v2) to 126 for
  the full URL. It's encrypted the same way v2 was.
- **Encrypted** with a fresh random key per link (Web Crypto, no deps). The key
  travels inside the link, so anyone with the full link can open it. The point
  is that the trip is not readable in plain sight, and that the AES-GCM tag makes
  a truncated or edited link fail cleanly as "broken". A fixed IV is safe because
  a key is never reused.
- **Fragment, not query**: `#…` is never sent to the server, so the trip stays out
  of hosting logs and away from chat link-preview crawlers.
- **Link ID**: `linkIdFor(payload)` is an 8-char Crockford-base32 SHA-256
  fingerprint (`K7QX-2M9P`). The sender sees it after sharing and receivers see
  it in the "Shared trip" banner together with the link's creation time (to the
  minute), so a group can confirm everyone has the same, latest link. Nothing is
  tracked.

Older formats are still decoded. Never remove them:

| Version | Shape |
| --- | --- |
| v2 | `#e.<base64url(key ‖ AES-GCM-128(deflate(JSON(packTrip))))>` (`tripPack.ts`, Nov 2026) |
| v1 | `?trip=z.<base64url(deflate-raw(JSON))>` |
| v0 | `?trip=<base64url(JSON)>` |

Every decoded payload passes through `sanitizeTrip`. Payloads are capped at
200 KB encoded and 4 MB inflated (zip-bomb guard), and the binary reader rejects
truncated, oversized or trailing data. After loading, the link is removed from
the address bar. Sharing does **not** write the link into the address bar (a
refresh would otherwise re-open that snapshot over later edits). Pasting a link
into an already-open tab is handled via `hashchange`.

**Changing the format:** never edit, reorder or delete entries in
`SHARE_DICTIONARY`, `SHARE_CHECKLIST` or the enum lists in `tripBinary.ts`
(append only), and never change `SHARE_DICTIONARY_CAPACITY`. A different layout
needs a new prefix (`g.` …) and a backward-compat test with a real link fixture.

## Persistence

The trip is saved to `localStorage` under `gokh:trip:v1` 250 ms after the last
change. Restored drafts are sanitized like share links; empty drafts are not
restored. "Start over" clears the saved draft. If storage is unavailable
(private mode, quota) the app keeps working without persistence.

## External services

| Service | Used for | Notes |
| --- | --- | --- |
| Open-Meteo `api.open-meteo.com` | Daily forecast | Free, no key. Only for catalog destinations with coordinates, within 14 days. Stale responses are discarded. |
| Google Maps | "Directions" deep link | Opened in a new tab with `noopener`. |
| Google Fonts | Manrope typeface | Loaded from `index.html`. |
