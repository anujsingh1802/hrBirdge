import { cn } from "./ui/utils";

type StatusType = "pending" | "reviewed" | "shortlisted" | "rejected";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles = {
  pending: {
    bg: "var(--status-pending-bg)",
    text: "var(--status-pending-text)",
  },
  reviewed: {
    bg: "var(--status-reviewed-bg)",
    text: "var(--status-reviewed-text)",
  },
  shortlisted: {
    bg: "var(--status-shortlisted-bg)",
    text: "var(--status-shortlisted-text)",
  },
  rejected: {
    bg: "var(--status-rejected-bg)",
    text: "var(--status-rejected-text)",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status];
  
  return (
    <span
      className={cn("inline-flex items-center h-[var(--height-badge)] px-3 text-xs font-medium", className)}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: 'var(--radius-chip)',
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
