# Go iPhone — Backend API

One backend, one database, shared by the **storefront** (goiphone.com) and the
**admin app** (admin.goiphone.com). Neither frontend ever touches the database
directly — they only call this API.

```
goiphone.com        ──┐
                      ├──►  api.goiphone.com  ──►  Postgres (+ object storage for images)
admin.goiphone.com  ──┘
```

## What's included and tested
52 automated end-to-end checks (see `tests/`) were run against a real Postgres
database, plus 5 browser-level tests that drive the actual storefront UI:
login, wrong-password rejection, account lockout after repeated failures,
TOTP 2FA, session rotation + revocation, role permissions (OWNER / MANAGER /
STAFF / CONTENT), anonymous access rejected on every admin route, drafts hidden
from the public API, SQL-injection attempts, audit logging, **server-side price
enforcement (a tampered price from the browser is ignored)**, reservation-only
products can't be ordered, stock limits, and **6 simultaneous buyers of the same
used phone → exactly 1 succeeds.**

Money columns named `*_cents` store **piastres** (1 EGP = 100). The public API
converts to whole EGP for the storefront.

## Setup (≈15 minutes)

### 1. Database (Supabase or Neon — free tier is fine)
Create a project, then copy the **connection string** (Project Settings → Database).

### 2. Configure
```bash
cp .env.example .env      # then edit .env
```
Fill in `DATABASE_URL`, set `ALLOWED_ORIGINS` to your real sites, set
`SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` (12+ characters), and make sure
`COOKIE_SECURE` is **true** (or removed) in production.

### 3. Create tables + first admin
```bash
npm install
npm run migrate     # creates all tables (safe to re-run)
npm run seed          # categories, collections, your OWNER login
npm run seed:catalog  # imports the existing Go iPhone catalog (22 products, used units, hero slides)
```
After the first login, **delete `SEED_OWNER_PASSWORD` from `.env`** and enable 2FA.

### 4. Run
```bash
npm start           # http://localhost:4000/health  →  {"ok":true}
```

### 5. Deploy (Render / Railway / Fly)
Build command `npm install` · Start command `npm start` · add every variable
from `.env` in the host's dashboard (never commit `.env`). Point
`api.goiphone.com` at it.

## Domains & cookies
Admin and API must share the registrable domain (`admin.goiphone.com` ↔
`api.goiphone.com`) — the session cookie is `HttpOnly; Secure; SameSite=Strict`,
which works across subdomains of the same site. Frontends must call the API with
`fetch(url, { credentials: "include" })`. Keep the CORS list (`ALLOWED_ORIGINS`)
to exactly your own sites.

## Roles (editable in the `roles` table)
| Role | Can do |
|---|---|
| OWNER | everything, incl. managing admins and settings |
| MANAGER | products, inventory, orders, reservations, CMS, media |
| STAFF | orders, reservations, inventory |
| CONTENT | CMS (hero, collections, announcement…) and media |

## API overview
Public (no login): `GET /api/catalog` (everything the storefront renders: products,
available used units, categories, hero slides, homepage content) ·
`POST /api/orders`, `POST /api/reservations`. Orders carry only *what* was chosen —
the server looks up prices, checks stock, and claims used units atomically.
Admin (login + permission, checked server-side every request): `/admin/auth/*`,
`/admin/products`, `/admin/products/:id/units`, `/admin/orders`,
`/admin/reservations`, `/admin/categories`, `/admin/collections`,
`/admin/hero-slides`, `/admin/site-content`, `/admin/settings`, `/admin/media`,
`/admin/users`.

## Honest list of what is NOT done yet
1. **Media storage is local-disk (dev only).** Before production, replace
   `src/lib/storage.js` with S3 / Cloudflare R2 / Supabase Storage (the rest of
   the code doesn't change). Hosts with ephemeral disks lose local files on redeploy.
2. **Backups** are a database-provider feature (enable daily backups + point-in-time
   recovery in Supabase/Neon) — not something application code can do.
3. **Rate limiting is in-memory** (fine for one server). Use a Redis store if you
   run multiple instances.
4. **Mandatory 2FA** is supported and enforced once enabled per user, but the
   system doesn't *force* an OWNER to enroll before first use — enroll immediately.
5. No online payments yet — orders have a `payment_status` field
   (pending/paid/failed/refunded/cancelled) ready for it; COD works today.
6. The **storefront** now runs on this API (see `go-iphone-storefront`). The separate
   **Admin app** is the remaining piece — until it exists, manage data through the API
   / SQL directly.
7. No system is "unhackable." This follows standard defense-in-depth practice
   (hashed passwords, server-side authorization, parameterized SQL, rate limits,
   audit logs, security headers). Keep dependencies updated and review logs.
