const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10);

// Use memory storage so buffer can be streamed directly to Cloudinary
const storage = multer.memoryStorage();

const blogMediaFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov', '.webm'];
  if (ALLOWED.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type "${ext}". Allowed: ${ALLOWED.join(', ')}`), false);
  }
};

const blogMediaUpload = multer({
  storage,
  fileFilter: blogMediaFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

module.exports = { blogMediaUpload };
