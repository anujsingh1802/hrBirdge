const Blog = require('../models/Blog');
const { uploadBuffer } = require('../utils/cloudinary');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determine Cloudinary resource type from MIME type.
 * @param {string} mimetype
 * @returns {'image'|'video'}
 */
const getResourceType = (mimetype) => {
  if (mimetype.startsWith('video/')) return 'video';
  return 'image';
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/blogs/upload-media
 * Protected — admin only
 * Uploads a single image or video file to Cloudinary and returns the URL.
 * Used by the frontend content builder for per-block media uploads.
 */
exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const resourceType = getResourceType(req.file.mimetype);
    const url = await uploadBuffer(req.file.buffer, resourceType, 'hyrein-blog/content');

    return res.status(200).json({ success: true, url });
  } catch (err) {
    console.error('Error in uploadMedia:', err);
    next(err);
  }
};

/**
 * POST /api/blogs
 * Protected — admin only
 * Create a new blog post. Thumbnail file (if provided) is uploaded to Cloudinary.
 */
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Blog title is required' });
    }

    // Parse content if sent as a JSON string (FormData)
    let parsedContent = [];
    if (content) {
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid content format' });
      }
    }

    let thumbnail = '';
    if (req.file) {
      thumbnail = await uploadBuffer(req.file.buffer, 'image', 'hyrein-blog/thumbnails');
    }

    const blog = await Blog.create({
      title: title.trim(),
      thumbnail,
      content: parsedContent,
      author: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Blog created successfully', data: blog });
  } catch (err) {
    console.error('Error in createBlog:', err);
    next(err);
  }
};

/**
 * PUT /api/blogs/:id
 * Protected — admin only
 * Update an existing blog post. If a new thumbnail file is provided, upload it.
 */
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const { title, content } = req.body;

    if (title) blog.title = title.trim();

    if (content) {
      try {
        blog.content = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid content format' });
      }
    }

    if (req.file) {
      blog.thumbnail = await uploadBuffer(req.file.buffer, 'image', 'hyrein-blog/thumbnails');
    }

    await blog.save();

    return res.status(200).json({ success: true, message: 'Blog updated successfully', data: blog });
  } catch (err) {
    console.error('Error in updateBlog:', err);
    next(err);
  }
};

/**
 * DELETE /api/blogs/:id
 * Protected — admin only
 * Hard-delete a blog post.
 */
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/blogs
 * Public — fetch all blog posts (newest first)
 */
exports.getBlogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug thumbnail createdAt author')
        .populate('author', 'name'),
      Blog.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/blogs/:slug
 * Public — fetch a single blog post by slug
 */
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .select('-__v')
      .populate('author', 'name');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};
