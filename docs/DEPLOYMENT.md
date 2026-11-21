# Deployment

GoKH is a static site. `npm run build` produces `dist/`, which can be served by
any static host. Production runs on **Vercel**, configured by `vercel.json`.

## Vercel

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Install | `npm install` |
| Build | `npm run build` (type-check + Vite build — type errors fail the deploy) |
| Output | `dist` |
| Node | `^20.19.0 \|\| >=22.12.0` (from `package.json` `engines`) |
| Env vars | None required |

`vercel.json` also sets:
- security headers for all routes (see [SECURITY.md](SECURITY.md));
- `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`
  (file names are content-hashed, so this is safe).

No rewrites are needed: the app is a single page and state is in the query
string. There is no database, so no migrations or backups to manage; user data
lives only in share links and the user's browser.

## CI

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests:
`npm ci` → type-check → tests → build → `npm audit --omit=dev --audit-level=high`.

## Pre-release checklist

1. `npm run check` passes.
2. `npm run preview` and run the manual checks in [TESTING.md](TESTING.md).
3. Review destination advisories (see [CONTENT.md](CONTENT.md)).
4. Add an entry to [CHANGELOG.md](../CHANGELOG.md).

## Images

Photos are WebP under `src/assets/images/`, sized for their largest display
slot (≤1200 px wide, quality 80). Add new photos the same way — a large PNG
photo can easily be 10+ MB.
