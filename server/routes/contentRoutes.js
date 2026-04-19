const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  getAll,
  getFeatured,
  getBySlug,
  getBySlugAny,
  serveCertificateImagePublic,
  create,
  update,
  remove,
} = require('../controllers/contentController');

// Public routes (specific paths before /:type)
router.get('/certificate-image/:slug', serveCertificateImagePublic);
router.get('/any/:slug', getBySlugAny);

router.get('/:type', getAll);
router.get('/:type/featured', getFeatured);
router.get('/:type/:slug', getBySlug);

// Admin routes (require secret key)
router.post('/:type', adminAuth, create);
router.put('/:type/:slug', adminAuth, update);
router.delete('/:type/:slug', adminAuth, remove);

module.exports = router;
