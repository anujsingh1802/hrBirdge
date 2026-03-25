import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Briefcase } from "lucide-react";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAdmin, isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const user = await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || (user.role === "admin" ? "/admin" : "/dashboard"), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] text-white p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Minds Solutions" className="h-14 w-auto drop-shadow-md brightness-0 invert" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
          <p className="text-lg text-white/90">
            Sign in to access your dashboard, manage applications, and discover new opportunities.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-[var(--bg-base)]">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="Minds Solutions" className="h-12 w-auto drop-shadow-sm brightness-0" />
          </div>

          <div className="bg-[var(--bg-surface)] p-8 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-md)" }}>
            <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Sign In</h1>
            <p className="text-[var(--text-muted)] mb-8">Enter your credentials to access your account</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 bg-[var(--bg-base)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 bg-[var(--bg-base)]"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] px-4 py-3 text-sm text-[var(--status-rejected-text)]">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                {submitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Don't have an account?{" "}
                <Link to="/register" className="text-[var(--accent-500)] hover:text-[var(--accent-600)] font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
