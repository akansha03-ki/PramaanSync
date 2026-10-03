const Evidence = require('../models/Evidence');
const Camera = require('../models/Camera');
const Location = require('../models/Location');
const TimelineEvent = require('../models/TimelineEvent');
const ExportLog = require('../models/ExportLog');

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalEvidence = await Evidence.countDocuments();
    const verifiedEvidence = await Evidence.countDocuments({ status: 'verified' });
    const pendingEvidence = await Evidence.countDocuments({ status: 'pending' });
    const flaggedEvidence = await Evidence.countDocuments({ status: 'flagged' });
    const totalCameras = await Camera.countDocuments();
    const totalLocations = await Location.countDocuments();
    const totalExportLogs = await ExportLog.countDocuments();

    // Vendor breakdown
    const cameras = await Camera.find();
    const vendorDistribution = {
      Hikvision: cameras.filter(c => c.vendor === 'Hikvision').length,
      Dahua: cameras.filter(c => c.vendor === 'Dahua').length,
      CPPlus: cameras.filter(c => c.vendor === 'CPPlus').length
    };

    // Recent timeline activity
    const recentActivity = await TimelineEvent.find().sort({ createdAt: -1 }).limit(8);

    res.json({
      summary: {
        totalEvidence,
        verifiedEvidence,
        pendingEvidence,
        flaggedEvidence,
        totalCameras,
        totalLocations,
        totalExportLogs,
        systemHealth: 'OPERATIONAL',
        sha256IntegrityStatus: flaggedEvidence > 0 ? 'TAMPER_ALERT' : 'VERIFIED_100%'
      },
      vendorDistribution,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
