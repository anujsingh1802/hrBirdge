import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Eye } from "lucide-react";
import { ApiError, getMyApplications } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Application } from "../lib/types";

export function MyApplications() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    if (!token) return;

    getMyApplications(token, { limit: 50 })
      .then((result) => {
        if (mounted) setApplications(result.items);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load your applications.");
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const haystack = `${application.jobTitle} ${application.company}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="flex">
        <Sidebar variant="candidate" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">My Applications</h1>
              <p className="text-[var(--text-default)]">Track and manage your job applications</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applications..." className="h-12 bg-[var(--bg-surface)]" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-12 bg-[var(--bg-surface)]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredApplications.length > 0 ? (
              <>
                <div className="hidden md:block bg-[var(--bg-surface)] border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">{application.jobTitle}</TableCell>
                          <TableCell>{application.company}</TableCell>
                          <TableCell>{new Date(application.appliedDate).toLocaleDateString()}</TableCell>
                          <TableCell><StatusBadge status={application.status} /></TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/jobs/${application.jobId}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden space-y-4">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="bg-[var(--bg-surface)] p-4 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--text-strong)] mb-1">{application.jobTitle}</h3>
                          <p className="text-sm text-[var(--text-muted)]">{application.company}</p>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>
                      <p className="text-sm text-[var(--text-muted)] mb-3">Applied: {new Date(application.appliedDate).toLocaleDateString()}</p>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/jobs/${application.jobId}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)]">
                <p className="text-[var(--text-muted)] mb-4">No applications found</p>
                <Button asChild>
                  <Link to="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav variant="candidate" />
    </div>
  );
}
