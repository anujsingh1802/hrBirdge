import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div
      className="bg-[var(--bg-surface)] p-[var(--padding-card)] border border-[var(--border-soft)]"
      style={{
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-[var(--accent-100)] flex items-center justify-center">
          <Icon className="w-6 h-6 text-[var(--accent-600)]" />
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? "text-[var(--state-success)]" : "text-[var(--state-error)]"
            }`}
          >
            {trend.isPositive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-semibold text-[var(--text-strong)] mb-1">
          {value}
        </p>
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
