const Camera = require('../models/Camera');
const Location = require('../models/Location');
const Evidence = require('../models/Evidence');

exports.getAllCameras = async (req, res) => {
  try {
    const { vendor, caseId, status } = req.query;
    let filter = {};

    if (vendor) filter.vendor = vendor;
    if (status) filter.status = status;

    let cameras = await Camera.find(filter).populate('location');

    if (caseId) {
      cameras = cameras.filter(cam => cam.location && cam.location.caseId === caseId);
    }

    res.json(cameras);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCameraById = async (req, res) => {
  try {
    const camera = await Camera.findOne({ uniqueCameraId: req.params.id }).populate('location');
    if (!camera) {
      return res.status(404).json({ error: 'Camera record not found.' });
    }

    const evidenceList = await Evidence.find({ cameraId: camera._id });
    res.json({ camera, evidenceList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.registerCamera = async (req, res) => {
  try {
    const { uniqueCameraId, vendor, model, locationId, ipAddress, status, firmwareVersion, clockOffsetSeconds } = req.body;

    if (!uniqueCameraId || !vendor || !model || !ipAddress) {
      return res.status(400).json({ error: 'uniqueCameraId, vendor, model, and ipAddress are required.' });
    }

    const existing = await Camera.findOne({ uniqueCameraId });
    if (existing) {
      return res.status(400).json({ error: `Camera with Unique Camera ID '${uniqueCameraId}' already exists.` });
    }

    const camera = new Camera({
      uniqueCameraId,
      vendor,
      model,
      location: locationId || null,
      ipAddress,
      status: status || 'online',
      firmwareVersion: firmwareVersion || 'v4.2.1-build2026',
      clockOffsetSeconds: clockOffsetSeconds || 0
    });

    await camera.save();

    if (locationId) {
      await Location.findByIdAndUpdate(locationId, { $addToSet: { cameraIds: camera._id } });
    }

    res.status(201).json({ message: 'Camera registered successfully in Camera Registry', camera });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Remote NVR stream ingestion endpoint (Feature 3)
 */
exports.ingestNvrStream = async (req, res) => {
  try {
    const { uniqueCameraId, streamUrl, durationMinutes } = req.body;

    const camera = await Camera.findOne({ uniqueCameraId }).populate('location');
    if (!camera) {
      return res.status(404).json({ error: `Unique Camera ID '${uniqueCameraId}' not found in registry.` });
    }

    // Ingestion simulation
    res.json({
      message: `Remote stream ingestion triggered for ${camera.vendor} (${uniqueCameraId})`,
      camera: {
        uniqueCameraId: camera.uniqueCameraId,
        ipAddress: camera.ipAddress,
        vendor: camera.vendor,
        location: camera.location?.name || 'Unassigned'
      },
      ingestionStatus: 'CONNECTING_RTSP',
      streamUrl: streamUrl || `rtsp://${camera.ipAddress}:554/Streaming/Channels/101`,
      bufferBytesAcquired: 15485760,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
