const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true }, // reference by string evidenceId or ObjectId
  event: { type: String, required: true }, // e.g. "captured", "uploaded", "hash generated", "integrity verified"
  description: { type: String, required: true },
  actor: { type: String, required: true }, // User badge ID or name
  state: { type: String, enum: ['success', 'warning', 'failed', 'info'], default: 'info' },
  hashSignature: { type: String }, // Signed hash entry
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
