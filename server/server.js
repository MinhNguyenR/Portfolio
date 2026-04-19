require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const tracker = require('./middleware/tracker');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security & middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const p = req.path || '';
    if (req.method === 'GET' && (p === '/api/profile' || p.startsWith('/api/content/') || p.startsWith('/api/branding/'))) {
      return true;
    }
    if (p === '/api/track') return true;
    return false;
  },
});
app.use('/api/', apiLimiter);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chat requests. Try again shortly.' },
});
app.use('/api/chat', chatLimiter);

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Tracker middleware
app.use(tracker);

// Routes
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/contact',   require('./routes/contactRoutes'));
app.use('/api/content',   require('./routes/contentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/chat',      require('./routes/chatRoutes'));

// Detailed fingerprint tracking endpoint
const { track } = require('./controllers/trackController');
app.post('/api/track', trackLimiter, track);

// Public profile endpoint (no auth needed)
const Profile = require('./models/Profile');
const Content = require('./models/Content');

function asBuffer(v) {
  if (!v) return null;
  if (Buffer.isBuffer(v)) return v;
  if (v?.buffer && typeof v.position === 'number') {
    const raw = Buffer.isBuffer(v.buffer) ? v.buffer : Buffer.from(v.buffer);
    return raw.subarray(0, v.position);
  }
  if (typeof v.buffer !== 'undefined' && v.byteLength !== undefined) {
    return Buffer.from(v.buffer, v.byteOffset ?? 0, v.byteLength);
  }
  try {
    return Buffer.from(v);
  } catch {
    return null;
  }
}

function sendBrandingImage({ buf, mime, variant, res }) {
  const buffer = asBuffer(buf);
  if (!buf) {
    return res.status(404).json({ error: `Branding image not found for variant: ${variant}` });
  }
  if (!buffer || !buffer.length) {
    return res.status(404).json({ error: `Branding image buffer empty for variant: ${variant}` });
  }
  res.setHeader('Content-Type', mime || 'image/png');
  res.setHeader('Content-Length', String(buffer.length));
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(buffer);
}

app.get('/api/profile', async (req, res) => {
  try {
    let profile = await Profile.findOne().lean();
    if (!profile) {
      profile = {};
    }
    // Dynamic stats from content counts
    const [projects, research, certificates] = await Promise.all([
      Content.countDocuments({ type: 'project', visible: true }),
      Content.countDocuments({ type: 'research', visible: true }),
      Content.countDocuments({ type: 'certificate', visible: true }),
    ]);

    const schools = profile.timeline?.filter(t => t.category === 'school').length || 1;
    const courses = profile.timeline?.filter(t => t.category === 'course').length || 3;

    res.json({
      ...profile,
      dynamicStats: {
        projects,
        research,
        certificates,
        schools,
        courses,
      },
    });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/branding/hachiware/:variant', async (req, res) => {
  try {
    const variant = req.params.variant === 'light' ? 'light' : 'dark';
    const profile = await Profile.findOne()
      .select('+brandingHachiDark +brandingHachiLight brandingHachiDarkMime brandingHachiLightMime brandingHachiDarkCloudinaryUrl brandingHachiLightCloudinaryUrl')
      .lean();
    if (!profile) return res.status(404).json({ error: 'Branding profile not found' });
    if (variant === 'light') {
      if (profile.brandingHachiLightCloudinaryUrl) {
        return res.redirect(profile.brandingHachiLightCloudinaryUrl);
      }
      return sendBrandingImage({
        buf: profile.brandingHachiLight,
        mime: profile.brandingHachiLightMime,
        variant,
        res,
      });
    }
    if (profile.brandingHachiDarkCloudinaryUrl) {
       return res.redirect(profile.brandingHachiDarkCloudinaryUrl);
    }
    return sendBrandingImage({
      buf: profile.brandingHachiDark,
      mime: profile.brandingHachiDarkMime,
      variant,
      res,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Root route for health check & verification
app.get('/', (req, res) => {
  res.send('🚀 Portfolio API is running! Access the profile via /api/profile');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Analytics API: http://localhost:${PORT}/api/analytics`);
  console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
  console.log(`📦 Content API: http://localhost:${PORT}/api/content`);
  console.log(`🔐 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`🐱 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`👤 Profile API: http://localhost:${PORT}/api/profile`);
});
