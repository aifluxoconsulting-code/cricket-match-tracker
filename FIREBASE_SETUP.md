# Firebase Setup (5 minutes)

This app uses **Firebase Authentication** (Google sign-in) and **Cloud Firestore** (database).

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it (e.g. "cricket-tracker") → continue → create.

## 2. Enable Google sign-in

1. In your project, go to **Build → Authentication → Get started**.
2. Open the **Sign-in method** tab.
3. Click **Google** → toggle **Enable** → choose a support email → **Save**.
4. Open the **Settings** tab → **Authorized domains** → click **Add domain**:
   - Add your published Lovable URL (e.g. `your-app.lovable.app`)
   - Add your Netlify URL (e.g. `your-site.netlify.app`)
   - `localhost` is already allowed.

## 3. Create the Firestore database

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Production mode** → pick a region closest to you → **Enable**.
3. Open the **Rules** tab and paste the rules below, then **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Shared cricket data: any signed-in user can read/write.
    match /players/{doc} {
      allow read, write: if request.auth != null;
    }
    match /matches/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> These rules require a logged-in Google account. Anyone signed in can edit shared data
> (matches/players), which matches your "shared scope" choice. To restrict writes to
> specific email addresses, see the bottom of this file.

## 4. Get your config values

1. In Firebase Console → click the **gear icon** → **Project settings**.
2. Scroll to **Your apps** → click the **Web** icon `</>` → register an app (any nickname).
3. Copy the `firebaseConfig` object — you need these 6 values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## 5. Add the values to your project

### Local development (.env.local)

Copy `.env.example` to `.env.local` in the project root and paste each value:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123:web:abc
```

Restart the dev server after editing the file.

### Lovable preview

Lovable's hosted preview can't read `.env.local`. To test in the Lovable preview, you can
either build and deploy to Netlify (see `NETLIFY_DEPLOY.md`) or temporarily hardcode the
config in `src/lib/firebase.ts` for testing only — never commit secrets that aren't
already public Firebase web keys.

### Netlify production

Add the same six variables in Netlify → Site settings → **Environment variables**.

---

## Optional: restrict writes to specific users

If you want only you and your friend to be able to edit, add an allowlist to the rules:

```
match /matches/{doc} {
  allow read: if request.auth != null;
  allow write: if request.auth != null
    && request.auth.token.email in [
      "you@example.com",
      "friend@example.com"
    ];
}
```

Apply the same pattern to `players/{doc}`.
