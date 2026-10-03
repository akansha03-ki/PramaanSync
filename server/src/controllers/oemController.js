const vendorDetector = require('../oem/VendorDetector');
const ParserTestSuite = require('../oem/ParserTestSuite');
const driveAcquisitionService = require('../services/driveAcquisitionService');

/**
 * Auto vendor/firmware detection endpoint
 */
exports.detectVendor = (req, res) => {
  try {
    const { sampleHex, headerString, filename } = req.body;
    let buffer;

    if (sampleHex) {
      buffer = Buffer.from(sampleHex, 'hex');
    } else if (headerString) {
      buffer = Buffer.from(headerString, 'utf8');
    } else {
      buffer = Buffer.from('GENERIC_FILE_DATA');
    }

    const result = vendorDetector.analyze(buffer, filename || 'sample.raw');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * CI Parser Test Suite Execution endpoint
 */
exports.runTestSuite = (req, res) => {
  try {
    const summary = ParserTestSuite.runSuite();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Forensic Drive Acquisition Scan endpoint (Feature 4)
 */
exports.getForensicDrives = (req, res) => {
  try {
    const drives = driveAcquisitionService.getAttachedForensicDrives();
    res.json(drives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.acquireDrive = async (req, res) => {
  try {
    const { driveId } = req.body;
    const badgeId = req.user ? (req.user.badgeId || req.user.name) : 'OFFICER-007';

    const result = await driveAcquisitionService.acquireDrive(driveId, badgeId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
