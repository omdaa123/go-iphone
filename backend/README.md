# GO iPhone — Backend

Express API shared by the Admin app and the customer storefront. The browser never connects directly to PostgreSQL.

## Local setup

1. Copy `.env.example` to `.env` and set a **development database** connection.
2. Install and prepare a disposable development database:

```bash
npm install
npm run migrate
npm run seed
npm run seed:catalog
npm run dev
```

The API health endpoint is `http://127.0.0.1:4000/health`.

Never run migrations, seed scripts, destructive tests, or test orders against Production. Confirm the database hostname is the Dev branch before applying schema changes. Do not paste database URLs or passwords into chat or commit them.

## Roles and server-side permissions

| Role | Access |
|---|---|
| OWNER | All areas, team administration, settings, and Dashboard |
| FULL_ACCESS_NO_DASHBOARD | Full store and team management, but no Dashboard |
| DASHBOARD | Dashboard and its sales overview only |
| CATALOG | Products, storefront content/design, Collections, and Media; no Dashboard, orders, customers, or sales |

Permissions are checked by backend middleware on each protected request. OWNER and FULL_ACCESS_NO_DASHBOARD accounts must enroll in 2FA before accessing non-auth admin routes. Keep 2FA enabled in production.

## Commerce behavior

- Public catalog reads are read-only.
- Prices and stock are calculated/checked by the server, not trusted from browser values.
- New orders reserve tracked stock. Completing an order marks an individually tracked unit sold; cancelling an order releases reserved units and restores tracked variant quantities.
- Orders currently use the database default payment method (cash on delivery). There is no online payment-gateway integration yet; do not present online payments as active until a provider and verified webhook flow are implemented.
- Reservations are separate from orders.

## Production environment

Set `NODE_ENV=production`, `COOKIE_SECURE=true`, `ENABLE_ADMIN_WRITES=true`, `ENABLE_COMMERCE_WRITES=true`, an exact comma-separated `ALLOWED_ORIGINS` list for the deployed storefront/Admin origins, a production-only `DATABASE_URL`, and persistent media credentials. The two write flags are mandatory explicit opt-ins in every environment. Keep the default 2FA requirement enabled. Never copy a Production connection string into a local `.env`. In local development, the backend blocks admin mutations and customer checkout/reservations unless the matching explicit write override is enabled.

## Persistent media and operations

Before production, configure Cloudinary in the backend service environment (Render): CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET; CLOUDINARY_FOLDER is optional and defaults to go-iphone. Cloudinary is the preferred provider when configured. ImageKit and S3-compatible storage remain supported alternatives. The API stores the resulting permanent CDN URL in the media table, so product images, gallery images, site content images, and uploaded videos continue to use the same media records. Local disk uploads are for development only and can disappear on redeploy. Never put the Cloudinary API secret in Vercel, the storefront, or the admin frontend. After setting the variables, redeploy the backend and test one image and one video upload from Admin → Media. Enable database backups and point-in-time recovery with the database provider. In-memory rate limits are suitable only for a single API instance; use a shared store such as Redis before horizontal scaling.

## Tests

The end-to-end suites create users, products, orders, and reservations. Run them **only against a disposable test database** with a separate test server. For the test server only, set `NODE_ENV=development`, `ENABLE_ADMIN_WRITES=true`, and `ENABLE_COMMERCE_WRITES=true`; the normal local defaults keep these writes disabled. The admin/security suites also use `REQUIRE_2FA=false` for the initial setup phase. Do not set these write overrides when connected to Production:

- `npm run test:e2e:admin-api`
- `npm run test:e2e:security`
- `npm run test:e2e:catalog`
- `npm run test:e2e:2fa`
- `npm run test:local-write-guard` (run against a local server with write overrides unset)

The storefront integration suite is `npm run test:e2e --prefix ../storefront`; it also requires a running test API and database. These are not safe to run against Production.

GitHub Actions builds the Admin and storefront and performs backend JavaScript syntax checks. Passing CI does not replace database-backed end-to-end tests, deployment configuration checks, or a real checkout rehearsal.
