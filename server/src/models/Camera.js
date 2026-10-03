const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
  uniqueCameraId: { type: String, required: true, unique: true }, // Global ID e.g. CAM-DEL-HK-101
  vendor: { 
    type: String, 
    enum: ['Hikvision', 'Dahua', 'CPPlus'], 
    required: true 
  },
  model: { type: String, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  ipAddress: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'maintenance'], default: 'online' },
  firmwareVersion: { type: String, required: true },
  clockOffsetSeconds: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Camera', cameraSchema);
