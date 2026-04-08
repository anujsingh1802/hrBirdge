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

  const handleGoogleLogin = () => {
    window.location.assign("/auth/google");
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

          <div className="relative mt-8 mb-6">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t border-[var(--border-soft)]" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-[var(--bg-surface)] px-3 text-[var(--text-muted)] font-medium">or continue with</span>
             </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full h-12 font-semibold bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>

          <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
            Don't have an account? <Link to="/register" className="text-[var(--accent-500)] font-semibold hover:underline">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
