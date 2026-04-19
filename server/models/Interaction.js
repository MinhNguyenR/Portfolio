const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  fingerprint: String,
  type: {
    type: String,
    enum: ['click', 'scroll', 'hover', 'project_view', 'form_submit', 'download', 'link_click'],
  },
  target: String, // element identifier
  metadata: mongoose.Schema.Types.Mixed, // flexible extra data
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);
