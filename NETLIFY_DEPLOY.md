# Deploying to Netlify

This project uses **TanStack Start (Vite)**. Netlify can build and serve it as a static
SPA — perfect for this app since all logic runs client-side against Firebase.

## One-time setup

### 1. Push the project to GitHub

In Lovable, click the **GitHub** button (top right) → connect your account → create repo.

### 2. Create a Netlify site

1. Go to https://app.netlify.com → **Add new site** → **Import an existing project**.
2. Connect to GitHub and pick the repository.
3. Netlify will auto-detect Vite. Use these settings if it doesn't:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 20 (set under Site settings → Build & deploy → Environment)

### 3. Add Firebase environment variables

In Netlify: **Site settings → Environment variables → Add a variable**. Add all six:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Then trigger a redeploy: **Deploys → Trigger deploy → Clear cache and deploy site**.

### 4. Authorize the Netlify domain in Firebase

In Firebase Console → **Authentication → Settings → Authorized domains** → add your
`your-site.netlify.app` URL (and your custom domain if you have one). Without this,
Google sign-in will fail with `auth/unauthorized-domain`.

## Notes on the build

- The included `netlify.toml` configures the build command, publish directory and SPA
  fallback so client-side routes work on refresh.
- This app does not use server functions, so the static export is sufficient.
- Subsequent pushes to `main` redeploy automatically.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Blank page in production | Check Netlify build log for env vars; missing `VITE_FIREBASE_*` causes Firebase init to fail. |
| `auth/unauthorized-domain` | Add your Netlify domain in Firebase Authentication → Settings. |
| 404 on refresh of `/matches` | The `netlify.toml` redirect handles this — confirm it was deployed. |
| Data not showing | Verify Firestore rules are published and the user is signed in. |
