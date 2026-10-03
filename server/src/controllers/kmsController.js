const kmsService = require('../services/kmsService');

exports.getKeys = async (req, res) => {
  try {
    const keys = await kmsService.listKeys();
    res.json({
      architectureNote: 'KMS-pattern implementation (HMAC/RSA-based, application-level)',
      totalKeys: keys.length,
      keys
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rotateKey = async (req, res) => {
  try {
    const actor = req.user ? (req.user.badgeId || req.user.name) : 'Admin';
    const result = await kmsService.rotateActiveKey(actor);

    res.json({
      message: 'Log-signing key rotated successfully in KMS-pattern implementation (HMAC/RSA-based, application-level)',
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.revokeKey = async (req, res) => {
  try {
    const { keyId, reason } = req.body;
    const actor = req.user ? (req.user.badgeId || req.user.name) : 'Admin';

    if (!keyId) {
      return res.status(400).json({ error: 'keyId is required for key revocation.' });
    }

    const key = await kmsService.revokeKey(keyId, actor, reason || 'Manual Admin Revocation');
    res.json({
      message: `Key ${keyId} revoked successfully`,
      key
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
