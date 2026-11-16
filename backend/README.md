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

## Persistent media and operations

Before production, configure Cloudinary or an S3-compatible persistent object store. Local disk uploads are for development only and can disappear on redeploy. Enable database backups and point-in-time recovery with the database provider. In-memory rate limits are suitable only for a single API instance; use a shared store such as Redis before horizontal scaling.

## Tests

The end-to-end suites create users, products, orders, and reservations. Run them **only against a disposable test database** with a separate test server. For the test server only, set `NODE_ENV=development`, `ENABLE_ADMIN_WRITES=true`, and `ENABLE_COMMERCE_WRITES=true`; the normal local defaults keep these writes disabled. The admin/security suites also use `REQUIRE_2FA=false` for the initial setup phase. Do not set these write overrides when connected to Production:

- `npm run test:e2e:admin-api`
- `npm run test:e2e:security`
- `npm run test:e2e:catalog`
- `npm run test:e2e:2fa`

The storefront integration suite is `npm run test:e2e --prefix ../storefront`; it also requires a running test API and database. These are not safe to run against Production.

GitHub Actions builds the Admin and storefront and performs backend JavaScript syntax checks. Passing CI does not replace database-backed end-to-end tests, deployment configuration checks, or a real checkout rehearsal.
