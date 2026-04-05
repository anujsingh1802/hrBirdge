const { v2: cloudinary } = require('cloudinary');

// Configure once on import
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer   - File buffer from multer memoryStorage
 * @param {'image'|'video'} resourceType
 * @param {string} folder   - Cloudinary folder (e.g. 'blog-thumbnails')
 * @returns {Promise<string>} - Secure URL of the uploaded asset
 */
const uploadBuffer = (buffer, resourceType = 'image', folder = 'hyrein-blog') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new Error('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing in the server environment variables. Please add them to your Render dashboard.'));
    }
  
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { uploadBuffer };
