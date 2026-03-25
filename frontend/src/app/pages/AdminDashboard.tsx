import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { StatCard } from "../components/StatCard";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Briefcase, CheckCircle, Eye, Plus, Users, ArrowRight, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ApiError, deleteJob, getAdminStats, getJobs, hardDeleteJob } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Job } from "../lib/types";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    jobs: { totalJobs: 0, activeJobs: 0 },
    applications: { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!token) return;

    setLoading(true);
    setError("");

    Promise.all([
      getAdminStats(token),
      getJobs({ limit: 5, sort: "newest" })
    ])
      .then(([statsResult, jobsResult]) => {
        if (!mounted) return;
        setStats(statsResult.data);
        setRecentJobs(jobsResult.items);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof ApiError ? err.message : "Unable to load dashboard data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleArchive = async (jobId: string) => {
    if (!token || !window.confirm("Archive this job? It will be hidden from candidates but kept in your records.")) return;

    try {
      await deleteJob(jobId, token);
      setRecentJobs((current) => current.map((job) => (job.id === jobId ? { ...job, isActive: false } : job)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to archive this job.");
    }
  };

  const handleDeleteForever = async (jobId: string) => {
    if (!token || !window.confirm("PERMANENTLY DELETE this job? This action cannot be undone and will remove all associated data.")) return;

    try {
      await hardDeleteJob(jobId, token);
      setRecentJobs((current) => current.filter((job) => job.id !== jobId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to permanently delete this job.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="flex">
        <Sidebar variant="admin" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Admin Dashboard</h1>
                <p className="text-[var(--text-default)]">Overview of recruitment activity and job postings</p>
              </div>
              <Button asChild className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white">
                <Link to="/admin/jobs/create">
                  <Plus className="w-4 h-4 mr-2" />
                  New Job
                </Link>
              </Button>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={Briefcase} label="Active Jobs" value={stats.jobs.activeJobs} />
              <StatCard icon={CheckCircle} label="Total Jobs" value={stats.jobs.totalJobs} />
              <StatCard icon={Users} label="Total Applicants" value={stats.applications.total} />
              <StatCard icon={Eye} label="Pending Review" value={stats.applications.pending} />
            </div>

            <div className="grid lg:grid-cols-[1fr,360px] gap-6">
              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[var(--text-strong)]">Recently Posted Jobs</h2>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/admin/jobs">View All</Link>
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-500)]" />
                    </div>
                  ) : recentJobs.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentJobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell className="capitalize">{job.type}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label={`Manage ${job.title}`}>
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleArchive(job.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600 font-semibold" onClick={() => handleDeleteForever(job.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Forever
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 bg-[var(--bg-base)] rounded-xl border border-dashed border-[var(--border-soft)]">
                      <p className="text-[var(--text-muted)]">No jobs posted yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h3 className="font-semibold text-[var(--text-strong)] mb-4">Quick Actions</h3>
                  <div className="grid gap-3">
                    <Button asChild variant="outline" className="justify-start h-12">
                      <Link to="/admin/bulk-upload">
                        <Plus className="w-4 h-4 mr-2" />
                        Bulk Upload Jobs
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start h-12">
                      <Link to="/admin/applicants">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Applicants
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h3 className="font-semibold text-[var(--text-strong)] mb-4">Application Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Reviewed
                      </span>
                      <span className="font-medium">{stats.applications.reviewed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Shortlisted
                      </span>
                      <span className="font-medium">{stats.applications.shortlisted}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Rejected
                      </span>
                      <span className="font-medium">{stats.applications.rejected}</span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" className="w-full mt-6 text-[var(--accent-600)]">
                    <Link to="/admin/applicants">
                      View full reports <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav variant="admin" />
    </div>
  );
}
