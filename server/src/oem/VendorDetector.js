// Detection is magic-byte/header based for prototype purposes; full proprietary codec decoding is out of scope for this build.
const HikvisionAdapter = require('./HikvisionAdapter');
const DahuaAdapter = require('./DahuaAdapter');
const CPPlusAdapter = require('./CPPlusAdapter');

/**
 * VendorDetector - Master registry & router for OEM DVR/NVR vendor identification.
 */
class VendorDetector {
  constructor() {
    this.adapters = [
      new HikvisionAdapter(),
      new DahuaAdapter(),
      new CPPlusAdapter()
    ];
  }

  /**
   * Register a new vendor adapter dynamically (extensible architecture requirement).
   * @param {OEMAdapter} adapter 
   */
  registerAdapter(adapter) {
    this.adapters.push(adapter);
  }

  /**
   * Auto-detect vendor from file header buffer or device response string.
   * @param {Buffer|string} fileOrBuffer 
   * @param {string} filename 
   * @returns {Object} Normalized vendor analysis
   */
  analyze(fileOrBuffer, filename = '') {
    let buffer = fileOrBuffer;
    if (typeof fileOrBuffer === 'string') {
      buffer = Buffer.from(fileOrBuffer, 'utf8');
    }

    if (!Buffer.isBuffer(buffer)) {
      buffer = Buffer.from(String(fileOrBuffer || ''));
    }

    // Try matching across all registered adapters
    for (const adapter of this.adapters) {
      if (adapter.detectVendor(buffer)) {
        return adapter.normalizeOutput(buffer, filename);
      }
    }

    // Fallback if no specific magic byte matched
    return {
      vendor: 'Generic/Unknown',
      detected: false,
      codec: 'H.264 Standard',
      resolution: '1920x1080',
      fps: 25,
      startTimestamp: new Date().toISOString(),
      endTimestamp: new Date().toISOString(),
      streamType: 'Standard MP4/RTSP',
      magicHeader: '0x00000000 (GENERIC)',
      totalFrames: Math.floor(buffer.length / 512),
      corrupted: false,
      rawHeaderHex: buffer.slice(0, 16).toString('hex').toUpperCase()
    };
  }
}

module.exports = new VendorDetector();
