import { AlertTriangle } from "lucide-react";

export function FirebaseSetupNotice() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-accent/40 bg-accent/10 p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-accent-foreground" />
        <div className="space-y-2 text-sm">
          <h3 className="text-base font-semibold">Firebase not configured yet</h3>
          <p className="text-muted-foreground">
            Add your Firebase config as environment variables to enable login and cloud storage.
            See <code className="rounded bg-muted px-1.5 py-0.5">FIREBASE_SETUP.md</code> for the
            5-minute setup guide.
          </p>
          <p className="text-muted-foreground">
            Required vars: <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_AUTH_DOMAIN</code>,{" "}
            <code>VITE_FIREBASE_PROJECT_ID</code>, <code>VITE_FIREBASE_STORAGE_BUCKET</code>,{" "}
            <code>VITE_FIREBASE_MESSAGING_SENDER_ID</code>, <code>VITE_FIREBASE_APP_ID</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
