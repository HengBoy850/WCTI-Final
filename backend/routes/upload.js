const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedTypes = {
  'image/jpeg': true,
  'image/png': true,
  'image/webp': true,
  'image/gif': true,
};

// Keep the file in memory instead of writing to local disk — local disk on
// Render (and most cloud hosts) is ephemeral and gets wiped on every
// restart/redeploy, so uploaded images would silently disappear. Cloudinary
// gives us a permanent URL instead.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (allowedTypes[file.mimetype]) return cb(null, true);
  cb(new Error('Only JPG, PNG, WEBP, or GIF images are allowed'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'restaurant-menu-items' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// Admin - upload a menu item image, returns a URL to store in image_url
router.post('/image', authRequired, requireRole('admin'), (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    try {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      res.status(201).json({ url: result.secure_url });
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr);
      res.status(500).json({ error: 'Image upload failed' });
    }
  });
});

module.exports = router;
