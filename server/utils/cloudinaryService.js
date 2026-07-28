const cloudinary = require('cloudinary').v2;
const fs = require('fs');

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Delete a file from Cloudinary given its public_id
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`[Cloudinary]: Deleted file ${publicId}`);
    }
  } catch (err) {
    console.error(`[Cloudinary Delete Error]: ${err.message}`);
  }
};

/**
 * Helper to get file path/URL from req.file or req.files
 */
const getUploadedFileInfo = (file) => {
  if (!file) return { path: '', public_id: '' };
  // If uploaded via Cloudinary storage plugin
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return {
      path: file.path,
      public_id: file.filename || file.public_id || '',
    };
  }
  // Local disk fallback
  return {
    path: `/uploads/${file.filename}`,
    public_id: '',
  };
};

module.exports = {
  cloudinary,
  deleteFromCloudinary,
  getUploadedFileInfo,
};
