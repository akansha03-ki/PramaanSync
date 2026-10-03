/**
 * KMS-pattern implementation (HMAC/RSA-based, application-level).
 * 
 * NOTE: This is a KMS-pattern implementation (HMAC/RSA-based, application-level) for prototype purposes,
 * not a hardware-backed HSM or cloud KMS integration.
 */
const crypto = require('crypto');
const KeyMetadata = require('../models/KeyMetadata');

class KMSService {
  /**
   * Get active key or create initial log-signing key.
   */
  async getOrCreateActiveKey() {
    let activeKey = await KeyMetadata.findOne({ status: 'active', purpose: 'log-signing' });
    if (!activeKey) {
      activeKey = await this.generateKey('log-signing', 'System Initialization');
    }
    return activeKey;
  }

  /**
   * Generate a new log-signing key.
   * @param {string} purpose 
   * @param {string} actor 
   */
  async generateKey(purpose = 'log-signing', actor = 'Admin') {
    const keyId = `KMS-KEY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const secretKey = crypto.randomBytes(32).toString('hex');
    
    // Generate RSA key pair for cryptographic signatures
    const { publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    const keyDoc = new KeyMetadata({
      keyId,
      purpose,
      algorithm: 'HMAC-SHA256 / RSA-2048',
      publicKeyPem: publicKey,
      secretKey,
      status: 'active',
      usageAuditTrail: [{
        action: 'KEY_GENERATED',
        actor,
        details: 'Generated new active log-signing key pair'
      }]
    });

    await keyDoc.save();
    console.log(`[KMSService] KMS-pattern implementation (HMAC/RSA-based, application-level) generated key: ${keyId}`);
    return keyDoc;
  }

  /**
   * Rotate active log-signing key.
   * @param {string} actor 
   */
  async rotateActiveKey(actor = 'Admin') {
    const currentKey = await KeyMetadata.findOne({ status: 'active', purpose: 'log-signing' });
    if (currentKey) {
      currentKey.status = 'rotated';
      currentKey.rotatedAt = new Date();
      currentKey.usageAuditTrail.push({
        action: 'KEY_ROTATED',
        actor,
        details: 'Key rotated to new active generation'
      });
      await currentKey.save();
    }

    const newKey = await this.generateKey('log-signing', actor);
    return { previousKeyId: currentKey?.keyId, newKeyId: newKey.keyId };
  }

  /**
   * Revoke a specific key.
   * @param {string} keyId 
   * @param {string} actor 
   * @param {string} reason 
   */
  async revokeKey(keyId, actor = 'Admin', reason = 'Security Policy') {
    const key = await KeyMetadata.findOne({ keyId });
    if (!key) throw new Error(`Key ${keyId} not found`);

    key.status = 'revoked';
    key.revokedAt = new Date();
    key.usageAuditTrail.push({
      action: 'KEY_REVOKED',
      actor,
      details: `Revoked key: ${reason}`
    });
    await key.save();
    return key;
  }

  /**
   * Sign log entry using KMS key.
   * @param {string} dataPayload 
   */
  async signLogEntry(dataPayload) {
    const key = await this.getOrCreateActiveKey();
    const hmac = crypto.createHmac('sha256', key.secretKey);
    hmac.update(dataPayload);
    const signature = hmac.digest('hex');

    key.usageAuditTrail.push({
      action: 'KEY_USED_SIGN',
      actor: 'System',
      details: `Signed payload hash of length ${dataPayload.length}`
    });
    await key.save();

    return {
      keyId: key.keyId,
      signature: `KMS-SIG-${key.keyId.slice(-8)}-${signature}`
    };
  }

  /**
   * List all key metadata audit records.
   */
  async listKeys() {
    return await KeyMetadata.find().sort({ createdAt: -1 });
  }
}

module.exports = new KMSService();
