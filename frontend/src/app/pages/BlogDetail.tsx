import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { getBlogBySlug } from "../lib/api";
import type { Blog, ContentBlock } from "../lib/types";

// ─── YouTube helper ────────────────────────────────────────────────────────────

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

// ─── Content Block Renderer ────────────────────────────────────────────────────

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "text":
      return (
        <p className="text-[var(--text-default)] text-lg leading-relaxed whitespace-pre-line">
          {block.value}
        </p>
      );

    case "image":
      return (
        <div className="my-2 overflow-hidden rounded-2xl">
          <img
            src={block.value}
            alt="Blog content"
            loading="lazy"
            className="w-full h-auto object-cover"
          />
        </div>
      );

    case "video": {
      const embedUrl = getYouTubeEmbedUrl(block.value);
      if (embedUrl) {
        return (
          <div className="my-2 overflow-hidden rounded-2xl" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={embedUrl}
              title="Embedded video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        );
      }
      return (
        <div className="my-2 overflow-hidden rounded-2xl">
          <video
            src={block.value}
            controls
            className="w-full h-auto"
            style={{ maxHeight: "480px" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="h-10 bg-[var(--bg-muted)] animate-pulse rounded-xl mb-4 w-2/3" />
      <div className="h-4 bg-[var(--bg-muted)] animate-pulse rounded w-1/3 mb-8" />
      <div className="h-72 bg-[var(--bg-muted)] animate-pulse rounded-2xl mb-8" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-4 bg-[var(--bg-muted)] animate-pulse rounded mb-3 w-full" />
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    getBlogBySlug(slug)
      .then((data) => {
        if (mounted) setBlog(data);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || "Blog not found.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const authorName = blog ? (typeof blog.author === "object" ? blog.author.name : "HYREIN") : "";
  const date = blog
    ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />

      <main>
        {loading && <Skeleton />}

        {!loading && error && (
          <div className="max-w-3xl mx-auto px-4 py-24 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Blog not found</h1>
            <p className="text-[var(--text-muted)] mb-8">{error}</p>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-[var(--accent-500)] hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all blogs
            </Link>
          </div>
        )}

        {!loading && blog && (
          <>
            {/* Hero thumbnail */}
            {blog.thumbnail && (
              <div className="w-full overflow-hidden" style={{ maxHeight: "480px" }}>
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="w-full object-cover"
                  style={{ maxHeight: "480px" }}
                />
              </div>
            )}

            <article className="max-w-3xl mx-auto px-4 py-12">
              {/* Back link */}
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-500)] transition-colors duration-200 mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                All posts
              </Link>

              {/* Meta */}
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-strong)] leading-tight mb-4">
                  {blog.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--text-default)]">{authorName}</span>
                  <span>·</span>
                  <time>{date}</time>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-[var(--border-soft)] mb-8" />

              {/* Dynamic Content */}
              <div className="space-y-6">
                {blog.content.length > 0 ? (
                  blog.content.map((block, index) => (
                    <ContentBlockRenderer key={index} block={block} />
                  ))
                ) : (
                  <p className="text-[var(--text-muted)] text-center py-8">No content yet.</p>
                )}
              </div>

              {/* Footer back link */}
              <div className="mt-12 pt-8 border-t border-[var(--border-soft)]">
                <Link
                  to="/blogs"
                  className="inline-flex items-center gap-2 text-[var(--accent-500)] hover:underline font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to all posts
                </Link>
              </div>
            </article>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
