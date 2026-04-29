// Firebase client SDK initialization
// Config values come from Vite env vars (VITE_FIREBASE_*) — set them in .env.local
// and in Netlify's Environment Variables UI for production.

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

// Only initialize Firebase when fully configured. Otherwise expose safe stubs
// so the app can render the setup notice instead of crashing on module load.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _googleProvider = new GoogleAuthProvider();
  _googleProvider.setCustomParameters({ prompt: "select_account" });
}

function notConfigured(): never {
  throw new Error(
    "Firebase is not configured. Add VITE_FIREBASE_* env vars in .env.local (see FIREBASE_SETUP.md).",
  );
}

export const firebaseApp = _app as FirebaseApp;
export const auth = (_auth ?? (new Proxy({}, { get: notConfigured }) as unknown as Auth));
export const db = (_db ?? (new Proxy({}, { get: notConfigured }) as unknown as Firestore));
export const googleProvider = (_googleProvider ?? (new Proxy({}, { get: notConfigured }) as unknown as GoogleAuthProvider));
