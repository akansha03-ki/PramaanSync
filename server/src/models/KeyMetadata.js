const mongoose = require('mongoose');

const keyMetadataSchema = new mongoose.Schema({
  keyId: { type: String, required: true, unique: true },
  purpose: { type: String, default: 'log-signing' },
  algorithm: { type: String, default: 'HMAC-SHA256' },
  publicKeyPem: { type: String }, // Optional RSA public key
  secretKey: { type: String, required: true },
  status: { type: String, enum: ['active', 'rotated', 'revoked'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  rotatedAt: { type: Date },
  revokedAt: { type: Date },
  usageAuditTrail: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    actor: String,
    details: String
  }]
});

module.exports = mongoose.model('KeyMetadata', keyMetadataSchema);
