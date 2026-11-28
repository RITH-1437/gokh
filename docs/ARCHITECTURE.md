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
    tripPack.ts           Compact positional trip form used by v2 links
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

New links (v2, written since Nov 2026):

```
https://<origin>/#e.<payload>
payload = base64url( key[16 bytes] ‖ AES-GCM-128( deflate-raw( packTrip(trip) ) ) )
```

- **Packed** (`src/utils/tripPack.ts`): a positional array instead of keyed JSON;
  UUIDs are dropped (regenerated on load), contributions reference travelers by
  index, itinerary dates are derived from the first day. Typical links are
  ~300–400 characters, 57–80% shorter than v1.
- **Encrypted** with a fresh random key per link (Web Crypto, no deps). The key
  travels inside the link, so anyone with the full link can open it — the point
  is that the trip is not readable in plain sight, and that AES-GCM's
  authentication tag makes a truncated or edited link fail cleanly as "broken".
- **Fragment, not query**: `#…` is never sent to the server, so the trip stays out
  of hosting logs and away from chat link-preview crawlers.
- **Link ID**: `linkIdFor(payload)` is an 8-char Crockford-base32 SHA-256
  fingerprint (`K7QX-2M9P`). The sender sees it after sharing and receivers see
  it in the "Shared trip" banner together with the link's creation time, so a
  group can confirm everyone has the same, latest link. Nothing is tracked.

Older formats are still decoded — never remove them:

| Version | Shape |
| --- | --- |
| v1 | `?trip=z.<base64url(deflate-raw(JSON))>` |
| v0 | `?trip=<base64url(JSON)>` |

Every decoded payload passes through `sanitizeTrip`. Payloads are capped at
200 KB encoded and 4 MB inflated (zip-bomb guard). After loading, the link is
removed from the address bar. Sharing does **not** write the link into the
address bar (a refresh would otherwise re-open that snapshot over later edits).
Pasting a link into an already-open tab is handled via `hashchange`.

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
