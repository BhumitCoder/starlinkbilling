# Deploying to Vercel

This is a static Vite + React app that talks directly to Firebase (Firestore
database `billing`). There is no backend server, so it deploys as a static site.

## Project settings (auto-detected by Vercel)

These are already configured in [`vercel.json`](./vercel.json), so you normally
don't need to change anything in the dashboard:

| Setting            | Value           |
| ------------------ | --------------- |
| Framework Preset   | Vite            |
| Build Command      | `npm run build` |
| Output Directory   | `dist`          |
| Install Command    | `npm install`   |

The `rewrites` rule sends every unmatched path to `index.html`. This is required
for client-side routing (e.g. `/login`) so page refreshes and direct links work
instead of returning 404.

## Option A — Deploy from GitHub (recommended)

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new and import that repository.
3. Vercel reads `vercel.json` automatically — just click **Deploy**.
4. Every push to the main branch redeploys automatically.

## Option B — Deploy with the Vercel CLI

```bash
npm i -g vercel      # once
vercel               # preview deployment
vercel --prod        # production deployment
```

## Environment variables

None required. The Firebase web config in `src/lib/firebase.ts` uses public
client keys (safe to ship in the frontend). Access is controlled by Firestore
security rules, not by hiding these keys.

## After deploying — Firebase setup checklist

1. **Authorized domains**: In Firebase Console → Authentication → Settings →
   Authorized domains, add your Vercel domain (e.g. `your-app.vercel.app`).
2. **Firestore rules**: Make sure the `billing` database rules allow the app to
   read/write the `invoices` and `settings` collections. If reads/writes fail in
   production, this is the most likely cause.
