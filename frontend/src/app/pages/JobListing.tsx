import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { JobCard } from "../components/JobCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { X, SlidersHorizontal } from "lucide-react";
import { ApiError, getJobs } from "../lib/api";
import type { Job, Pagination } from "../lib/types";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance", "remote"];

export function JobListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(() => {
    const jobType = searchParams.get("job_type");
    return jobType ? [jobType] : [];
  });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [skills, setSkills] = useState(searchParams.get("skills") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [salaryCap, setSalaryCap] = useState(Number(searchParams.get("salary_max") || "3000000"));
  const [page, setPage] = useState(Number(searchParams.get("page") || "1"));
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (skills) params.set("skills", skills);
    if (selectedJobTypes[0]) params.set("job_type", selectedJobTypes[0]);
    if (salaryCap < 3000000) params.set("salary_max", String(salaryCap));
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    setSearchParams(params, { replace: true });
  }, [location, page, salaryCap, search, selectedJobTypes, setSearchParams, skills, sort]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getJobs({
      search: search || undefined,
      location: location || undefined,
      job_type: selectedJobTypes[0] || undefined,
      skills: skills || undefined,
      salary_max: salaryCap < 3000000 ? salaryCap : undefined,
      page,
      limit: 9,
      sort,
    })
      .then((result) => {
        if (!mounted) return;
        setJobs(result.items);
        setPagination(result.pagination);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof ApiError ? err.message : "Unable to load jobs right now.");
        setJobs([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [location, page, salaryCap, search, selectedJobTypes, skills, sort]);

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setSkills("");
    setSelectedJobTypes([]);
    setSalaryCap(3000000);
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="public" />

      <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)] py-8"
           style={{ animation: 'fadeInUp 0.45s ease both' }}>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-strong)] mb-2">Find Jobs</h1>
          <p className="text-[var(--text-default)]">{pagination?.total ?? jobs.length} jobs found</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 grid gap-3 md:grid-cols-2">
            <Input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by title, company, or skill..."
              className="h-12 bg-[var(--bg-surface)]"
            />
            <Input
              value={location}
              onChange={(event) => {
                setPage(1);
                setLocation(event.target.value);
              }}
              placeholder="Filter by location"
              className="h-12 bg-[var(--bg-surface)]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Select value={sort} onValueChange={(value) => {
              setPage(1);
              setSort(value);
            }}>
              <SelectTrigger className="w-[180px] h-12 bg-[var(--bg-surface)]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="salary_desc">Salary: High to Low</SelectItem>
                <SelectItem value="salary_asc">Salary: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          <aside
            className={`
              ${showFilters ? "block" : "hidden"} md:block
              fixed md:sticky top-0 left-0 right-0 md:top-4
              w-full md:w-[280px]
              bg-[var(--bg-surface)] p-6
              z-40 md:z-0
              h-screen md:h-fit
              overflow-y-auto
              border-r border-[var(--border-soft)]
            `}
            style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-6 md:hidden">
              <h3 className="font-semibold text-[var(--text-strong)]">Filters</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--text-strong)] mb-4">Job Type</h3>
                <div className="space-y-3">
                  {JOB_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedJobTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setPage(1);
                          setSelectedJobTypes(checked ? [type] : []);
                        }}
                      />
                      <Label htmlFor={type} className="text-sm cursor-pointer capitalize">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--text-strong)] mb-4">Skills</h3>
                <Input
                  value={skills}
                  onChange={(event) => {
                    setPage(1);
                    setSkills(event.target.value);
                  }}
                  placeholder="react,nodejs,mongodb"
                />
                <p className="mt-2 text-xs text-[var(--text-muted)]">Comma-separated skills for AND matching.</p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--text-strong)] mb-4">Maximum Salary</h3>
                <div className="px-2">
                  <Slider
                    value={[salaryCap]}
                    onValueChange={(value) => {
                      setPage(1);
                      setSalaryCap(value[0] ?? 3000000);
                    }}
                    min={0}
                    max={3000000}
                    step={100000}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-[var(--text-muted)]">
                    <span>0</span>
                    <span>{salaryCap.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={resetFilters}>Reset Filters</Button>
            </div>
          </aside>

          <div className="flex-1">
            {(selectedJobTypes.length > 0 || skills || location || search) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedJobTypes.map((type) => (
                  <span key={type} className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-100)] text-[var(--accent-600)]" style={{ borderRadius: "var(--radius-chip)" }}>
                    {type}
                    <button onClick={() => setSelectedJobTypes([])} className="hover:text-[var(--accent-600)]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {skills && <span className="inline-flex items-center px-3 py-1 bg-[var(--bg-muted)] text-[var(--text-default)]" style={{ borderRadius: "var(--radius-chip)" }}>skills: {skills}</span>}
                {location && <span className="inline-flex items-center px-3 py-1 bg-[var(--bg-muted)] text-[var(--text-default)]" style={{ borderRadius: "var(--radius-chip)" }}>location: {location}</span>}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-56 rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} {...job} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface)] p-10 text-center">
                <p className="text-[var(--text-muted)] mb-4">No jobs matched your filters.</p>
                <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <span className="px-4 py-2 text-sm text-[var(--text-muted)]">Page {pagination.page} of {pagination.totalPages}</span>
                <Button variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
