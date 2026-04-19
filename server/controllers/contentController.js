const contentRepository = require('../repositories/contentRepository');
const contentService = require('../services/contentService');
const { resolveCertificateImage, sendImageBuffer } = require('../services/certificateAssetService');

const ALLOWED_CONTENT_TYPES = new Set(['project', 'research', 'certificate', 'letter', 'school', 'course']);
const ALLOWED_CONTENT_FIELDS = new Set([
  'type', 'slug', 'title', 'subtitle', 'description', 'readme',
  'author', 'date', 'category', 'tags',
  'github', 'zenodo', 'paper', 'demo', 'file',
  'icon', 'color', 'featured', 'visible', 'contentLocked', 'order',
  'meta',
  'certificateImageName', 'certificateImageMime', 'certificateImageProvider',
  'certificateImageCloudinaryUrl', 'certificateImageCloudinaryPublicId',
]);
const URL_FIELDS = ['github', 'zenodo', 'paper', 'demo', 'file'];

function normalizeExternalUrl(value) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function sanitizeContentInput(payload = {}, mode = 'create') {
  const safe = {};
  for (const key of ALLOWED_CONTENT_FIELDS) {
    if (payload[key] !== undefined) safe[key] = payload[key];
  }
  if (safe.type !== undefined && !ALLOWED_CONTENT_TYPES.has(safe.type)) delete safe.type;
  if (mode === 'create' && !safe.type && ALLOWED_CONTENT_TYPES.has(payload.type)) safe.type = payload.type;
  if (Array.isArray(safe.tags)) safe.tags = safe.tags.map((t) => String(t).trim()).filter(Boolean);
  for (const key of URL_FIELDS) {
    if (safe[key] === undefined) continue;
    const normalized = normalizeExternalUrl(safe[key]);
    if (normalized === undefined) delete safe[key];
    else safe[key] = normalized;
  }
  delete safe.certificatePdf;
  delete safe.hasEmbeddedPdf;
  delete safe.certificateFilename;
  delete safe.certificateImage;
  return safe;
}

/** GET /api/content/certificate-image/:slug — public inline image */
exports.serveCertificateImagePublic = async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await contentRepository.findOneLean(
      { type: 'certificate', slug, visible: true },
      '+certificateImage certificateImageMime certificateImageCloudinaryUrl file'
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    const source = resolveCertificateImage(item);
    if (source.buffer?.length) {
      const ok = sendImageBuffer(res, source.buffer, source.mime);
      if (ok) return;
    }
    const external = source.url;
    if (external && /^https?:\/\//i.test(external)) {
      return res.redirect(external);
    }
    return res.status(404).json({ error: 'No certificate image' });
  } catch (err) {
    console.error('serveCertificateImagePublic:', err.message);
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
};

// GET all items by type (with pagination)
exports.getAll = async (req, res) => {
  try {
    const { type } = req.params;
    if (!ALLOWED_CONTENT_TYPES.has(type)) return res.status(400).json({ error: 'Invalid content type' });
    const { page = 1, limit = 9, category } = req.query;

    const { items, total } = await contentService.getPagedByType({ type, page: parseInt(page, 10), limit: parseInt(limit, 10), category });

    res.json({
      items,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error('Content getAll error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET featured items (max 3)
exports.getFeatured = async (req, res) => {
  try {
    const { type } = req.params;
    if (!ALLOWED_CONTENT_TYPES.has(type)) return res.status(400).json({ error: 'Invalid content type' });
    const { items, total } = await contentService.getFeaturedByType(type, 3);
    res.json({ items, total });
  } catch (err) {
    console.error('Content getFeatured error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET single item by slug
exports.getBySlug = async (req, res) => {
  try {
    const { type, slug } = req.params;
    if (!ALLOWED_CONTENT_TYPES.has(type)) return res.status(400).json({ error: 'Invalid content type' });
    const item = await contentService.getByTypeAndSlug(type, slug);

    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Content getBySlug error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET single item by slug (any type)
exports.getBySlugAny = async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await contentRepository.findOneLean({ slug });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Content getBySlugAny error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST create new item (admin)
exports.create = async (req, res) => {
  try {
    const payload = sanitizeContentInput(req.body, 'create');
    if (!payload.type || !ALLOWED_CONTENT_TYPES.has(payload.type)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }
    const item = await contentRepository.create(payload);
    res.status(201).json(item);
  } catch (err) {
    console.error('Content create error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// PUT update item (admin)
exports.update = async (req, res) => {
  try {
    const { type, slug } = req.params;
    if (!ALLOWED_CONTENT_TYPES.has(type)) return res.status(400).json({ error: 'Invalid content type' });
    const payload = sanitizeContentInput(req.body, 'update');
    delete payload.type;
    const item = await contentRepository.findOneAndUpdate(
      { type, slug },
      payload,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Content update error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// DELETE item (admin)
exports.remove = async (req, res) => {
  try {
    const { type, slug } = req.params;
    const item = await contentRepository.findOneAndDelete({ type, slug });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item });
  } catch (err) {
    console.error('Content delete error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
