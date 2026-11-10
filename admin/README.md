# GO iPhone Admin

A standalone React + Vite administration app for the GO iPhone store.

## Local development

```bash
cd admin
npm install
npm run dev
```

The Vite development server proxies `/admin/*` requests to `https://go-iphone-api.vercel.app`. Override the target with `API_ORIGIN` when needed.

## Deploy on Vercel

Create a **new Vercel project** from this same GitHub repository:

- Root Directory: `admin`
- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

The included `vercel.json` rewrites browser requests under `/admin/*` to the existing API. This keeps the browser talking to the admin site's origin so the API's host-only, HttpOnly session cookies can be stored for that admin host.

### Required API environment configuration

After the admin project is deployed, copy its exact production origin (for example, `https://your-admin-project.vercel.app`) and add it to the API deployment's `ALLOWED_ORIGINS` environment variable. Keep all existing allowed origins and append the admin origin as a comma-separated value, then redeploy the API.

Do **not** weaken `SameSite=Strict`, disable HttpOnly, or expose database credentials to the browser to work around cookie/CORS issues.

## Current implementation status

- Sign-in and TOTP verification use the existing `/admin/auth` endpoints.
- Session restore uses `/admin/auth/me` and refreshes an expired short session through `/admin/auth/refresh`.
- Dashboard reads live data from `/admin/stats`.
- Products list/search/visibility filter reads from `/admin/products`.
- Orders list/filter and status updates use `/admin/orders`.
- Inventory, reservations, customers, homepage, design, media, collections, team, and settings are currently clearly marked as work in progress. Their screens are not represented as completed CRUD functionality.

The API remains the authorization boundary: permissions must continue to be enforced by backend middleware and database roles, not by hiding UI controls alone.
