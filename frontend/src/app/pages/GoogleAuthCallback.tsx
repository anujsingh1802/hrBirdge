import { useEffect } from "react";
import { AUTH_BASE_URL } from "../lib/api";

export function GoogleAuthCallback() {
  useEffect(() => {
    const callbackUrl = new URL("/auth/google/callback", AUTH_BASE_URL);
    callbackUrl.search = window.location.search;
    window.location.replace(callbackUrl.toString());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Completing Google sign-in</h1>
        <p className="text-[var(--text-muted)]">
          Please wait while we finish your authentication and send you back to HYREIN.
        </p>
      </div>
    </div>
  );
}
