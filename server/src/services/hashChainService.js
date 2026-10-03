const crypto = require('crypto');
const ExportLog = require('../models/ExportLog');
const kmsService = require('./kmsService');

class HashChainService {
  /**
   * Append an admin export action to the hash-chained log.
   * @param {Object} param0 
   */
  async appendExportLog({ adminUserId, adminBadgeId, evidenceIds, caseId = 'CASE-GENERAL', success = true }) {
    // Get last log entry to find previousHash
    const lastLog = await ExportLog.findOne().sort({ timestamp: -1 });
    const previousHash = lastLog ? lastLog.hashChainEntry : 'GENESIS_HASH_00000000000000000000000000000000';

    const timestamp = new Date();
    const rawPayload = `${previousHash}|${adminUserId}|${adminBadgeId}|${caseId}|${evidenceIds.sort().join(',')}|${timestamp.toISOString()}|${success}`;
    
    // SHA-256 hash entry
    const hashChainEntry = crypto.createHash('sha256').update(rawPayload).digest('hex');

    // Sign hash using KMS-pattern application-level service
    const { keyId, signature } = await kmsService.signLogEntry(hashChainEntry);

    const logEntry = new ExportLog({
      exportedBy: adminUserId,
      adminBadgeId,
      evidenceIds,
      caseId,
      timestamp,
      success,
      previousHash,
      hashChainEntry,
      signedSignature: `${keyId}:${signature}`
    });

    await logEntry.save();
    return logEntry;
  }

  /**
   * Verify integrity of the entire export log hash chain.
   * Returns verification result breakdown.
   */
  async verifyExportHashChain() {
    const logs = await ExportLog.find().sort({ timestamp: 1 });
    let expectedPrevious = 'GENESIS_HASH_00000000000000000000000000000000';
    let isChainIntact = true;
    const report = [];

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const prevCheck = log.previousHash === expectedPrevious;

      const rawPayload = `${log.previousHash}|${log.exportedBy}|${log.adminBadgeId}|${log.caseId || 'CASE-GENERAL'}|${log.evidenceIds.sort().join(',')}|${new Date(log.timestamp).toISOString()}|${log.success}`;
      const recomputedHash = crypto.createHash('sha256').update(rawPayload).digest('hex');
      const hashCheck = recomputedHash === log.hashChainEntry;

      const valid = prevCheck && hashCheck;
      if (!valid) isChainIntact = false;

      report.push({
        step: i + 1,
        logId: log._id,
        timestamp: log.timestamp,
        badgeId: log.adminBadgeId,
        previousHashMatches: prevCheck,
        hashEntryMatches: hashCheck,
        intact: valid
      });

      expectedPrevious = log.hashChainEntry;
    }

    return {
      isChainIntact,
      totalEntries: logs.length,
      report
    };
  }
}

module.exports = new HashChainService();
