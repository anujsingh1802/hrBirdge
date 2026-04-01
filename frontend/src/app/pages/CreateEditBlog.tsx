import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Plus, Trash2, GripVertical, Image, Video, Type, Upload } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ApiError, createBlog, updateBlog, uploadBlogMedia } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { ContentBlock, ContentBlockType } from "../lib/types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ContentBlockDraft extends ContentBlock {
  id: string; // local UI key
  uploading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const BLOCK_ICONS: Record<ContentBlockType, React.ReactNode> = {
  text: <Type className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
};

// ─── Single content block editor ───────────────────────────────────────────────

function BlockEditor({
  block,
  index,
  total,
  token,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: ContentBlockDraft;
  index: number;
  total: number;
  token: string;
  onChange: (id: string, updates: Partial<ContentBlockDraft>) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;
      onChange(block.id, { uploading: true });
      try {
        const url = await uploadBlogMedia(file, token);
        onChange(block.id, { value: url, uploading: false });
      } catch (err) {
        onChange(block.id, { uploading: false });
        alert(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
      }
    },
    [block.id, onChange, token]
  );

  return (
    <div
      className="bg-[var(--bg-base)] border border-[var(--border-soft)] p-4"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      {/* Block header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-default)] transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-muted)] px-2 py-1 rounded-full">
          {BLOCK_ICONS[block.type]}
          {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
        </span>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onMoveUp(block.id)}
            title="Move up"
            className="h-7 w-7 text-xs"
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === total - 1}
            onClick={() => onMoveDown(block.id)}
            title="Move down"
            className="h-7 w-7 text-xs"
          >
            ↓
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(block.id)}
            className="h-7 w-7 text-[var(--status-rejected-text)] hover:text-[var(--status-rejected-text)]"
            title="Remove block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Block input */}
      {block.type === "text" && (
        <Textarea
          value={block.value}
          onChange={(e) => onChange(block.id, { value: e.target.value })}
          placeholder="Enter your text content here..."
          className="min-h-[120px] bg-[var(--bg-surface)]"
        />
      )}

      {block.type === "image" && (
        <div className="space-y-3">
          {/* File upload */}
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-soft)] rounded-xl p-6 cursor-pointer hover:border-[var(--accent-500)] transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            {block.uploading ? (
              <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                <div className="w-6 h-6 border-2 border-[var(--accent-500)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Uploading to Cloudinary...</span>
              </div>
            ) : block.value ? (
              <img
                src={block.value}
                alt="Preview"
                className="max-h-40 object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                <Upload className="w-8 h-8 opacity-40" />
                <span className="text-sm">Click to upload image</span>
                <span className="text-xs opacity-60">JPG, PNG, WEBP, GIF supported</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = "";
            }}
          />
          {/* OR paste URL */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[var(--border-soft)]" />
            <span className="text-xs text-[var(--text-muted)] px-2">or paste URL</span>
            <div className="flex-1 h-px bg-[var(--border-soft)]" />
          </div>
          <Input
            value={block.value}
            onChange={(e) => onChange(block.id, { value: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="h-10 bg-[var(--bg-surface)] text-sm"
          />
        </div>
      )}

      {block.type === "video" && (
        <div className="space-y-3">
          {/* File upload */}
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-soft)] rounded-xl p-6 cursor-pointer hover:border-[var(--accent-500)] transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            {block.uploading ? (
              <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                <div className="w-6 h-6 border-2 border-[var(--accent-500)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Uploading video to Cloudinary...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                <Upload className="w-8 h-8 opacity-40" />
                <span className="text-sm">Click to upload video</span>
                <span className="text-xs opacity-60">MP4, MOV, WEBM supported</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = "";
            }}
          />
          {/* OR paste URL */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[var(--border-soft)]" />
            <span className="text-xs text-[var(--text-muted)] px-2">or paste URL / YouTube link</span>
            <div className="flex-1 h-px bg-[var(--border-soft)]" />
          </div>
          <Input
            value={block.value}
            onChange={(e) => onChange(block.id, { value: e.target.value })}
            placeholder="https://youtube.com/watch?v=... or direct video URL"
            className="h-10 bg-[var(--bg-surface)] text-sm"
          />
          {block.value && (
            <p className="text-xs text-[var(--text-muted)]">
              ✓ URL saved. It will render as YouTube embed or native video on the blog page.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function CreateEditBlog() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlockDraft[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [newBlockType, setNewBlockType] = useState<ContentBlockType>("text");

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Load existing blog when editing ───────────────────────────────────────
  useEffect(() => {
    if (!isEditing || !id) return;
    let mounted = true;

    // When editing, we have the blog _id but we need the slug to fetch.
    // We use the ManageBlogs list approach: fetch via /blogs and find by _id.
    // Since the detail endpoint needs slug, we pass the id as a workaround — 
    // actually the backend's GET /blogs/:slug will 404 on an _id.
    // Solution: store slug in state via ManageBlogs → navigate with slug param.
    // For edit route /admin/blogs/:id/edit, we'll fetch with the _id by modifying
    // the controller to support both. Instead, we query all blogs and match _id.
    import("../lib/api")
      .then(({ getBlogs }) => getBlogs({ limit: 100 }))
      .then(({ items }) => {
        if (!mounted) return;
        const found = items.find((b) => b._id === id);
        if (found) {
          setTitle(found.title);
          setThumbnailPreview(found.thumbnail || "");
          setBlocks(
            (found.content || []).map((block) => ({ ...block, id: uid() }))
          );
        } else {
          setError("Blog not found.");
        }
      })
      .catch((err) => {
        if (mounted) setError(err instanceof ApiError ? err.message : "Failed to load blog.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, isEditing]);

  // ── Block operations ──────────────────────────────────────────────────────

  const addBlock = () => {
    setBlocks((prev) => [...prev, { id: uid(), type: newBlockType, value: "" }]);
  };

  const updateBlock = useCallback((bid: string, updates: Partial<ContentBlockDraft>) => {
    setBlocks((prev) => prev.map((b) => (b.id === bid ? { ...b, ...updates } : b)));
  }, []);

  const removeBlock = useCallback((bid: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== bid));
  }, []);

  const moveUp = useCallback((bid: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === bid);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((bid: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === bid);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  // ── Thumbnail picker ──────────────────────────────────────────────────────

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    if (!title.trim()) {
      setError("Blog title is required.");
      return;
    }

    const hasUploading = blocks.some((b) => b.uploading);
    if (hasUploading) {
      setError("Please wait for all media uploads to complete.");
      return;
    }

    setSubmitting(true);
    setError("");

    const cleanBlocks: ContentBlock[] = blocks
      .filter((b) => b.value.trim())
      .map(({ type, value }) => ({ type, value }));

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", JSON.stringify(cleanBlocks));
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    try {
      if (isEditing && id) {
        await updateBlog(id, formData, token);
      } else {
        await createBlog(formData, token);
      }
      navigate("/admin/blogs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save blog. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />

      <div className="flex">
        <Sidebar variant="admin" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">
                {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
              </h1>
              <p className="text-[var(--text-default)]">
                {isEditing ? "Update your blog post content" : "Compose a new blog post for HYREIN"}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-[var(--status-rejected-bg)] bg-[var(--status-rejected-bg)] p-4 text-sm text-[var(--status-rejected-text)]">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                <div className="h-12 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
                <div className="h-48 rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
                <div className="h-32 rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* ── Section 1: Basic Info ── */}
                <div
                  className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6"
                  style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
                >
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">
                    Basic Information
                  </h2>
                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Blog Title</Label>
                    <Input
                      id="blog-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 5 Tips for Landing Your Dream Job"
                      className="h-12 bg-[var(--bg-base)]"
                      required
                    />
                    <p className="text-xs text-[var(--text-muted)]">
                      A slug will be auto-generated from this title.
                    </p>
                  </div>
                </div>

                {/* ── Section 2: Thumbnail ── */}
                <div
                  className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6"
                  style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
                >
                  <h2 className="text-xl font-semibold text-[var(--text-strong)] mb-6">
                    Thumbnail Image
                  </h2>

                  {thumbnailPreview ? (
                    <div className="space-y-3">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full max-h-60 object-cover rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview("");
                        }}
                        style={{ borderRadius: "var(--radius-button)" }}
                      >
                        Remove Thumbnail
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="thumbnail-input"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-soft)] rounded-xl p-10 cursor-pointer hover:border-[var(--accent-500)] transition-colors duration-200"
                    >
                      <Upload className="w-10 h-10 text-[var(--text-muted)] opacity-40 mb-3" />
                      <span className="text-sm text-[var(--text-muted)]">Click to upload thumbnail</span>
                      <span className="text-xs text-[var(--text-muted)] opacity-60 mt-1">
                        JPG, PNG, WEBP — Recommended 1200×630px
                      </span>
                    </label>
                  )}
                  <input
                    id="thumbnail-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </div>

                {/* ── Section 3: Content Builder ── */}
                <div
                  className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-6"
                  style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--text-strong)]">Content</h2>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        Build your post using text, image, and video blocks.
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-muted)] px-3 py-1 rounded-full">
                      {blocks.length} block{blocks.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Block list */}
                  <div className="space-y-4 mb-6">
                    {blocks.length === 0 ? (
                      <div className="text-center py-8 text-[var(--text-muted)] text-sm border-2 border-dashed border-[var(--border-soft)] rounded-xl">
                        No content blocks yet. Add your first block below.
                      </div>
                    ) : (
                      blocks.map((block, index) => (
                        <BlockEditor
                          key={block.id}
                          block={block}
                          index={index}
                          total={blocks.length}
                          token={token}
                          onChange={updateBlock}
                          onRemove={removeBlock}
                          onMoveUp={moveUp}
                          onMoveDown={moveDown}
                        />
                      ))
                    )}
                  </div>

                  {/* Add block controls */}
                  <div className="flex items-center gap-3 border-t border-[var(--border-soft)] pt-4">
                    <Select
                      value={newBlockType}
                      onValueChange={(v) => setNewBlockType(v as ContentBlockType)}
                    >
                      <SelectTrigger
                        id="block-type-select"
                        className="w-40 h-10 bg-[var(--bg-base)]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">
                          <span className="flex items-center gap-2">
                            <Type className="w-4 h-4" /> Text
                          </span>
                        </SelectItem>
                        <SelectItem value="image">
                          <span className="flex items-center gap-2">
                            <Image className="w-4 h-4" /> Image
                          </span>
                        </SelectItem>
                        <SelectItem value="video">
                          <span className="flex items-center gap-2">
                            <Video className="w-4 h-4" /> Video
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addBlock}
                      style={{ borderRadius: "var(--radius-button)" }}
                      className="h-10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Block
                    </Button>
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
                    style={{ borderRadius: "var(--radius-button)" }}
                  >
                    {submitting ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    asChild
                  >
                    <Link to="/admin/blogs">Cancel</Link>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav variant="admin" />
    </div>
  );
}
