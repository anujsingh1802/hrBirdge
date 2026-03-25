import { Link, useLocation } from "react-router";
import { LayoutDashboard, Briefcase, FileText, User } from "lucide-react";
import { cn } from "./ui/utils";

interface MobileBottomNavProps {
  variant: "candidate" | "admin";
}

export function MobileBottomNav({ variant }: MobileBottomNavProps) {
  const location = useLocation();

  const candidateLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/my-applications", icon: FileText, label: "Applications" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/jobs", icon: Briefcase, label: "Jobs" },
    { to: "/admin/applicants", icon: User, label: "Applicants" },
    { to: "/admin/bulk-upload", icon: FileText, label: "Upload" },
  ];

  const links = variant === "candidate" ? candidateLinks : adminLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border-soft)] z-50" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-[var(--accent-500)]"
                  : "text-[var(--text-muted)]"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
