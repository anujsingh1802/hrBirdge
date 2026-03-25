import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Briefcase, FileText, Eye, CheckCircle, TrendingUp } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { ApiError, getCandidateStats, getJobs, getMyApplications } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Application, Job } from "../lib/types";

export function CandidateDashboard() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0 });
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    if (!token) return;

    Promise.all([
      getMyApplications(token, { limit: 5 }),
      getJobs({ limit: 6, sort: "newest" }),
      getCandidateStats(token),
    ])
      .then(([applicationsResult, jobsResult, statsResult]) => {
        if (!mounted) return;
        setApplications(applicationsResult.items);
        setRecommendedJobs(jobsResult.items);
        setStats(statsResult.data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof ApiError ? err.message : "Unable to load your dashboard right now.");
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const activeApplications = stats.total - stats.rejected;
  const shortlisted = stats.shortlisted;
  const reviewed = stats.reviewed;
  const recentApplications = applications;
  const appliedJobIds = new Set(applications.map((application) => application.jobId));
  const recommended = recommendedJobs.filter((job) => !appliedJobIds.has(job.id)).slice(0, 3);
  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    let score = 20;
    if (user.name) score += 20;
    if (user.bio) score += 20;
    if (user.skills && user.skills.length > 0) score += 20;
    if (user.resumeUrl) score += 20;
    return Math.min(score, 100);
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="flex">
        <Sidebar variant="candidate" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Welcome Back, {user?.name?.split(" ")[0] || "Candidate"}!</h1>
              <p className="text-[var(--text-default)]">Here&apos;s what&apos;s happening with your job search</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={Briefcase} label="Active Applications" value={activeApplications} />
              <StatCard icon={Eye} label="Reviewed" value={reviewed} />
              <StatCard icon={FileText} label="Total Applications" value={stats.total} />
              <StatCard icon={CheckCircle} label="Shortlisted" value={shortlisted} trend={shortlisted > 0 ? { value: `${shortlisted}`, isPositive: true } : undefined} />
            </div>

            <div className="grid lg:grid-cols-[1fr,360px] gap-6">
              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[var(--text-strong)]">Recent Applications</h2>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/my-applications">View All</Link>
                    </Button>
                  </div>

                  {recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((application) => (
                        <div key={application.id} className="flex items-center justify-between gap-4 p-4 bg-[var(--bg-base)] border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-button)" }}>
                          <div className="flex-1">
                            <h3 className="font-medium text-[var(--text-strong)] mb-1">{application.jobTitle}</h3>
                            <p className="text-sm text-[var(--text-muted)]">
                              {application.company} · {new Date(application.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-base)] p-6 text-center">
                      <p className="text-[var(--text-muted)] mb-4">You haven&apos;t applied to any jobs yet.</p>
                      <Button asChild variant="outline">
                        <Link to="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h3 className="font-semibold text-[var(--text-strong)] mb-4">Profile Completion</h3>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-[var(--accent-500)]">{profileCompletion}%</span>
                      <span className="text-sm text-[var(--text-muted)]">
                        {profileCompletion === 100 ? "Ready to apply!" : "Looking good"}
                      </span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Your professional profile is now live. Complete your bio, skills, and resume details to stand out.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/profile">Edit Profile</Link>
                  </Button>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-[var(--text-strong)]">Recommended Jobs</h3>
                    <TrendingUp className="w-5 h-5 text-[var(--accent-500)]" />
                  </div>

                  {recommended.length > 0 ? (
                    <div className="space-y-4">
                      {recommended.map((job) => (
                        <Link key={job.id} to={`/jobs/${job.id}`} className="block p-4 bg-[var(--bg-base)] border border-[var(--border-soft)] hover:border-[var(--accent-500)] transition-colors" style={{ borderRadius: "var(--radius-button)" }}>
                          <div className="flex items-start justify-between mb-2 gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-[var(--text-strong)] mb-1">{job.title}</h4>
                              <p className="text-sm text-[var(--text-muted)]">{job.company}</p>
                            </div>
                            <span className="text-xs font-medium text-[var(--accent-600)] bg-[var(--accent-100)] px-2 py-1" style={{ borderRadius: "var(--radius-chip)" }}>
                              New
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">We&apos;ll surface more recommended jobs as new openings are added.</p>
                  )}

                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link to="/jobs">Browse More Jobs</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav variant="candidate" />
    </div>
  );
}
