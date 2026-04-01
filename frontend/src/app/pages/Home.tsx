import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, MapPin, BriefcaseBusiness, Laptop, Clock3, Building2, CheckCircle, FileText, Zap, User, Briefcase } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { JobCard } from "../components/JobCard";
import { getJobs } from "../lib/api";
import type { Job } from "../lib/types";

export function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroAssets = ["/hero-1.png", "/hero-2.png"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroAssets.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroAssets.length]);

  useEffect(() => {
    let mounted = true;

    getJobs({ limit: 6, sort: "newest" })
      .then((result) => {
        if (mounted) setFeaturedJobs(result.items.slice(0, 3));
      })
      .catch(() => {
        if (mounted) setFeaturedJobs([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const base = [
      { icon: BriefcaseBusiness, name: "Full-time", query: "full-time" },
      { icon: Laptop, name: "Remote", query: "remote" },
      { icon: Clock3, name: "Part-time", query: "part-time" },
      { icon: Building2, name: "Contract", query: "contract" },
    ];

    return base.map((category) => ({
      ...category,
      count: featuredJobs.filter((job) => job.type.toLowerCase() === category.query).length,
    }));
  }, [featuredJobs]);

  const howItWorks = [
    {
      icon: FileText,
      title: "Create Profile",
      description: "Register in minutes and keep your details ready for quick applications.",
    },
    {
      icon: Search,
      title: "Discover Roles",
      description: "Search live jobs by title, location, skill, or work style.",
    },
    {
      icon: CheckCircle,
      title: "Apply Fast",
      description: "Use the same backend-powered flow to track every application status.",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Fast Search",
      description: "Filter jobs quickly with responsive search and useful metadata.",
    },
    {
      icon: Building2,
      title: "Verified Listings",
      description: "Browse openings posted and managed directly inside the admin dashboard.",
    },
    {
      icon: CheckCircle,
      title: "Clear Tracking",
      description: "Candidates and admins both see transparent application statuses.",
    },
    {
      icon: BriefcaseBusiness,
      title: "Admin Ready",
      description: "Create jobs, bulk upload openings, and review applicants in one workflow.",
    },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    const query = params.toString();
    navigate(query ? `/jobs?${query}` : "/jobs");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />

      <section className="bg-[var(--bg-surface)] pt-[130px] pb-20 md:pt-[160px] md:pb-24" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)]">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 text-blue-700 font-semibold text-sm mb-6 border border-blue-100/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                HYREIN – Hire Smarter
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                Hire Smarter.<br/><span className="text-blue-600">Grow Faster.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl leading-relaxed font-medium">
                Connecting talent with opportunity through smart hiring and job-ready skills. Where companies find the right talent, and candidates find the right career.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 mb-10">
                 <button className="flex items-center gap-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-full shadow-sm hover:bg-slate-100 hover:border-slate-300 transition-all group">
                   <Briefcase size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                   For Employers
                 </button>
                 <button className="flex items-center gap-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-full shadow-sm hover:bg-slate-100 hover:border-slate-300 transition-all group">
                   <User size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                   For Job Seekers
                 </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="bg-white p-2 flex flex-col md:flex-row gap-2" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-md)" }}>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Job title, skill, or keyword"
                    className="pl-10 border-0 h-12 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                  />
                </div>
                <div className="hidden md:block w-px bg-slate-200 my-2" />
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <Input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Location"
                    className="pl-10 border-0 h-12 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 px-8 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
                  style={{ borderRadius: "var(--radius-button)" }}
                >
                  Search Jobs
                </Button>
              </form>
            </div>

            <div className="hidden md:block relative group">
              <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden relative shadow-2xl border-4 border-white">
                {heroAssets.map((asset, index) => (
                  <div
                    key={asset}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                      index === currentImageIndex 
                        ? "opacity-100 scale-100 translate-x-0" 
                        : "opacity-0 scale-110 translate-x-full"
                    }`}
                  >
                    <img 
                      src={asset} 
                      alt="Hero Background" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {heroAssets.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === currentImageIndex ? "w-8 bg-blue-500" : "w-2 bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hiring Status</p>
                    <p className="text-sm font-bold text-slate-800">Verified Jobs Only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="py-16 md:py-20">
        <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-strong)] mb-4">Popular Job Types</h2>
            <p className="text-lg text-[var(--text-default)]">Jump into the kinds of roles candidates look for most often.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  to={`/jobs?job_type=${category.query}`}
                  className="bg-[var(--bg-surface)] p-6 text-center border border-[var(--border-soft)] hover:border-[var(--accent-500)] transition-all group"
                  style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-100)] flex items-center justify-center group-hover:bg-[var(--accent-500)] transition-colors">
                    <Icon className="w-8 h-8 text-[var(--accent-600)] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-strong)] mb-2">{category.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{category.count} featured matches</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[var(--bg-surface)]">
        <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)]">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-strong)] mb-4">Latest Jobs</h2>
              <p className="text-lg text-[var(--text-default)]">Fresh roles pulled from the live backend.</p>
            </div>
            <Button asChild variant="outline" className="hidden md:inline-flex" style={{ borderRadius: "var(--radius-button)" }}>
              <Link to="/jobs">View All Jobs</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-72 rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
              ))}
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job, index) => (
                <JobCard key={job.id} {...job} featured={index === 0} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-base)] p-10 text-center">
              <p className="text-[var(--text-muted)] mb-4">No live jobs available yet. Once the admin posts jobs, they’ll appear here automatically.</p>
              <Button asChild variant="outline">
                <Link to="/jobs">Go to Jobs</Link>
              </Button>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" className="w-full" style={{ borderRadius: "var(--radius-button)" }}>
              <Link to="/jobs">View All Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-20">
        <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-strong)] mb-4">How It Works</h2>
            <p className="text-lg text-[var(--text-default)]">The full journey stays simple for both candidates and recruiters.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="bg-[var(--bg-surface)] p-8 text-center border border-[var(--border-soft)]"
                  style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--accent-500)] flex items-center justify-center text-white text-xl font-bold">
                    {index + 1}
                  </div>
                  <Icon className="w-12 h-12 mx-auto mb-4 text-[var(--accent-600)]" />
                  <h3 className="text-xl font-semibold text-[var(--text-strong)] mb-3">{step.title}</h3>
                  <p className="text-[var(--text-default)]">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[var(--bg-surface)]">
        <div className="max-w-[var(--container-max)] mx-auto px-4 md:px-[var(--container-margin)]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-strong)] mb-4">Why This Experience Feels Better</h2>
            <p className="text-lg text-[var(--text-default)]">Everything you see here is designed to stay readable, responsive, and useful.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white p-6 border border-[var(--border-soft)]" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="w-12 h-12 mb-4 rounded-lg bg-[var(--accent-100)] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[var(--accent-600)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-default)]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
