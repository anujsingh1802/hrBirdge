import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { JobCard } from "../components/JobCard";
import { MapPin, DollarSign, Clock, Briefcase, Bookmark, Share2, Building } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { ApiError, getJob, getJobs } from "../lib/api";
import type { Job } from "../lib/types";

export function JobDetail() {
  const { id = "" } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([getJob(id), getJobs({ limit: 4, sort: "newest" })])
      .then(([jobResult, listResult]) => {
        if (!mounted) return;
        setJob(jobResult);
        setSimilarJobs(listResult.items.filter((item) => item.id !== id).slice(0, 3));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof ApiError ? err.message : "Unable to load this job.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const shareJob = async () => {
    if (!job) return;

    if (navigator.share) {
      await navigator.share({
        title: job.title,
        text: `${job.title} at ${job.company}`,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="public" />

      <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)] py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="h-8 w-64 rounded bg-[var(--bg-muted)] animate-pulse" />
            <div className="h-72 rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
            <div className="h-56 rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
          </div>
        ) : error || !job ? (
          <div className="rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-8 text-center">
            <p className="text-[var(--status-rejected-text)] mb-4">{error || "Job not found."}</p>
            <Button asChild variant="outline">
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        ) : (
          <>
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/jobs">Jobs</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{job.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="grid md:grid-cols-[1fr,436px] gap-6">
              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] p-6 md:p-8 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">{job.title}</h1>
                      <div className="flex items-center gap-2 text-lg text-[var(--text-default)] mb-4">
                        <Building className="w-5 h-5" />
                        {job.company}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6 text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Posted {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "recently"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.length > 0 ? job.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-[var(--accent-100)] text-[var(--accent-600)]" style={{ borderRadius: "var(--radius-chip)" }}>
                        {skill}
                      </span>
                    )) : (
                      <span className="text-sm text-[var(--text-muted)]">No skills listed for this job yet.</span>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--bg-surface)] p-6 md:p-8 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-2xl font-semibold text-[var(--text-strong)] mb-4">Role Overview</h2>
                  <p className="text-[var(--text-default)] leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>

              <div className="md:sticky md:top-4 space-y-6">
                <div className="bg-[var(--bg-surface)] p-6 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-md)" }}>
                  <Button asChild className="w-full h-12 mb-3 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white" style={{ borderRadius: "var(--radius-button)" }}>
                    <Link to={`/apply/${id}`}>Apply Now</Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" className="w-full" onClick={shareJob}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[var(--border-soft)]">
                    <h3 className="font-semibold text-[var(--text-strong)] mb-4">Quick Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-[var(--text-muted)] mb-1">Salary</p>
                        <p className="text-[var(--text-strong)] font-medium">{job.salary}</p>
                      </div>
                      <div>
                        <p className="text-[var(--text-muted)] mb-1">Job Type</p>
                        <p className="text-[var(--text-strong)] font-medium">{job.type}</p>
                      </div>
                      <div>
                        <p className="text-[var(--text-muted)] mb-1">Location</p>
                        <p className="text-[var(--text-strong)] font-medium">{job.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {similarJobs.length > 0 && (
              <div className="mt-16">
                <h2 className="text-3xl font-bold text-[var(--text-strong)] mb-8">Similar Jobs</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarJobs.map((similarJob) => (
                    <JobCard key={similarJob.id} {...similarJob} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
