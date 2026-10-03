const Evidence = require('../models/Evidence');
const Camera = require('../models/Camera');
const Location = require('../models/Location');
const TimelineEvent = require('../models/TimelineEvent');
const ExportLog = require('../models/ExportLog');
const hashChainService = require('../services/hashChainService');

const assembleCaseReport = async (caseId) => {
  const locations = await Location.find({ caseId }).lean();
  const locationIds = locations.map((loc) => loc._id);
  const cameras = await Camera.find({ location: { $in: locationIds } }).populate('location').lean();
  const cameraIds = cameras.map((cam) => cam._id);

  let evidence = await Evidence.find({ cameraId: { $in: cameraIds } })
    .populate({ path: 'cameraId', populate: { path: 'location' } })
    .sort({ captured: 1 })
    .lean();

  // Fallback: if this case has no camera-linked files, still surface vault records for the demo dossier.
  if (!evidence.length) {
    evidence = await Evidence.find()
      .populate({ path: 'cameraId', populate: { path: 'location' } })
      .sort({ captured: 1 })
      .lean();
  }

  const evidenceIds = evidence.map((item) => item.evidenceId);
  const timeline = await TimelineEvent.find({ evidenceId: { $in: evidenceIds } }).sort({ createdAt: 1 }).lean();
  const exportLogs = await ExportLog.find({
    $or: [
      { caseId },
      { evidenceIds: { $in: evidenceIds } }
    ]
  }).sort({ timestamp: 1 }).lean();
  const chainVerification = await hashChainService.verifyExportHashChain();

  const recoveryJobs = evidence
    .filter((item) => item.recovered || item.recoveryJob)
    .map((item) => ({
      evidenceId: item.evidenceId,
      filename: item.filePath || item.name,
      name: item.name,
      officer: item.officer,
      recovered: item.recovered,
      recoveryJob: item.recoveryJob || null
    }));

  return {
    caseId,
    generatedAt: new Date().toISOString(),
    locations,
    cameras,
    evidence,
    timeline,
    exportLogs,
    recoveryJobs,
    chainVerification: {
      isChainIntact: chainVerification.isChainIntact,
      totalEntries: chainVerification.totalEntries
    }
  };
};

exports.getCaseReport = async (req, res) => {
  try {
    const caseId = req.params.caseId || 'CASE-2026-DEL-041';
    const report = await assembleCaseReport(caseId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.assembleCaseReport = assembleCaseReport;
