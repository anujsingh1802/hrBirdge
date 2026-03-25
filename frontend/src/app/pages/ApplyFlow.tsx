import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { MapPin, DollarSign, Briefcase } from "lucide-react";
import { ApiError, applyToJob, getJob } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Job } from "../lib/types";

export function ApplyFlow() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    getJob(id)
      .then((result) => {
        if (mounted) setJob(result);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load this job.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (user?.resumeUrl) {
      setResumeUrl(user.resumeUrl);
    }
  }, [user?.resumeUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Please sign in before applying.");
      return;
    }

    if (!consent) {
      setError("Please accept the privacy consent before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await applyToJob(id, token, {
        resume_url: resumeUrl,
        cover_letter: coverLetter,
      });
      setSuccess(result.message);
      setTimeout(() => navigate("/my-applications"), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)] py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="h-8 w-64 rounded bg-[var(--bg-muted)] animate-pulse" />
            <div className="h-96 rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
          </div>
        ) : !job ? (
          <div className="rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-8 text-center">
            <p className="text-[var(--status-rejected-text)] mb-4">{error || "Job not found."}</p>
            <Button asChild variant="outline">
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-strong)] mb-2">Apply for {job.title}</h1>
              <p className="text-[var(--text-default)]">Complete the form below to submit your application</p>
            </div>

            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-500)] text-white flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm font-medium text-[var(--accent-500)]">Application</span>
              </div>
              <div className="w-12 h-0.5 bg-[var(--border-soft)]" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--border-soft)] text-[var(--text-muted)] flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm text-[var(--text-muted)]">Review</span>
              </div>
              <div className="w-12 h-0.5 bg-[var(--border-soft)]" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--border-soft)] text-[var(--text-muted)] flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-sm text-[var(--text-muted)]">Submit</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr,436px] gap-6">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6 md:p-8" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-4">Personal Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={user?.name || ""} className="h-12 bg-[var(--bg-base)]" disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ""} className="h-12 bg-[var(--bg-base)]" disabled />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-4">Resume</h2>
                    <div className="space-y-2">
                      <Label htmlFor="resume-url">Resume URL</Label>
                      <Input
                        id="resume-url"
                        type="url"
                        value={resumeUrl}
                        onChange={(event) => setResumeUrl(event.target.value)}
                        placeholder="https://example.com/resume.pdf"
                        className="h-12 bg-[var(--bg-base)]"
                      />
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      {user?.resumeUrl ? "Your saved profile resume has been auto-filled." : "Your backend currently accepts a resume URL rather than a file upload on this form."}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-4">Cover Letter</h2>
                    <Textarea
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      placeholder="Tell us why you're interested in this position..."
                      className="min-h-[180px] bg-[var(--bg-base)]"
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="consent" checked={consent} onCheckedChange={(value) => setConsent(Boolean(value))} />
                    <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                      I consent to the processing of my application data for this role.
                    </Label>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] px-4 py-3 text-sm text-[var(--status-rejected-text)]">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-2xl border border-[var(--status-shortlisted-bg)] bg-[var(--status-shortlisted-bg)] px-4 py-3 text-sm text-[var(--status-shortlisted-text)]">
                      {success}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitting} className="flex-1 h-12 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white" style={{ borderRadius: "var(--radius-button)" }}>
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button type="button" variant="outline" className="h-12" style={{ borderRadius: "var(--radius-button)" }} asChild>
                      <Link to={`/jobs/${id}`}>Cancel</Link>
                    </Button>
                  </div>
                </form>
              </div>

              <div className="lg:sticky lg:top-4 h-fit">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h3 className="font-semibold text-[var(--text-strong)] mb-4">Job Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--text-strong)] mb-1">{job.title}</h4>
                      <p className="text-[var(--text-default)]">{job.company}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-soft)]">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/jobs/${id}`}>View Full Job Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
