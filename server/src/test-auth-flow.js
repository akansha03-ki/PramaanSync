const { connectDB, disconnectDB } = require('./config/db');
const { seedData } = require('./seed');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const runAuthVerification = async () => {
  console.log('=====================================================');
  console.log(' PramaanSync Auth & Auto-Seed End-to-End Test');
  console.log('=====================================================');

  // Step 1: Connect to DB (MongoMemoryServer)
  await connectDB();

  // Step 2: Auto-seed
  console.log('[Test] Triggering seedData(false)...');
  await seedData(false);

  // Step 3: Verify User Count
  const count = await User.countDocuments();
  console.log(`[Test] Total User records in database: ${count}`);

  if (count === 0) {
    throw new Error('[TEST FAILED] Database is empty after auto-seeding!');
  }

  // Step 4: Verify authentication for all 4 demo users
  const demoAccounts = [
    'admin@pramaan.gov.in',
    'inspector@pramaan.gov.in',
    'investigator@pramaan.gov.in',
    'researcher@pramaan.gov.in'
  ];

  for (const email of demoAccounts) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      throw new Error(`[TEST FAILED] Demo user '${cleanEmail}' not found in DB!`);
    }

    const isMatch = await bcrypt.compare('DemoPass123!', user.password);
    if (!isMatch) {
      throw new Error(`[TEST FAILED] Password compare failed for demo user '${cleanEmail}'!`);
    }

    console.log(`[PASS] Authenticated '${user.email}' (${user.role}) - Badge: ${user.badgeId}`);
  }

  console.log('=====================================================');
  console.log(' ALL 4 DEMO ACCOUNTS AUTHENTICATED SUCCESSFULLY!');
  console.log('=====================================================');

  await disconnectDB();
};

runAuthVerification().catch(err => {
  console.error('[TEST ERROR]', err);
  process.exit(1);
});
