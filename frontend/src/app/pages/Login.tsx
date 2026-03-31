import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Loader2 } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12 md:p-8">
        <div className="w-full max-w-md bg-[var(--bg-surface)] p-8 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-md)" }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Login</h1>
            <p className="text-[var(--text-muted)]">Sign in with your email and password.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-left block font-medium">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="password" className="text-left block font-medium">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            {error && <div className="rounded-xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] px-4 py-3 text-sm text-[var(--status-rejected-text)]">{error}</div>}

            <Button type="submit" disabled={submitting} className="w-full h-12 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white font-semibold">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don't have an account? <Link to="/register" className="text-[var(--accent-500)] font-semibold">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
