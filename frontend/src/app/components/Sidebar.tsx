import { Link, useLocation } from "react-router";
import { LayoutDashboard, Briefcase, FileText, User, Users, Upload, Settings } from "lucide-react";
import { cn } from "./ui/utils";

interface SidebarProps {
  variant: "candidate" | "admin";
}

export function Sidebar({ variant }: SidebarProps) {
  const location = useLocation();

  const candidateLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/jobs", icon: Briefcase, label: "Find Jobs" },
    { to: "/my-applications", icon: FileText, label: "My Applications" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/jobs", icon: Briefcase, label: "Manage Jobs" },
    { to: "/admin/applicants", icon: Users, label: "Applicants" },
    { to: "/admin/bulk-upload", icon: Upload, label: "Bulk Upload" },
    { to: "/admin/blogs", icon: FileText, label: "Manage Blogs" },
    { to: "/admin/settings", icon: Settings, label: "Site Settings" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const links = variant === "candidate" ? candidateLinks : adminLinks;

  return (
    <aside
      className="w-[var(--width-sidebar)] bg-[var(--bg-surface)] border-r border-[var(--border-soft)] min-h-screen sticky top-0 hidden md:block"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="p-6">
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-[var(--accent-100)] text-[var(--accent-600)]"
                    : "text-[var(--text-default)] hover:bg-[var(--bg-muted)]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
