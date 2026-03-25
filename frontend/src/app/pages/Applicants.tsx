import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Eye, Download } from "lucide-react";
import { ApiError, getApplicantsForJob, getJobs, updateApplicationStatus } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Application, ApplicationStatus, Job } from "../lib/types";

export function Applicants() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get("jobId") || "all");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [search, setSearch] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [applicantStatus, setApplicantStatus] = useState<ApplicationStatus>("pending");
  const [notes, setNotes] = useState("");
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    getJobs({ limit: 50, sort: "newest" })
      .then((result) => {
        if (!mounted) return;
        setJobs(result.items);
        if (!selectedJobId) {
          setSelectedJobId("all");
        }
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load jobs for applicant review.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!token || !selectedJobId) return;

    setSearchParams(selectedJobId ? { jobId: selectedJobId } : {}, { replace: true });

    getApplicantsForJob(selectedJobId, token, { limit: 100, status: statusFilter === "all-status" ? undefined : statusFilter })
      .then((result) => {
        if (!mounted) return;
        setApplicants(result.items);
        if (result.items[0]) {
          setSelectedApplicant(result.items[0].id);
          setApplicantStatus(result.items[0].status);
        } else {
          setSelectedApplicant(null);
        }
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load applicants.");
      });

    return () => {
      mounted = false;
    };
  }, [selectedJobId, setSearchParams, statusFilter, token]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const haystack = `${applicant.applicantName || ""} ${applicant.applicantEmail || ""} ${applicant.jobTitle}`.toLowerCase();
      return !search.trim() || haystack.includes(search.toLowerCase());
    });
  }, [applicants, search]);

  const selected = filteredApplicants.find((applicant) => applicant.id === selectedApplicant) || filteredApplicants[0];

  useEffect(() => {
    if (selected) {
      setSelectedApplicant(selected.id);
      setApplicantStatus(selected.status);
    }
  }, [selected?.id, selected?.status]);

  const handleStatusUpdate = async () => {
    if (!token || !selected) return;

    setError("");
    setSuccess("");

    try {
      const result = await updateApplicationStatus(selected.id, applicantStatus, token);
      setApplicants((current) => current.map((item) => (item.id === selected.id ? { ...item, status: result.application.status } : item)));
      setSuccess(result.message + (notes ? " Notes kept locally for now." : ""));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update applicant status.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="flex">
        <Sidebar variant="admin" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Applicants</h1>
              <p className="text-[var(--text-default)]">Review and manage job applications</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-2xl border border-[var(--status-shortlisted-bg)] bg-[var(--status-shortlisted-bg)] p-4 text-sm text-[var(--status-shortlisted-text)]">
                {success}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicants..." className="h-12 bg-[var(--bg-surface)] flex-1" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px] h-12 bg-[var(--bg-surface)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="w-full md:w-[260px] h-12 bg-[var(--bg-surface)]">
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid lg:grid-cols-[1fr,360px] gap-6">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.map((applicant) => (
                      <TableRow key={applicant.id} className={selectedApplicant === applicant.id ? "bg-[var(--accent-100)]/30" : ""}>
                        <TableCell className="font-medium">{applicant.applicantName || "Applicant"}</TableCell>
                        <TableCell>{applicant.applicantEmail || "-"}</TableCell>
                        <TableCell>{applicant.jobTitle}</TableCell>
                        <TableCell><StatusBadge status={applicant.status} /></TableCell>
                        <TableCell>{new Date(applicant.appliedDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedApplicant(applicant.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selected && (
                <div className="lg:sticky lg:top-4 space-y-4 h-fit">
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                    <h3 className="font-semibold text-[var(--text-strong)] mb-4">Candidate Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-[var(--text-muted)] mb-1">Name</p>
                        <p className="font-medium text-[var(--text-strong)]">{selected.applicantName || "Applicant"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)] mb-1">Email</p>
                        <p className="text-sm text-[var(--text-strong)]">{selected.applicantEmail || "-"}</p>
                      </div>
                      {selected.applicantSkills && selected.applicantSkills.length > 0 && (
                        <div>
                          <p className="text-sm text-[var(--text-muted)] mb-1">Key Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {selected.applicantSkills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 bg-[var(--accent-100)] text-[var(--accent-600)] text-xs font-medium rounded opacity-90 border border-[var(--accent-300)]">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-[var(--text-muted)] mb-1">Applied For</p>
                        <p className="font-medium text-[var(--text-strong)]">{selected.jobTitle}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)] mb-1">Applied On</p>
                        <p className="text-sm text-[var(--text-strong)]">{new Date(selected.appliedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4" disabled={!selected.resumeUrl} asChild={!!selected.resumeUrl}>
                      {selected.resumeUrl ? (
                        <a href={selected.resumeUrl} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Resume Document
                        </a>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          No Resume URL
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                    <h3 className="font-semibold text-[var(--text-strong)] mb-4">Cover Letter</h3>
                    <p className="text-sm text-[var(--text-default)] leading-relaxed whitespace-pre-wrap">
                      {selected.coverLetter || "No cover letter was provided by this applicant."}
                    </p>
                  </div>

                  <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                    <h3 className="font-semibold text-[var(--text-strong)] mb-4">Update Status</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={applicantStatus} onValueChange={(value) => setApplicantStatus(value as ApplicationStatus)}>
                          <SelectTrigger className="h-12 bg-[var(--bg-base)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes (local only)</Label>
                        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add notes about this candidate..." className="bg-[var(--bg-base)]" />
                      </div>
                      <Button className="w-full bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white" onClick={handleStatusUpdate}>
                        Update Status
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav variant="admin" />
    </div>
  );
}
