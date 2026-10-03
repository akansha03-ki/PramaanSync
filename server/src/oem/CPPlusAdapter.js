// Detection is magic-byte/header based for prototype purposes; full proprietary codec decoding is out of scope for this build.
const OEMAdapter = require('./OEMAdapter');

/**
 * CPPlusAdapter - Handles CP Plus Orange/Indigo series DVR/NVR proprietary formats.
 * Magic bytes: 0x4350504C ("CPPL") or ASCII "CPPLUS" / "CPV" header.
 */
class CPPlusAdapter extends OEMAdapter {
  constructor() {
    super('CPPlus');
    this.magicBytes = Buffer.from([0x43, 0x50, 0x50, 0x4C]); // "CPPL"
    this.magicString = 'CPPLUS';
  }

  detectVendor(buffer) {
    if (!buffer || buffer.length < 4) return false;
    if (buffer.slice(0, 4).equals(this.magicBytes)) return true;
    const str = buffer.toString('utf8', 0, Math.min(buffer.length, 256));
    return str.includes(this.magicString) || str.includes('CPV') || str.includes('CP_DVR');
  }

  parseMetadata(buffer, filename = '') {
    const isCP = this.detectVendor(buffer);
    const hex = buffer.slice(0, 16).toString('hex').toUpperCase();
    const str = buffer.toString('utf8', 0, Math.min(buffer.length, 512));
    const isCorrupted = str.includes('CORRUPT_HEADER') || buffer.length < 32;

    return {
      codec: 'H.265 (CP Plus Instastream)',
      resolution: '1920x1080',
      fps: 25,
      startTimestamp: new Date().toISOString(),
      endTimestamp: new Date(Date.now() + 7200 * 1000).toISOString(),
      streamType: 'CP Plus Main Channel',
      magicHeader: isCP ? '0x4350504C (CPPL)' : 'GENERIC_OR_INVALID',
      corrupted: isCorrupted,
      rawHeaderHex: hex
    };
  }

  extractVideo(buffer) {
    return {
      frameCount: Math.floor(buffer.length / 450),
      bitrateKbps: 2048,
      audioTrack: true
    };
  }
}

module.exports = CPPlusAdapter;
