import { useEffect } from "react";
import { AUTH_BASE_URL } from "../lib/api";

export function GoogleAuthStart() {
  useEffect(() => {
    const googleAuthUrl = new URL("/auth/google", AUTH_BASE_URL);
    window.location.replace(googleAuthUrl.toString());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Opening Google sign-in</h1>
        <p className="text-[var(--text-muted)]">
          Please wait while we connect you to the HYREIN authentication service.
        </p>
      </div>
    </div>
  );
}
