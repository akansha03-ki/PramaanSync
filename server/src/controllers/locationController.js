const Location = require('../models/Location');
const Camera = require('../models/Camera');
const Evidence = require('../models/Evidence');

exports.getAllLocations = async (req, res) => {
  try {
    const { caseId } = req.query;
    let query = {};
    if (caseId) query.caseId = caseId;

    const locations = await Location.find(query).populate('cameraIds');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate('cameraIds');
    if (!location) {
      return res.status(404).json({ error: 'Location not found.' });
    }

    const cameraIds = location.cameraIds.map(c => c._id);
    const evidenceList = await Evidence.find({ cameraId: { $in: cameraIds } });

    res.json({ location, evidenceList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name, gpsLat, gpsLng, address, caseId } = req.body;
    if (!name || !gpsLat || !gpsLng || !caseId) {
      return res.status(400).json({ error: 'Name, gpsLat, gpsLng, and caseId are required.' });
    }

    const location = new Location({
      name,
      gpsLat,
      gpsLng,
      address: address || name,
      caseId,
      cameraIds: []
    });

    await location.save();
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Sync View data endpoint (Feature 1)
 * Pulls all cameras registered at a location/case along with synchronized evidence timelines and drift corrections.
 */
exports.getSyncViewData = async (req, res) => {
  try {
    const { locationId, caseId } = req.query;
    let locationFilter = {};

    if (locationId) locationFilter._id = locationId;
    if (caseId) locationFilter.caseId = caseId;

    const locations = await Location.find(locationFilter).populate('cameraIds');
    if (!locations.length) {
      return res.status(404).json({ error: 'No matching location found for sync playback.' });
    }

    const location = locations[0];
    const cameraIds = location.cameraIds.map(c => c._id);
    const evidenceItems = await Evidence.find({ cameraId: { $in: cameraIds } }).populate('cameraId');

    // Build timeline sync grid payload
    const syncGrid = location.cameraIds.map(camera => {
      const footage = evidenceItems.filter(e => e.cameraId && e.cameraId._id.toString() === camera._id.toString());
      return {
        cameraId: camera._id,
        uniqueCameraId: camera.uniqueCameraId,
        vendor: camera.vendor,
        model: camera.model,
        ipAddress: camera.ipAddress,
        clockOffsetSeconds: camera.clockOffsetSeconds || 0,
        footageCount: footage.length,
        footage: footage.map(f => ({
          evidenceId: f.evidenceId,
          name: f.name,
          captured: f.captured,
          status: f.status,
          hash: f.hash,
          filePath: f.filePath,
          resolution: f.metadata?.resolution || '1920x1080',
          fps: f.metadata?.fps || 25,
          codec: f.metadata?.codec || 'H.264'
        }))
      };
    });

    res.json({
      location: {
        id: location._id,
        name: location.name,
        address: location.address,
        caseId: location.caseId,
        gpsLat: location.gpsLat,
        gpsLng: location.gpsLng
      },
      syncGrid,
      commonTimelineStart: new Date(Date.now() - 3600 * 1000).toISOString(),
      commonTimelineEnd: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
