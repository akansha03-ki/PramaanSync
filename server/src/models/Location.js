const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gpsLat: { type: Number, required: true },
  gpsLng: { type: Number, required: true },
  address: { type: String, required: true },
  caseId: { type: String, required: true },
  cameraIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Camera' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
