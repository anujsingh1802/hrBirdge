import { useEffect, useState } from "react";
import { Link } from "react-router";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getBlogs } from "../lib/api";
import type { Blog } from "../lib/types";

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="bg-[var(--bg-surface)] border border-[var(--border-soft)] overflow-hidden"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="w-full bg-[var(--bg-muted)] animate-pulse" style={{ height: `${180 + Math.random() * 120}px` }} />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-[var(--bg-muted)] rounded animate-pulse w-3/4" />
        <div className="h-3 bg-[var(--bg-muted)] rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

function BlogImage({ src, alt, titleInitial }: { src: string; alt: string; titleInitial: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{
          height: "160px",
          background: "linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%)",
        }}
      >
        <span className="text-white text-4xl font-bold opacity-30 select-none">
          {titleInitial}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ display: "block" }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// ─── Blog Card ─────────────────────────────────────────────────────────────────

function BlogCard({ blog }: { blog: Blog }) {
  const authorName = typeof blog.author === "object" ? blog.author.name : "HYREIN";
  const date = new Date(blog.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group block bg-[var(--bg-surface)] border border-[var(--border-soft)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
    >
      {/* Thumbnail */}
      <BlogImage
        src={blog.thumbnail || ""}
        alt={blog.title}
        titleInitial={blog.title.charAt(0).toUpperCase()}
      />

      {/* Content */}
      <div className="p-4">
        <h2 className="text-[var(--text-strong)] font-semibold text-base leading-snug mb-2 line-clamp-3 group-hover:text-[var(--accent-500)] transition-colors duration-200">
          {blog.title}
        </h2>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{authorName}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getBlogs({ limit: 50 })
      .then((result) => {
        if (mounted) setBlogs(result.items);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || "Failed to load blogs.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />

      {/* Header */}
      <section className="py-16 px-4 text-center" style={{ background: "linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%)" }}>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">HYREIN Blog</h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto">
          Insights, guides, and career tips from the HYREIN team.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Error state */}
        {error && (
          <div className="mb-8 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)] text-center max-w-lg mx-auto">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 640: 2, 1024: 3 }}>
            <Masonry gutter="20px">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}

        {/* Masonry grid */}
        {!loading && blogs.length > 0 && (
          <ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 640: 2, 1024: 3 }}>
            <Masonry gutter="20px">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}

        {/* Empty state */}
        {!loading && blogs.length === 0 && !error && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-2">No posts yet</h2>
            <p className="text-[var(--text-muted)]">Check back soon for insights and articles from the HYREIN team.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
