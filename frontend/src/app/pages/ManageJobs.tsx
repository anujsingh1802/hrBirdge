import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { MoreVertical, Plus, Edit, Trash2, Users, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { ApiError, deleteJob, getApplicantsForJob, getJobs, updateJob, hardDeleteJob } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Job } from "../lib/types";

export function ManageJobs() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [typeFilter, setTypeFilter] = useState("all-types");
  const [sort, setSort] = useState("recent");
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    if (!token) return;

    getJobs({ limit: 50, sort: "newest" })
      .then(async (result) => {
        if (!mounted) return;
        setJobs(result.items);

        const counts = await Promise.all(
          result.items.map(async (job) => {
            const response = await getApplicantsForJob(job.id, token, { limit: 1 }).catch(() => ({ pagination: { total: 0 } }));
            return [job.id, response.pagination.total] as const;
          })
        );

        if (!mounted) return;
        setApplicantCounts(Object.fromEntries(counts));
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load jobs.");
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const filteredJobs = useMemo(() => {
    const statusMap = (job: Job) => (job.isActive === false ? "closed" : "active");

    return [...jobs]
      .filter((job) => {
        const matchesSearch = !search.trim() || `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all-status" || statusMap(job) === statusFilter;
        const matchesType = typeFilter === "all-types" || job.type.toLowerCase() === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "applicants") return (applicantCounts[b.id] || 0) - (applicantCounts[a.id] || 0);
        return new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime();
      });
  }, [applicantCounts, jobs, search, sort, statusFilter, typeFilter]);

  const handleDelete = async (jobId: string) => {
    if (!token || !window.confirm("Archive this job? It will be hidden from candidates but kept in your records.")) return;

    try {
      await deleteJob(jobId, token);
      setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, isActive: false } : job)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete this job.");
    }
  };

  const handleHardDelete = async (jobId: string) => {
    if (!token || !window.confirm("PERMANENTLY DELETE this job? This action cannot be undone and will remove all associated data.")) return;

    try {
      await hardDeleteJob(jobId, token);
      setJobs((current) => current.filter((job) => job.id !== jobId));
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
                <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Manage Jobs</h1>
                <p className="text-[var(--text-default)]">Create, edit, and manage job postings</p>
              </div>
              <Button asChild className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white" style={{ borderRadius: "var(--radius-button)" }}>
                <Link to="/admin/jobs/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Link>
              </Button>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search jobs..." className="h-12 bg-[var(--bg-surface)] flex-1" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px] h-12 bg-[var(--bg-surface)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[160px] h-12 bg-[var(--bg-surface)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full md:w-[160px] h-12 bg-[var(--bg-surface)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="applicants">Most Applicants</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="hidden md:block bg-[var(--bg-surface)] border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell className="capitalize">{job.type}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{applicantCounts[job.id] || 0}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 text-xs font-medium ${job.isActive === false ? "bg-[var(--status-rejected-bg)] text-[var(--status-rejected-text)]" : "bg-[var(--status-shortlisted-bg)] text-[var(--status-shortlisted-text)]"}`}
                          style={{ borderRadius: "var(--radius-chip)" }}
                        >
                          {job.isActive === false ? "Archived" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/jobs/${job.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/applicants?jobId=${job.id}`)}>
                              <Users className="w-4 h-4 mr-2" />
                              Applicants
                            </DropdownMenuItem>
                            {job.isActive === false ? (
                              <DropdownMenuItem 
                                className="text-[var(--state-success)]" 
                                onClick={async () => {
                                  if (!token) return;
                                  try {
                                    await updateJob(job.id, { isActive: true }, token);
                                    setJobs(curr => curr.map(j => j.id === job.id ? { ...j, isActive: true } : j));
                                  } catch (err) {
                                    setError(err instanceof ApiError ? err.message : "Failed to restore job");
                                  }
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-[var(--status-rejected-text)]" onClick={() => handleDelete(job.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 font-semibold" onClick={() => handleHardDelete(job.id)}>
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
            </div>

            <div className="md:hidden space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-[var(--bg-surface)] p-4 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-strong)] mb-1">{job.title}</h3>
                      <p className="text-sm text-[var(--text-muted)]">{job.company}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/jobs/${job.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/applicants?jobId=${job.id}`)}>Applicants</DropdownMenuItem>
                        {job.isActive === false ? (
                          <DropdownMenuItem 
                             className="text-[var(--state-success)]"
                             onClick={async () => {
                               if (!token) return;
                               try {
                                 await updateJob(job.id, { isActive: true }, token);
                                 setJobs(curr => curr.map(j => j.id === job.id ? { ...j, isActive: true } : j));
                               } catch (err) {
                                 setError(err instanceof ApiError ? err.message : "Failed to restore job");
                               }
                             }}
                          >
                            Restore
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-[var(--state-error)]" onClick={() => handleDelete(job.id)}>Archive</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600 font-semibold" onClick={() => handleHardDelete(job.id)}>
                          Delete Forever
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
                    <span className="capitalize">{job.type}</span>
                    <span>·</span>
                    <span>{applicantCounts[job.id] || 0} applicants</span>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/admin/jobs/${job.id}/edit`}>Edit Job</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav variant="admin" />
    </div>
  );
}
