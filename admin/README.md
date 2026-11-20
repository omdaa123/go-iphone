# GO iPhone Admin

React + Vite administration app for the GO iPhone store.

## Local development

1. Copy `.env.example` to `.env` (default API origin is `http://127.0.0.1:4000`).
2. Start the backend from `backend/`.
3. Install and run the Admin app:

```bash
npm install
npm run dev
```

The Admin app runs on Vite's default local port. The Vite proxy forwards `/admin/*` to the backend.

Local development is intentionally read-only for API mutations. Do not remove that safeguard to test against a database until the backend is confirmed to use a disposable Dev database.

## Deployment

Deploy this directory as its own Vite project with:

- Root directory: `admin`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

The included `vercel.json` proxies `/admin/*` to the configured API host. Confirm that destination is the intended production API before deployment, and add the deployed Admin origin to the API's `ALLOWED_ORIGINS`. Keep cookies HttpOnly and Secure in production.

## Implemented workspaces

The navigation exposes Dashboard, Products, Inventory, Orders, Reservations, Customers, Visual Store Editor, Media Library, Collections, Team & Access, and Settings. Actual CRUD behavior still needs to be verified end-to-end against a staging database for each role. A successful Vite build only confirms compilation; it does not prove that API writes, uploads, cookies, or business workflows work.
