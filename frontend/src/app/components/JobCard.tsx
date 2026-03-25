import { Link } from "react-router";
import { MapPin, DollarSign, Clock, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  description: string;
  featured?: boolean;
  saved?: boolean;
  postedAt?: string;
}

export function JobCard({
  id,
  title,
  company,
  location,
  type,
  salary,
  skills,
  description,
  featured = false,
  saved = false,
  postedAt,
}: JobCardProps) {
  const postedLabel = postedAt
    ? new Date(postedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently posted";

  return (
    <div
      className="bg-[var(--bg-surface)] p-[var(--padding-card)] border border-[var(--border-soft)] hover:border-[var(--accent-500)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transform hover:-translate-y-0.5 transition-all duration-300 group"
      style={{
        animation: 'fadeInUp 0.45s ease both',
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(249,250,251,0.95))',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {featured && (
              <Badge className="bg-[var(--accent-100)] text-[var(--accent-600)] border-0">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {type}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-strong)] mb-1">
            {title}
          </h3>
          <p className="text-[var(--text-default)]">{company}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={saved ? "text-[var(--accent-500)]" : "text-[var(--text-muted)]"}
        >
          <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-[var(--text-muted)]">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {location}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {salary}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {postedLabel}
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-[var(--bg-muted)] text-[var(--text-default)] text-sm"
            style={{ borderRadius: 'var(--radius-chip)' }}
          >
            {skill}
          </span>
        ))}
        {skills.length > 4 && (
          <span
            className="px-3 py-1 bg-[var(--bg-muted)] text-[var(--text-muted)] text-sm"
            style={{ borderRadius: 'var(--radius-chip)' }}
          >
            +{skills.length - 4} more
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[var(--text-default)] text-sm mb-4 line-clamp-2">
        {description}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          asChild
          className="flex-1 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
          style={{ borderRadius: 'var(--radius-button)' }}
        >
          <Link to={`/jobs/${id}`}>View Details</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex-1"
          style={{ borderRadius: 'var(--radius-button)' }}
        >
          <Link to={`/apply/${id}`}>Apply Now</Link>
        </Button>
      </div>
    </div>
  );
}
