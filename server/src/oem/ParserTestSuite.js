// Detection is magic-byte/header based for prototype purposes; full proprietary codec decoding is out of scope for this build.
const vendorDetector = require('./VendorDetector');

/**
 * ParserTestSuite - CI Test suite for validating OEM vendor adapters.
 * NOTE: The sample dumps below are synthetic test fixtures generated for test suite validation,
 * rather than real vendor recordings.
 */
class ParserTestSuite {
  static generateSyntheticFixtures() {
    return [
      // Hikvision valid fixture
      {
        id: 'FIX-HIK-01',
        vendor: 'Hikvision',
        buffer: Buffer.concat([
          Buffer.from([0x48, 0x49, 0x4B, 0x56]), // "HIKV" magic bytes
          Buffer.from('HIKVISION_NVR_STREAM_CH01_4K_VALID_HEAD')
        ]),
        expectedDetected: true,
        expectedCorrupted: false
      },
      // Hikvision corrupted fixture
      {
        id: 'FIX-HIK-CORRUPT-02',
        vendor: 'Hikvision',
        buffer: Buffer.concat([
          Buffer.from([0x48, 0x49, 0x4B, 0x56]),
          Buffer.from('CORRUPT_HEADER_TRUNCATED_STREAM')
        ]),
        expectedDetected: true,
        expectedCorrupted: true
      },
      // Dahua valid fixture
      {
        id: 'FIX-DH-01',
        vendor: 'Dahua',
        buffer: Buffer.concat([
          Buffer.from([0x44, 0x48, 0x41, 0x56]), // "DHAV" magic bytes
          Buffer.from('DAHUA_SMART_CODEC_STREAM_CH02_2K')
        ]),
        expectedDetected: true,
        expectedCorrupted: false
      },
      // Dahua corrupted fixture
      {
        id: 'FIX-DH-CORRUPT-02',
        vendor: 'Dahua',
        buffer: Buffer.concat([
          Buffer.from([0x44, 0x48, 0x41, 0x56]),
          Buffer.from('CORRUPT_HEADER_DAMAGED_INDEX')
        ]),
        expectedDetected: true,
        expectedCorrupted: true
      },
      // CP Plus valid fixture
      {
        id: 'FIX-CP-01',
        vendor: 'CPPlus',
        buffer: Buffer.concat([
          Buffer.from([0x43, 0x50, 0x50, 0x4C]), // "CPPL" magic bytes
          Buffer.from('CPPLUS_INSTASTREAM_CHANNEL_03')
        ]),
        expectedDetected: true,
        expectedCorrupted: false
      },
      // Unknown generic fixture
      {
        id: 'FIX-GEN-01',
        vendor: 'Generic/Unknown',
        buffer: Buffer.from('GENERIC_MP4_FILE_DATA_NO_VENDOR_HEADER_PRESENT'),
        expectedDetected: false,
        expectedCorrupted: false
      }
    ];
  }

  /**
   * Run the full suite of synthetic test fixtures.
   * @returns {Object} Test execution results summary
   */
  static runSuite() {
    const fixtures = this.generateSyntheticFixtures();
    const results = [];
    let passed = 0;
    let failed = 0;

    console.log('[ParserTestSuite] Running OEM Adapter CI Test Suite against synthetic test fixtures...');

    for (const fixture of fixtures) {
      const output = vendorDetector.analyze(fixture.buffer, `${fixture.id}.raw`);
      
      const vendorMatch = fixture.expectedDetected 
        ? output.vendor === fixture.vendor 
        : output.vendor === 'Generic/Unknown';
      const corruptMatch = output.corrupted === fixture.expectedCorrupted;

      const isPass = vendorMatch && corruptMatch;
      if (isPass) passed++; else failed++;

      results.push({
        fixtureId: fixture.id,
        expectedVendor: fixture.vendor,
        detectedVendor: output.vendor,
        expectedCorrupted: fixture.expectedCorrupted,
        detectedCorrupted: output.corrupted,
        status: isPass ? 'PASSED' : 'FAILED',
        magicHeader: output.magicHeader
      });
    }

    const summary = {
      timestamp: new Date().toISOString(),
      total: fixtures.length,
      passed,
      failed,
      successRate: `${((passed / fixtures.length) * 100).toFixed(1)}%`,
      results
    };

    console.log(`[ParserTestSuite] Completed. ${passed}/${fixtures.length} tests passed (${summary.successRate}).`);
    return summary;
  }
}

module.exports = ParserTestSuite;
