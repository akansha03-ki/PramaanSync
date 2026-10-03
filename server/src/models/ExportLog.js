const mongoose = require('mongoose');

const exportLogSchema = new mongoose.Schema({
  exportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminBadgeId: { type: String, required: true },
  evidenceIds: [{ type: String, required: true }],
  caseId: { type: String },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean, default: true },
  previousHash: { type: String, default: 'GENESIS_HASH_000000000000000000000000' },
  hashChainEntry: { type: String, required: true }, // Current entry hash = SHA256(previousHash + exportedBy + timestamp + evidenceIds)
  signedSignature: { type: String } // Signed with active KMS log-signing key
});

module.exports = mongoose.model('ExportLog', exportLogSchema);
