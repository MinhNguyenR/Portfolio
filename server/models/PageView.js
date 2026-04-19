const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  fingerprint: String,
  section: String,
  timestamp: { type: Date, default: Date.now },
  duration: Number, // seconds spent
  scrollDepth: Number, // percentage 0-100
  referrer: String,
}, { timestamps: true });

module.exports = mongoose.model('PageView', pageViewSchema);
