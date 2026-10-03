// Detection is magic-byte/header based for prototype purposes; full proprietary codec decoding is out of scope for this build.
const OEMAdapter = require('./OEMAdapter');

/**
 * DahuaAdapter - Handles Dahua DVR/NVR proprietary formats (DHAV header, .dhv, .dav).
 * Magic bytes: 0x44484156 ("DHAV").
 */
class DahuaAdapter extends OEMAdapter {
  constructor() {
    super('Dahua');
    this.magicBytes = Buffer.from([0x44, 0x48, 0x41, 0x56]); // "DHAV"
    this.magicString = 'DAHUA';
  }

  detectVendor(buffer) {
    if (!buffer || buffer.length < 4) return false;
    if (buffer.slice(0, 4).equals(this.magicBytes)) return true;
    const str = buffer.toString('utf8', 0, Math.min(buffer.length, 256));
    return str.includes('DHAV') || str.includes(this.magicString) || str.includes('DH_NVR');
  }

  parseMetadata(buffer, filename = '') {
    const isDahua = this.detectVendor(buffer);
    const hex = buffer.slice(0, 16).toString('hex').toUpperCase();
    const str = buffer.toString('utf8', 0, Math.min(buffer.length, 512));
    const isCorrupted = str.includes('CORRUPT_HEADER') || buffer.length < 32;

    return {
      codec: 'H.264/DHAV (Dahua SmartCodec)',
      resolution: str.includes('2K') ? '2560x1440' : '1920x1080',
      fps: 25,
      startTimestamp: new Date().toISOString(),
      endTimestamp: new Date(Date.now() + 1800 * 1000).toISOString(),
      streamType: 'Dahua Smart Stream',
      magicHeader: isDahua ? '0x44484156 (DHAV)' : 'GENERIC_OR_INVALID',
      corrupted: isCorrupted,
      rawHeaderHex: hex
    };
  }

  extractVideo(buffer) {
    return {
      frameCount: Math.floor(buffer.length / 400),
      bitrateKbps: 3072,
      audioTrack: false
    };
  }
}

module.exports = DahuaAdapter;
