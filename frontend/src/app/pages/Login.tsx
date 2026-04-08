import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AUTH_BASE_URL, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Loader2, Mail, KeyRound } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const { login, sendOtp, verifyOtp, isAuthenticated, isAdmin } = useAuth();

  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required to send OTP.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      await sendOtp(email.trim().toLowerCase());
      setOtpSent(true);
      setSuccessMsg("OTP sent successfully! Please check your email.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpCode) {
      setError("Email and OTP code are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      await verifyOtp(email.trim().toLowerCase(), otpCode);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12 md:p-8">
        <div className="w-full max-w-md bg-[var(--bg-surface)] p-8 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-md)" }}>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Welcome Back</h1>
            <p className="text-[var(--text-muted)]">Sign in to your candidate or employer account</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setLoginMode("password"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMode === "password" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode("otp"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMode === "otp" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Email OTP
            </button>
          </div>

          {loginMode === "password" ? (
            <form className="space-y-5" onSubmit={handlePasswordLogin}>
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

              {error && <div className="rounded-lg border border-red-50 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

              <Button type="submit" disabled={submitting} className="w-full h-12 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white font-semibold">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                Sign In with Password
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-left block font-medium">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setOtpSent(false); }} disabled={otpSent} required />
                </div>
                {otpSent && (
                  <div>
                    <Label htmlFor="otp" className="text-left block font-medium">6-digit Code</Label>
                    <Input id="otp" type="text" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="000000" className="text-center tracking-widest text-lg" required />
                  </div>
                )}
              </div>

              {error && <div className="rounded-lg border border-red-50 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
              {successMsg && <div className="rounded-lg border border-green-50 bg-green-50 px-4 py-3 text-sm text-green-600">{successMsg}</div>}

              <Button type="submit" disabled={submitting} className="w-full h-12 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white font-semibold">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (otpSent ? null : <Mail className="w-4 h-4 mr-2" />)}
                {otpSent ? "Verify Code & Sign In" : "Send Login Code"}
              </Button>
              
              {otpSent && (
                <div className="text-center pt-2">
                  <button type="button" onClick={() => setOtpSent(false)} className="text-sm font-medium text-[var(--accent-500)] hover:underline">
                    Change Email or Resend OTP
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
            Don't have an account? <Link to="/register" className="text-[var(--accent-500)] font-semibold hover:underline">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
