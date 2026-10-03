const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['video', 'audio', 'image', 'document', 'log'], 
    default: 'video' 
  },
  source: { type: String, required: true }, // e.g. "Hikvision NVR-04", "Drive Acquisition - SATA-01"
  captured: { type: Date, default: Date.now },
  officer: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['verified', 'pending', 'flagged'], 
    default: 'pending' 
  },
  hash: { type: String, required: true }, // SHA-256 hash of server-side file
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recovered: { type: Boolean, default: false },
  recoveryJob: {
    completedAt: Date,
    recoveredBy: String,
    framesCarved: Number,
    recoveredBlocks: Number,
    unallocatedSectorsRepaired: Number,
    sectorLogs: [String],
    notes: String
  },
  cameraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera' },
  metadata: {
    resolution: String,
    fps: Number,
    codec: String,
    vendor: String,
    magicHeader: String,
    driftSeconds: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evidence', evidenceSchema);
