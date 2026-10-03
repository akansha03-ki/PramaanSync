const ParserTestSuite = require('./oem/ParserTestSuite');

console.log('=====================================================');
console.log(' PramaanSync OEM Adapter CI Parser Test Suite Runner');
console.log('=====================================================');

const summary = ParserTestSuite.runSuite();

console.log(JSON.stringify(summary, null, 2));

if (summary.failed > 0) {
  console.error('[TEST FAILED] One or more OEM parser fixtures failed validation.');
  process.exit(1);
} else {
  console.log('[TEST SUCCESS] All OEM adapter synthetic test fixtures passed!');
  process.exit(0);
}
