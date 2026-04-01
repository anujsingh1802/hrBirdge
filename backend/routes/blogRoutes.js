const express = require('express');

const {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  getBlogBySlug,
  uploadMedia,
} = require('../controllers/blogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { blogMediaUpload } = require('../middleware/blogUpload');

const router = express.Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.post('/upload-media', protect, adminOnly, blogMediaUpload.single('file'), uploadMedia);
router.post('/', protect, adminOnly, blogMediaUpload.single('thumbnail'), createBlog);
router.put('/:id', protect, adminOnly, blogMediaUpload.single('thumbnail'), updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

module.exports = router;
