/**
 * OEMAdapter - Abstract base class for multi-vendor DVR/NVR parser adapters.
 * 
 * NOTE: Detection is magic-byte/header based for prototype purposes; 
 * full proprietary codec decoding is out of scope for this build.
 */
class OEMAdapter {
  constructor(vendorName) {
    this.vendorName = vendorName;
  }

  /**
   * Detect if the given file buffer or header matches this vendor.
   * @param {Buffer} buffer 
   * @returns {boolean}
   */
  detectVendor(buffer) {
    throw new Error('detectVendor() must be implemented by concrete adapter');
  }

  /**
   * Parse metadata from vendor header stream.
   * @param {Buffer} buffer 
   * @param {string} filename 
   * @returns {Object}
   */
  parseMetadata(buffer, filename = '') {
    throw new Error('parseMetadata() must be implemented by concrete adapter');
  }

  /**
   * Extract video stream parameters or raw payload frames.
   * @param {Buffer} buffer 
   * @returns {Object}
   */
  extractVideo(buffer) {
    throw new Error('extractVideo() must be implemented by concrete adapter');
  }

  /**
   * Normalize vendor output to internal common format.
   * @param {Buffer} buffer 
   * @param {string} filename 
   * @returns {Object} Normalized output structure
   */
  normalizeOutput(buffer, filename = '') {
    const isVendor = this.detectVendor(buffer);
    const meta = this.parseMetadata(buffer, filename);
    const video = this.extractVideo(buffer);

    return {
      vendor: this.vendorName,
      detected: isVendor,
      codec: meta.codec || 'H.264',
      resolution: meta.resolution || '1920x1080',
      fps: meta.fps || 25,
      startTimestamp: meta.startTimestamp || new Date().toISOString(),
      endTimestamp: meta.endTimestamp || new Date().toISOString(),
      streamType: meta.streamType || 'MainStream',
      magicHeader: meta.magicHeader || 'UNKNOWN',
      totalFrames: video.frameCount || 0,
      corrupted: meta.corrupted || false,
      rawHeader: meta.rawHeaderHex || ''
    };
  }
}

module.exports = OEMAdapter;
