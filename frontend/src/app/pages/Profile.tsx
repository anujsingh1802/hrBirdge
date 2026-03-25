import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Briefcase, CheckCircle, Mail, CalendarDays, Save, User as UserIcon, Loader2, X, Upload } from "lucide-react";
import { ApiError, getMyApplications, updateMe, uploadResume } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Application } from "../lib/types";

const AVAILABLE_SKILLS = [
  "React", "Angular", "Vue", "Svelte", "Next.js", "TypeScript", "JavaScript", 
  "HTML/CSS", "Tailwind CSS", "Node.js", "Express", "NestJS", "Python", "Django", "FastAPI",
  "Java", "Spring Boot", "C#", ".NET", "Go", "Ruby on Rails", "PHP", "Laravel",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "System Design",
  "UI/UX", "Figma", "Agile", "Scrum"
];

export function Profile() {
  const { user, token, setUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setSkills(user.skills || []);
      setResumeUrl(user.resumeUrl || "");
      setLocation(user.location || "");
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    if (!token) return;

    getMyApplications(token, { limit: 50 })
      .then((result) => {
        if (mounted) setApplications(result.items);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load profile data.");
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const stats = useMemo(() => ({
    total: applications.length,
    shortlisted: applications.filter((item) => item.status === "shortlisted").length,
    reviewed: applications.filter((item) => item.status === "reviewed").length,
  }), [applications]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    try {
      const payload = {
        name,
        bio,
        location,
        resumeUrl,
        skills
      };

      const result = await updateMe(token, payload);
      setUser(result.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="flex">
        <Sidebar variant="candidate" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">My Profile</h1>
                <p className="text-[var(--text-default)]">Manage your personal information and professional details.</p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                <Briefcase className="w-8 h-8 text-[var(--accent-500)] mb-3" />
                <p className="text-sm text-[var(--text-muted)] mb-1">Applications</p>
                <p className="text-3xl font-semibold text-[var(--text-strong)]">{stats.total}</p>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                <CheckCircle className="w-8 h-8 text-[var(--accent-500)] mb-3" />
                <p className="text-sm text-[var(--text-muted)] mb-1">Shortlisted</p>
                <p className="text-3xl font-semibold text-[var(--text-strong)]">{stats.shortlisted}</p>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                <Mail className="w-8 h-8 text-[var(--accent-500)] mb-3" />
                <p className="text-sm text-[var(--text-muted)] mb-1">Reviewed</p>
                <p className="text-3xl font-semibold text-[var(--text-strong)]">{stats.reviewed}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-[var(--accent-500)]" />
                    Account Information
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} className="h-12 bg-[var(--bg-base)]" placeholder="Your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" value={user?.email || ""} className="h-12 bg-[var(--bg-base)] opacity-70 cursor-not-allowed" disabled />
                      <p className="text-[10px] text-[var(--text-muted)]">Email changes must be requested via support.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={location} onChange={e => setLocation(e.target.value)} className="h-12 bg-[var(--bg-base)]" placeholder="e.g. New York, USA" />
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">Professional Links</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Resume Document (PDF/DOC)</Label>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center justify-center w-full h-12 px-4 transition bg-[var(--bg-base)] border-2 border-dashed border-[var(--border-soft)] rounded-md cursor-pointer hover:border-[var(--accent-500)] text-[var(--accent-500)] font-medium text-sm">
                            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !token) return;
                              toast.loading("Uploading resume...", { id: "upload" });
                              try {
                                const result = await uploadResume(file, token);
                                setResumeUrl(result.resumeUrl);
                                setUser(result.user);
                                toast.success("Resume uploaded!", { id: "upload" });
                              } catch(err) {
                                toast.error("Upload failed", { id: "upload" });
                              }
                            }} />
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Resume
                          </label>
                          {resumeUrl && (
                            <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-500)] underline truncate">
                              View current resume
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label>Key Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {AVAILABLE_SKILLS.map(skill => {
                          const isSelected = skills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                setSkills(prev => 
                                  isSelected ? prev.filter(s => s !== skill) : [...prev, skill]
                                );
                              }}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isSelected ? 'bg-[var(--accent-500)] text-white border-[var(--accent-500)]' : 'bg-[var(--bg-base)] text-[var(--text-default)] border-[var(--border-soft)] hover:border-[var(--accent-300)]'}`}
                            >
                              {skill} {isSelected && <X className="inline-block w-3 h-3 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">Professional Summary</h2>
                  <Textarea
                    id="bio"
                    className="min-h-[220px] bg-[var(--bg-base)]"
                    placeholder="Tell us about your background and what you are looking for..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-[var(--text-muted)] text-right">{bio.length}/500</p>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6 flex flex-col items-center justify-center text-center space-y-4" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="w-16 h-16 rounded-full bg-[var(--accent-100)] flex items-center justify-center">
                    <CalendarDays className="w-8 h-8 text-[var(--accent-500)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-strong)]">Profile Completion</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Make sure your profile is complete to increase your chances with recruiters.</p>
                  </div>
                  <Button onClick={handleSave} variant="outline" className="w-full" disabled={isSaving}>
                    Update Profile Details
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      <MobileBottomNav variant="candidate" />
    </div>
  );
}
