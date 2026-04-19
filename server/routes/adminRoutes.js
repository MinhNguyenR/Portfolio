const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminAuth = require('../middleware/adminAuth');
const {
  login,
  getDashboard,
  getVisitors,
  getVisitorDetail,
  getContacts,
  markContactRead,
  getAllContent,
  createContent,
  updateContent,
  deleteContent,
  getProfile,
  updateProfile,
  uploadContentCertificateImage,
  aiGenerate,
} = require('../controllers/adminController');

const certDbUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

// Authentication
router.post('/login', login);

router.use(adminAuth);

// Dashboard
router.get('/dashboard', getDashboard);

// Visitors
router.get('/visitors', getVisitors);
router.get('/visitors/:id', getVisitorDetail);

// Contacts
router.get('/contacts', getContacts);
router.put('/contacts/:id/read', markContactRead);

// CMS: Content management
router.get('/content/:type', getAllContent);
router.post('/content', createContent);
router.put('/content/:id', updateContent);
router.delete('/content/:id', deleteContent);
router.post('/content/:id/certificate-image', certDbUpload.single('file'), uploadContentCertificateImage);
router.post('/ai/generate', aiGenerate);

// Profile management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
