const mongoose = require('mongoose');

// ─── Content Block Schema ──────────────────────────────────────────────────────

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'image', 'video'],
      required: [true, 'Block type is required'],
    },
    value: {
      type: String,
      required: [true, 'Block value is required'],
      trim: true,
    },
  },
  { _id: false }
);

// ─── Blog Schema ───────────────────────────────────────────────────────────────

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    content: {
      type: [contentBlockSchema],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// ─── Index for lookups ─────────────────────────────────────────────────────────
blogSchema.index({ createdAt: -1 });

// ─── Auto-generate slug from title before saving ────────────────────────────

blogSchema.pre('validate', async function () {
  if (this.isNew && !this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }
});

function generateSlug(title) {
  const base = title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // Remove non-alphanumeric except spaces & dashes
    .replace(/[\s_]+/g, '-')         // Spaces → dashes
    .replace(/-+/g, '-')             // Collapse multiple dashes
    .slice(0, 80);                   // Keep reasonably short
  const suffix = Date.now().toString(36); // e.g. "lrxyz" — ensures uniqueness
  return `${base}-${suffix}`;
}

module.exports = mongoose.model('Blog', blogSchema);
