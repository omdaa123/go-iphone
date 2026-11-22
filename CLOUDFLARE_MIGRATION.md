# GO iPhone — Cloudflare preview migration

This migration is intentionally parallel to the current Vercel deployment. Do not change production DNS, Vercel projects, or the Neon production database until the preview is fully verified.

## Cloudflare Pages projects

Create two Pages projects from this repository:

| Project | Root directory | Build command | Output directory |
| --- | --- | --- | --- |
| go-iphone-storefront | `storefront` | `npm run build` | `dist` |
| go-iphone-admin | `admin` | `npm run build` | `dist` |

The matching `wrangler.toml` files declare the Pages output directory. Keep the API same-origin in the browser: do not set `VITE_API_URL` on either Pages project. The Pages Functions proxy `/api/*` and `/admin/*` to the Neon Function URL.

For the Admin Pages project, set the build-time variable `VITE_STOREFRONT_URL` to the storefront Pages URL.

For both Pages projects, set the runtime variable `NEON_FUNCTION_URL` to the deployed Neon Function base URL, including its trailing slash.

## Backend environment

The API must be deployed as a Node.js 24 Neon Function before either Pages proxy can be enabled. The API's production environment must retain the current production values for database access, media provider credentials, session settings, write guards, and payment/shipping integrations. Do not copy secrets into Git.

Add the exact storefront and Admin Pages origins to `ALLOWED_ORIGINS`. Keep `NODE_ENV=production`, `COOKIE_SECURE=true`, the production 2FA requirement, and the existing explicit write flags. The Pages proxy preserves the browser `Origin`, cookies, authorization headers, request body, and API path.

## Authentication / cookies

The existing Admin session cookies use `SameSite=Strict`. Therefore the browser must call `/admin/*` on the Admin Pages origin and `/api/*` on the storefront Pages origin; do not point browser requests directly at the `*.compute.neon.tech` hostname. The Pages Functions proxy keeps the browser-facing API same-origin and avoids weakening cookie settings.

## Verification before cutover

1. Confirm both Pages builds and their preview URLs.
2. Confirm the Neon Function is deployed and its `/health` and `/ready` endpoints work.
3. Verify public catalog, color-family cards, product details, search, and product images.
4. Verify Admin login, 2FA, session refresh, all four roles, and logout.
5. Verify product create/edit, image/video uploads, collections, homepage content, orders, reservations, and audit logs.
6. Verify order/stock behavior against a disposable preview database before enabling writes.
7. Keep Vercel and the Neon production database untouched until all checks pass.

## Current status

This branch contains the Pages proxy and project configuration only. The user has confirmed that Cloudflare is already connected to GitHub. The actual Pages projects, Neon Function API adapter, environment variables, and end-to-end checks are still pending. GitHub Actions build/syntax/security checks passed for the current branch commit; this does not validate a Cloudflare deployment or the Neon API runtime. No production routing or data has been changed.
