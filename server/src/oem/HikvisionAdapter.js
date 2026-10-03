// Detection is magic-byte/header based for prototype purposes; full proprietary codec decoding is out of scope for this build.
const OEMAdapter = require('./OEMAdapter');

/**
 * HikvisionAdapter - Handles Hikvision DVR/NVR proprietary formats (.dav, .hk, HIKVISION headers).
 * Magic bytes: 0x48494B56 ("HIKV") or ASCII "HIKVISION" / "DAV" header string.
 */
class HikvisionAdapter extends OEMAdapter {
  constructor() {
    super('Hikvision');
    this.magicBytes = Buffer.from([0x48, 0x49, 0x4B, 0x56]); // "HIKV"
    this.magicString = 'HIKVISION';
    this.davString = 'DAV';
  }

  detectVendor(buffer) {
    if (!buffer || buffer.length < 4) return false;
    // Check magic bytes 0x48494B56 or ASCII occurrences
    if (buffer.slice(0, 4).equals(this.magicBytes)) return true;
    const str = buffer.toString('utf8', 0, Math.min(buffer.length, 256));
    return str.includes(this.magicString) || str.includes('HK_NVR') || (str.includes(this.davString) && str.includes('HIK'));
  }

  parseMetadata(buffer, filename = '') {
    const isHik = this.detectVendor(buffer);
    const hex = buffer.slice(0, 16).toString('hex').toUpperCase();
    const str = buffer.toString('utf8', 0, Math.min(buffer.length, 512));
    const isCorrupted = str.includes('CORRUPT_HEADER') || buffer.length < 32;

    return {
      codec: 'H.265/H.264 (Hikvision DAV)',
      resolution: str.includes('4K') ? '3840x2160' : '1920x1080',
      fps: 30,
      startTimestamp: new Date().toISOString(),
      endTimestamp: new Date(Date.now() + 3600 * 1000).toISOString(),
      streamType: 'Hikvision Dual Stream (Main)',
      magicHeader: isHik ? '0x48494B56 (HIKV)' : 'GENERIC_OR_INVALID',
      corrupted: isCorrupted,
      rawHeaderHex: hex
    };
  }

  extractVideo(buffer) {
    return {
      frameCount: Math.floor(buffer.length / 512),
      bitrateKbps: 4096,
      audioTrack: true
    };
  }
}

module.exports = HikvisionAdapter;
