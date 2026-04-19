const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema({
  date: String,
  title: String,
  subtitle: String,
  description: String,
  icon: { type: String, default: '📌' },
  // school = trường chính, course = trung tâm/khóa học, research/project/achievement = khác
  category: {
    type: String,
    enum: ['school', 'course', 'research', 'project', 'achievement'],
    default: 'project',
  },
  schoolSlug: { type: String },
  translations: {
    en: { type: mongoose.Schema.Types.Mixed, default: {} },
    de: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
}, { _id: true });

const profileSchema = new mongoose.Schema({
  // Personal info
  name: { type: String, default: 'Nguyễn Đặng Tường Minh' },
  subtitle: { type: String, default: '15 tuổi · AI Researcher · Full-Stack Developer' },
  email: { type: String, default: 'nguyendangtuongminh555@gmail.com' },
  phone: { type: String, default: '0375157991' },
  github: { type: String, default: 'https://github.com/MinhNguyenR' },
  location: { type: String, default: 'Vũng Tàu, Việt Nam' },

  // Lab setup
  lab: [String],

  // Skills (category → items array)
  skills: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Timeline entries
  timeline: [timelineItemSchema],

  // CV summary
  cv: {
    objective: String,
    highlights: [String],
  },
  brandingHachiDark: { type: Buffer, select: false },
  brandingHachiDarkMime: String,
  brandingHachiDarkSize: Number,
  brandingHachiDarkCloudinaryUrl: String,
  brandingHachiLight: { type: Buffer, select: false },
  brandingHachiLightMime: String,
  brandingHachiLightSize: Number,
  brandingHachiLightCloudinaryUrl: String,
  translations: {
    en: { type: mongoose.Schema.Types.Mixed, default: {} },
    de: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
}, { timestamps: true });

function stripBrandingBuffers(_doc, ret) {
  if (!ret) return ret;
  delete ret.brandingHachiDark;
  delete ret.brandingHachiLight;
  return ret;
}
profileSchema.set('toJSON', { transform: stripBrandingBuffers });
profileSchema.set('toObject', { transform: stripBrandingBuffers });

module.exports = mongoose.model('Profile', profileSchema);
