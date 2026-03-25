import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ApiError, createJob, getJob, updateJob } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const INITIAL_FORM = {
  title: "",
  company: "",
  location: "",
  job_type: "full-time",
  salary: "",
  salary_min: "",
  salary_max: "",
  skills: "",
  description: "",
};

export function CreateEditJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    if (!isEditing || !id) return;

    getJob(id)
      .then((job) => {
        if (!mounted) return;
        setForm({
          title: job.title,
          company: job.company,
          location: job.location,
          job_type: job.type,
          salary: job.salary === "Not specified" ? "" : job.salary,
          salary_min: String(job.salaryMin || ""),
          salary_max: String(job.salaryMax || ""),
          skills: job.skills.join(", "),
          description: job.description,
        });
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
  }, [id, isEditing]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      job_type: form.job_type.trim(),
      salary: form.salary.trim(),
      salary_min: Number(form.salary_min) || 0,
      salary_max: Number(form.salary_max) || 0,
      skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      description: form.description.trim(),
    };

    try {
      if (isEditing && id) {
        await updateJob(id, payload, token);
      } else {
        await createJob(payload, token);
      }
      navigate("/admin/jobs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save this job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="flex">
        <Sidebar variant="admin" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">{isEditing ? "Edit Job" : "Create New Job"}</h1>
              <p className="text-[var(--text-default)]">{isEditing ? "Update job posting details" : "Fill in the details to create a new job posting"}</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            {loading ? (
              <div className="h-96 rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">Basic Information</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Senior React Developer" className="h-12 bg-[var(--bg-base)]" required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} placeholder="Company name" className="h-12 bg-[var(--bg-base)]" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="e.g. San Francisco, CA" className="h-12 bg-[var(--bg-base)]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Job Type</Label>
                      <Select value={form.job_type} onValueChange={(value) => setForm((current) => ({ ...current, job_type: value }))}>
                        <SelectTrigger id="type" className="h-12 bg-[var(--bg-base)]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">Compensation</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary Label</Label>
                      <Input id="salary" value={form.salary} onChange={(event) => setForm((current) => ({ ...current, salary: event.target.value }))} placeholder="e.g. 10-15 LPA" className="h-12 bg-[var(--bg-base)]" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary-min">Minimum Salary</Label>
                        <Input id="salary-min" type="number" value={form.salary_min} onChange={(event) => setForm((current) => ({ ...current, salary_min: event.target.value }))} placeholder="1000000" className="h-12 bg-[var(--bg-base)]" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary-max">Maximum Salary</Label>
                        <Input id="salary-max" type="number" value={form.salary_max} onChange={(event) => setForm((current) => ({ ...current, salary_max: event.target.value }))} placeholder="1500000" className="h-12 bg-[var(--bg-base)]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">Skills</h2>
                  <Input value={form.skills} onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))} placeholder="react, nodejs, mongodb" className="h-12 bg-[var(--bg-base)]" />
                  <p className="mt-2 text-xs text-[var(--text-muted)]">Separate skills with commas.</p>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">Job Description</h2>
                  <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the role, responsibilities, and requirements..." className="min-h-[220px] bg-[var(--bg-base)]" />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting} className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white" style={{ borderRadius: "var(--radius-button)" }}>
                    {submitting ? "Saving..." : isEditing ? "Update Job" : "Publish Job"}
                  </Button>
                  <Button type="button" variant="outline" style={{ borderRadius: "var(--radius-button)" }} onClick={() => setForm(INITIAL_FORM)}>
                    Reset
                  </Button>
                  <Button type="button" variant="ghost" asChild>
                    <Link to="/admin/jobs">Cancel</Link>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav variant="admin" />
    </div>
  );
}
