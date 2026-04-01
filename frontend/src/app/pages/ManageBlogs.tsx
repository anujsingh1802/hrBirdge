import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { MoreVertical, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { ApiError, deleteBlog, getBlogs } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Blog } from "../lib/types";

export function ManageBlogs() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getBlogs({ limit: 50 })
      .then((result) => {
        if (mounted) setBlogs(result.items);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load blogs.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = blogs.filter((b) =>
    !search.trim() || b.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (!token || !window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteBlog(id, token);
      setBlogs((current) => current.filter((b) => b._id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete this blog.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />

      <div className="flex">
        <Sidebar variant="admin" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Manage Blogs</h1>
                <p className="text-[var(--text-default)]">Create, edit, and manage blog posts</p>
              </div>
              <Button
                asChild
                className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                <Link to="/admin/blogs/create">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Link>
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            {/* Search */}
            <div className="mb-6">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="h-12 bg-[var(--bg-surface)] max-w-sm"
              />
            </div>

            {/* Loading */}
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
                ))}
              </div>
            )}

            {/* Desktop Table */}
            {!loading && (
              <div
                className="hidden md:block bg-[var(--bg-surface)] border border-[var(--border-soft)]"
                style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Blocks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-[var(--text-muted)]">
                          No blog posts found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((blog) => (
                        <TableRow key={blog._id}>
                          <TableCell className="font-medium max-w-xs truncate">{blog.title}</TableCell>
                          <TableCell>
                            {typeof blog.author === "object" ? blog.author.name : "—"}
                          </TableCell>
                          <TableCell>
                            {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>{blog.content?.length ?? 0}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/blog/${blog.slug}`} target="_blank">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Live
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/blogs/${blog._id}/edit`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 font-semibold"
                                  onClick={() => handleDelete(blog._id, blog.title)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Mobile Cards */}
            {!loading && (
              <div className="md:hidden space-y-4">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-muted)]">No blog posts found.</div>
                ) : (
                  filtered.map((blog) => (
                    <div
                      key={blog._id}
                      className="bg-[var(--bg-surface)] p-4 border border-[var(--border-soft)]"
                      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-[var(--text-strong)] flex-1 mr-2 line-clamp-2">
                          {blog.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/blog/${blog.slug}`} target="_blank">View Live</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/blogs/${blog._id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 font-semibold"
                              onClick={() => handleDelete(blog._id, blog.title)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {" · "}
                        {blog.content?.length ?? 0} blocks
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav variant="admin" />
    </div>
  );
}
