import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Briefcase } from "lucide-react";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isAdmin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAdmin, isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create your account right now.");
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
          <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-lg text-white/90">
            Create your account, browse open roles, and track every application from one place.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-[var(--bg-base)]">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="Minds Solutions" className="h-12 w-auto drop-shadow-sm brightness-0" />
          </div>

          <div className="bg-[var(--bg-surface)] p-8 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-md)" }}>
            <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Create Account</h1>
            <p className="text-[var(--text-muted)] mb-8">Fill in your details to get started</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Doe"
                  className="h-12 bg-[var(--bg-base)]"
                  required
                />
              </div>

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
                  placeholder="At least 6 characters"
                  className="h-12 bg-[var(--bg-base)]"
                  required
                />
                <p className="text-xs text-[var(--text-muted)]">Use at least 6 characters for backend validation.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
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
                {submitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Already have an account?{" "}
                <Link to="/login" className="text-[var(--accent-500)] hover:text-[var(--accent-600)] font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
