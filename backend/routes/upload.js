const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = allowedTypes[file.mimetype] || path.extname(file.originalname) || '';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

function fileFilter(req, file, cb) {
  if (allowedTypes[file.mimetype]) return cb(null, true);
  cb(new Error('Only JPG, PNG, WEBP, or GIF images are allowed'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Admin - upload a menu item image, returns a URL to store in image_url
router.post('/image', authRequired, requireRole('admin'), (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;
