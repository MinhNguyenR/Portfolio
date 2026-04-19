const adminService = require('../services/adminService');
const { repositories } = adminService;
const { getProvider } = require('../services/certificateAssetService');
const jwt = require('jsonwebtoken');
const { callOpenRouter, translateToEnDe } = require('../utils/ai');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ALLOWED_CONTENT_TYPES = new Set(['project', 'research', 'certificate', 'letter']);
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
const ALLOWED_PROFILE_FIELDS = new Set([
  'name', 'subtitle', 'bio', 'email', 'phone', 'location', 'github', 'avatar',
  'skills', 'highlights', 'timeline', 'social', 'lab', 'interests',
]);

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

function sanitizeContentPayload(payload = {}, mode = 'create') {
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

function sanitizeProfilePayload(payload = {}) {
  const safe = {};
  for (const key of ALLOWED_PROFILE_FIELDS) {
    if (payload[key] !== undefined) safe[key] = payload[key];
  }
  if (safe.github !== undefined) {
    const normalized = normalizeExternalUrl(safe.github);
    if (normalized === undefined) delete safe.github;
    else safe.github = normalized;
  }
  return safe;
}

// Auth login
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    if (password === process.env.ADMIN_SECRET_KEY) {
      const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_SECRET_KEY, { expiresIn: '1d' });
      return res.json({ token });
    }
    return res.status(401).json({ error: 'Mật khẩu không đúng' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Dashboard overview stats
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo  = new Date(today.getTime() - 7  * 86400000);
    const monthAgo = new Date(today.getTime() - 30 * 86400000);

    const summary = await adminService.getDashboardOverview(today, weekAgo, monthAgo);
    const {
      totalVisitors, todayVisitors, weekVisitors, monthVisitors,
      totalPageViews, todayPageViews, totalInteractions,
      unreadContacts, totalContacts, contentCounts,
      recentVisitors, topPages, browserStats, deviceStats,
      countryStats, dailyVisits, knownVisitors,
    } = summary;

    const contentCountMap = {};
    contentCounts.forEach(c => { contentCountMap[c._id] = c.count; });

    res.json({
      overview: {
        totalVisitors, todayVisitors, weekVisitors, monthVisitors,
        totalPageViews, todayPageViews, totalInteractions,
        unreadContacts, totalContacts, knownVisitors,
      },
      content: contentCountMap,
      recentVisitors,
      topPages,
      browserStats,
      deviceStats,
      countryStats,
      dailyVisits,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all visitors with details
exports.getVisitors = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await repositories.visitorRepository.countDocuments();
    const visitors = await repositories.visitorRepository.find()
      .sort({ lastVisit: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ visitors, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get visitor detail
exports.getVisitorDetail = async (req, res) => {
  try {
    const visitor = await repositories.visitorRepository.findById(req.params.id);
    if (!visitor) return res.status(404).json({ error: 'Not found' });
    const pageViews = await repositories.pageViewRepository.find({ fingerprint: visitor.fingerprint }).sort({ timestamp: -1 }).limit(50);
    const interactions = await repositories.interactionRepository.find({ fingerprint: visitor.fingerprint }).sort({ timestamp: -1 }).limit(50);
    res.json({ visitor, pageViews, interactions });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await repositories.contactRepository.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark contact as read
exports.markContactRead = async (req, res) => {
  try {
    const contact = await repositories.contactRepository.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── CMS ─────────────────────────────────────────────────────────────────────

// CMS
exports.getAllContent = async (req, res) => {
  try {
    const items = await repositories.contentRepository.find({ type: req.params.type })
      .select('-certificateImage')
      .sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

async function getTransForContent(payload) {
  const toTranslate = {
    title: payload.title,
    subtitle: payload.subtitle,
    description: payload.description,
    readme: payload.readme,
  };

  // School meta
  if (payload.type === 'school' && payload.meta) {
    if (payload.meta.highlights) {
      payload.meta.highlights.forEach((h, i) => {
        toTranslate[`meta_highlight_title_${i}`] = h.title;
        toTranslate[`meta_highlight_desc_${i}`] = h.desc;
      });
    }
    if (payload.meta.myJourney) {
      toTranslate['meta_journey_grade'] = payload.meta.myJourney.grade;
      toTranslate['meta_journey_achievement'] = payload.meta.myJourney.achievement;
      toTranslate['meta_journey_note'] = payload.meta.myJourney.note;
    }
    if (payload.meta.programs) {
      payload.meta.programs.forEach((p, i) => {
        toTranslate[`meta_program_${i}`] = p;
      });
    }
  }

  const trans = await translateToEnDe(toTranslate);
  if (!trans) return null;

  // Map back for school meta
  if (payload.type === 'school' && payload.meta) {
    ['en', 'de'].forEach(l => {
      if (!trans[l]) return;
      if (payload.meta.highlights) {
        payload.meta.highlights.forEach((h, i) => {
          const hKeyT = `meta_highlight_title_${i}`;
          const hKeyD = `meta_highlight_desc_${i}`;
          if (!trans[l].meta) trans[l].meta = {};
          if (!trans[l].meta.highlights) trans[l].meta.highlights = [];
          trans[l].meta.highlights[i] = {
            title: trans[l][hKeyT] || h.title,
            desc: trans[l][hKeyD] || h.desc,
            icon: h.icon
          };
          delete trans[l][hKeyT];
          delete trans[l][hKeyD];
        });
      }
      if (payload.meta.myJourney) {
        if (!trans[l].meta) trans[l].meta = {};
        trans[l].meta.myJourney = {
          ...payload.meta.myJourney,
          grade: trans[l]['meta_journey_grade'] || payload.meta.myJourney.grade,
          achievement: trans[l]['meta_journey_achievement'] || payload.meta.myJourney.achievement,
          note: trans[l]['meta_journey_note'] || payload.meta.myJourney.note,
        };
        delete trans[l]['meta_journey_grade'];
        delete trans[l]['meta_journey_achievement'];
        delete trans[l]['meta_journey_note'];
      }
      if (payload.meta.programs) {
        if (!trans[l].meta) trans[l].meta = {};
        trans[l].meta.programs = payload.meta.programs.map((p, i) => trans[l][`meta_program_${i}`] || p);
        payload.meta.programs.forEach((_, i) => delete trans[l][`meta_program_${i}`]);
      }
    });
  }

  return trans;
}

exports.createContent = async (req, res) => {
  try {
    const payload = sanitizeContentPayload(req.body, 'create');
    payload.translations = await getTransForContent(payload);
    const item = await repositories.contentRepository.create(payload);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const payload = sanitizeContentPayload(req.body, 'update');
    payload.translations = await getTransForContent(payload);
    const item = await repositories.contentRepository.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
      .select('-certificateImage');
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.uploadContentCertificateImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const item = await repositories.contentRepository.findById(id);
    if (!item) return res.status(404).json({ error: 'Content not found' });
    if (item.type !== 'certificate') {
      return res.status(400).json({ error: 'Only certificate content accepts image' });
    }
    const safeName = (req.file.originalname || 'certificate.jpg')
      .replace(/[^a-zA-Z0-9.\-_àáâãèéêìíòóôõùúýăđơư\s]/gi, '_');

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'portfolio/certificates' },
      async (error, result) => {
        if (error) return res.status(500).json({ error: 'Cloudinary upload failed' });

        item.certificateImage = undefined;
        item.certificateImageName = safeName;
        item.certificateImageMime = req.file.mimetype || 'image/jpeg';
        item.certificateImageProvider = 'cloudinary';
        item.certificateImageCloudinaryUrl = result.secure_url;
        item.certificateImageCloudinaryPublicId = result.public_id;
        item.file = result.secure_url;
        await item.save();

        return res.json({
          success: true,
          item: {
            _id: item._id,
            slug: item.slug,
            file: item.file,
            certificateImageName: item.certificateImageName,
            certificateImageMime: item.certificateImageMime,
            certificateImageProvider: item.certificateImageProvider,
            certificateImageCloudinaryUrl: item.certificateImageCloudinaryUrl
          },
        });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const item = await repositories.contentRepository.findByIdAndDelete(req.params.id).select('-certificateImage');
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Profile
exports.getProfile = async (req, res) => {
  try {
    let profile = await repositories.profileRepository.findOne();
    if (!profile) profile = await repositories.profileRepository.create({});
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = sanitizeProfilePayload(req.body);

    const toTranslate = {
      name: payload.name,
      subtitle: payload.subtitle,
    };

    if (payload.cv) {
      if (payload.cv.objective) toTranslate['cv_objective'] = payload.cv.objective;
      if (payload.cv.highlights) {
        payload.cv.highlights.forEach((h, i) => {
          toTranslate[`cv_highlight_${i}`] = h;
        });
      }
    }

    if (payload.skills) {
      Object.keys(payload.skills).forEach((cat, i) => {
        toTranslate[`skills_cat_${i}`] = cat;
        if (Array.isArray(payload.skills[cat])) {
          payload.skills[cat].forEach((item, j) => {
            toTranslate[`skills_item_${i}_${j}`] = item;
          });
        }
      });
    }

    const trans = await translateToEnDe(toTranslate);
    if (trans) {
      ['en', 'de'].forEach(l => {
        if (!trans[l]) return;
        // CV
        if (payload.cv) {
          if (!trans[l].cv) trans[l].cv = {};
          if (trans[l]['cv_objective']) trans[l].cv.objective = trans[l]['cv_objective'];
          if (payload.cv.highlights) {
            trans[l].cv.highlights = payload.cv.highlights.map((h, i) => trans[l][`cv_highlight_${i}`] || h);
          }
        }
        // Skills
        if (payload.skills) {
          if (!trans[l].skills) trans[l].skills = {};
          Object.keys(payload.skills).forEach((cat, i) => {
            const tCat = trans[l][`skills_cat_${i}`] || cat;
            if (Array.isArray(payload.skills[cat])) {
              trans[l].skills[tCat] = payload.skills[cat].map((item, j) => trans[l][`skills_item_${i}_${j}`] || item);
            }
          });
        }
        // Timeline
        if (Array.isArray(payload.timeline)) {
          // Note: Timeline translation here is tricky because translateToEnDe is normally called outside.
          // For now let's keep timeline items translations if they exist in payload or rethink.
          // Since we want auto, let's keep it simple: profile translations won't include timeline items which are subdocs with their own trans.
        }
      });
      payload.translations = trans;
    }

    // Auto translate individual timeline items
    if (Array.isArray(payload.timeline)) {
      payload.timeline = await Promise.all(payload.timeline.map(async (item) => {
        const itemToTranslate = {
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
        };
        item.translations = await translateToEnDe(itemToTranslate);
        return item;
      }));
    }

    let profile = await repositories.profileRepository.findOne();
    if (!profile) {
      profile = await repositories.profileRepository.create(payload);
    } else {
      Object.assign(profile, payload);
      profile.markModified('skills');
      profile.markModified('translations');
      profile.markModified('timeline');
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.uploadProfileBrandingHachiware = async (req, res) => {
  try {
    const dark = req.files?.dark?.[0];
    const light = req.files?.light?.[0];
    if (!dark && !light) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    let profile = await repositories.profileRepository.findOne();
    if (!profile) profile = await repositories.profileRepository.create({});

    const uploadBuffer = (buf) => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'portfolio/branding' }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
      stream.end(buf);
    });

    if (dark) {
      const uploadRes = await uploadBuffer(dark.buffer);
      profile.brandingHachiDark = undefined;
      profile.brandingHachiDarkMime = dark.mimetype;
      profile.brandingHachiDarkCloudinaryUrl = uploadRes.secure_url;
    }
    if (light) {
      const uploadRes = await uploadBuffer(light.buffer);
      profile.brandingHachiLight = undefined;
      profile.brandingHachiLightMime = light.mimetype;
      profile.brandingHachiLightCloudinaryUrl = uploadRes.secure_url;
    }
    await profile.save();
    return res.json({
      success: true,
      uploaded: {
        dark: !!dark,
        light: !!light,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Upload branding failed' });
  }
};

exports.aiGenerate = async (req, res) => {
  try {
    const { type, prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const systemPrompt = `You are a helpful assistant for a portfolio admin dashboard.
Based on the raw data provided by the user, generate a structured JSON object for a "${type}" entry.
The JSON must follow these fields:
- title: string (short, catchy)
- subtitle: string (brief description)
- slug: string (url-friendly, e.g., "my-project-name")
- description: string (1-2 sentences summary)
- date: string (e.g., "2026" or "04/2026")
- category: string (one of: ai, web, fullstack, research, education)
- tags: array of strings (3-5 relevant technologies)
- icon: string (single emoji)
- readme: string (detailed markdown content, professional, include sections like # Overview, # Key Features, # Tech Stack)

Respond ONLY with the JSON object. Vietnamese language is preferred for display text.`;

    const result = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Raw data: ${prompt}` }
    ]);

    if (!result) return res.status(500).json({ error: 'AI generation failed' });
    
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      console.error('AI Parse error:', result);
      res.status(500).json({ error: 'AI returned invalid JSON' });
    }
  } catch (err) {
    console.error('AI Generate error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
