import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { FileQuestion } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <FileQuestion className="w-24 h-24 mx-auto mb-6 text-[var(--text-muted)]" />
        <h1 className="text-6xl font-bold text-[var(--text-strong)] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[var(--text-strong)] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--text-default)] mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            asChild
            className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            <Link to="/">Go Home</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            style={{ borderRadius: 'var(--radius-button)' }}
          >
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
