const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['project', 'research', 'certificate', 'letter', 'school', 'course'],
    required: true,
    index: true,
  },
  slug: { type: String, required: true, unique: true },

  // General info
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  readme: String, // Full README markdown content

  // Metadata
  author: { type: String, default: 'Nguyễn Đặng Tường Minh' },
  date: String,
  category: String, // "ai", "web", "fullstack", "research"
  tags: [String],

  // Links
  github: String,
  zenodo: String,
  paper: String,
  demo: String,
  file: String, // Public viewer URL or legacy path
  certificateImageName: String,
  certificateImageMime: String,
  certificateImage: { type: Buffer, select: false },
  certificateImageProvider: { type: String, enum: ['db', 'cloudinary'], default: 'db' },
  certificateImageCloudinaryUrl: String,
  certificateImageCloudinaryPublicId: String,

  // Display
  icon: String,
  color: String,
  featured: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  contentLocked: {
    type: Boolean,
    default: function defaultContentLocked() {
      return this.type === 'research';
    },
  },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  order: { type: Number, default: 0 },

  // Stats
  viewCount: { type: Number, default: 0 },

  // Multilang support
  translations: {
    en: { type: mongoose.Schema.Types.Mixed, default: {} },
    de: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
}, { timestamps: true });

function stripCertAsset(_doc, ret) {
  if (ret && ret.certificateImage !== undefined) delete ret.certificateImage;
  return ret;
}
contentSchema.set('toJSON', { transform: stripCertAsset });
contentSchema.set('toObject', { transform: stripCertAsset });

contentSchema.index({ type: 1, order: 1 });
contentSchema.index({ type: 1, featured: 1 });
// slug index already created by `unique: true` in schema

module.exports = mongoose.model('Content', contentSchema);
