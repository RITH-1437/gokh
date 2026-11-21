# Security

## Threat model

GoKH has no server, accounts or stored user data, so server-side classes of
vulnerability (SQL injection, CSRF, IDOR, broken access control, session
handling) do not apply. The realistic risks are:

| Risk | Mitigation |
| --- | --- |
| **Crafted share links** (`?trip=`) crashing or abusing the app | Every decoded payload passes through `sanitizeTrip` (`src/utils/tripSchema.ts`): types checked, enums whitelisted, strings length-capped, dates must be real `YYYY-MM-DD` values, ranges capped at 90 days, ≤50 travelers, ≤50 activities/day, amounts finite and non-negative, contributions only for existing travelers, exactly one leader. Payloads >200 KB are rejected before decoding. Saved drafts go through the same function. |
| **XSS** | No `v-html`/`innerHTML`; all user text is rendered via Vue interpolation (escaped). Image `src` values come only from bundled assets or fixed Wikimedia Commons URLs in the catalog (never from share-link data). Strict CSP (below). |
| **Trip data leaking via Referer** | `Referrer-Policy: no-referrer`; the `trip` param is removed from the URL after loading. |
| **Clickjacking** | `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`. |
| **Third-party images** | Wikimedia photos are requested by visitors' browsers; `Referrer-Policy: no-referrer` means Wikimedia sees only the IP, not the page or trip. Failed loads fall back to an emoji tile. |
| **Supply chain** | One runtime dependency (`vue`). CI runs `npm audit --omit=dev --audit-level=high`. |

**Privacy note:** a share link contains the whole trip (traveler names, budget).
Anyone holding the link can read it — treat it like the trip itself. Drafts are
stored only in the browser's `localStorage`.

## HTTP headers (vercel.json)

```
Content-Security-Policy: default-src 'self'; script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://thumb.wikimedia.org https://upload.wikimedia.org;
  connect-src 'self' https://api.open-meteo.com; object-src 'none';
  base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

`style-src 'unsafe-inline'` is required for Vue `:style` bindings and inline
style attributes; scripts remain `'self'` only. `vite preview` reads these same
headers from `vercel.json`, so a CSP problem is visible locally before deploy.
If you add a new external service, add its origin to `connect-src` (or the
relevant directive).

## Dependency status (2026-11-21)

- `npm audit --omit=dev`: **0 vulnerabilities**.
- Dev-only: 5 moderate advisories via `@vue/test-utils → js-beautify →
  minimatch/glob` (ReDoS on attacker-controlled glob patterns). Only reachable
  in the local test tooling with patterns we control; accepted until upstream
  updates.

## Reporting

Please report security issues privately to the repository owner rather than in
a public issue.
