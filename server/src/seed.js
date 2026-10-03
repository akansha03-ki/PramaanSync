const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Location = require('./models/Location');
const Camera = require('./models/Camera');
const Evidence = require('./models/Evidence');
const TimelineEvent = require('./models/TimelineEvent');
const KeyMetadata = require('./models/KeyMetadata');
const kmsService = require('./services/kmsService');

/**
 * Seed data function.
 * @param {boolean} force - If true, clears existing data before seeding.
 */
const seedData = async (force = false) => {
  const existingUserCount = await User.countDocuments();
  if (!force && existingUserCount > 0) {
    console.log(`[Seed] Database already contains ${existingUserCount} user records. Skipping auto-seed.`);
    return;
  }

  if (existingUserCount === 0) {
    console.warn('[Database WARNING] No user records found! Running automatic demo database seed...');
  } else if (force) {
    console.log('[Seed] Force seeding requested. Clearing existing collections...');
    await User.deleteMany({});
    await Location.deleteMany({});
    await Camera.deleteMany({});
    await Evidence.deleteMany({});
    await TimelineEvent.deleteMany({});
    await KeyMetadata.deleteMany({});
  }

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  console.log('[Seed] Seeding Users...');
  const passwordHash = await bcrypt.hash('DemoPass123!', 10);
  
  const users = await User.insertMany([
    {
      name: 'Senior Admin Officer Vikram Singh',
      email: 'admin@pramaan.gov.in'.toLowerCase().trim(),
      password: passwordHash,
      role: 'Admin',
      badgeId: 'BADGE-ADM-001',
      station: 'Central Forensic Headquarters, Delhi'
    },
    {
      name: 'Inspector Meera Sharma',
      email: 'inspector@pramaan.gov.in'.toLowerCase().trim(),
      password: passwordHash,
      role: 'Inspector',
      badgeId: 'BADGE-INSP-402',
      station: 'Crime Branch Cyber Cell, South Division'
    },
    {
      name: 'Investigator Rajesh Kumar',
      email: 'investigator@pramaan.gov.in'.toLowerCase().trim(),
      password: passwordHash,
      role: 'Investigator',
      badgeId: 'BADGE-INV-889',
      station: 'Special Cell Tactical Unit'
    },
    {
      name: 'Research Specialist Dr. Ananya Sen',
      email: 'researcher@pramaan.gov.in'.toLowerCase().trim(),
      password: passwordHash,
      role: 'Researcher',
      badgeId: 'BADGE-RES-104',
      station: 'Forensic Science Laboratory (FSL)'
    }
  ]);

  const adminUser = users[0];
  const investigatorUser = users[2];

  console.log('[Seed] Seeding Locations...');
  const locations = await Location.insertMany([
    {
      name: 'Connaught Place Traffic Node - Sector 4',
      gpsLat: 28.6315,
      gpsLng: 77.2167,
      address: 'Outer Circle, Connaught Place, New Delhi',
      caseId: 'CASE-2026-DEL-041',
      cameraIds: []
    },
    {
      name: 'Nehru Place Commercial Hub - East Gate',
      gpsLat: 28.5494,
      gpsLng: 77.2519,
      address: 'Lala Lajpat Rai Road, Nehru Place, New Delhi',
      caseId: 'CASE-2026-DEL-041',
      cameraIds: []
    },
    {
      name: 'Gurugram Cyber City Junction Gate 3',
      gpsLat: 28.4950,
      gpsLng: 77.0890,
      address: 'DLF Cyber City, Phase 2, Gurugram',
      caseId: 'CASE-2026-GGR-092',
      cameraIds: []
    }
  ]);

  console.log('[Seed] Seeding Cameras...');
  const cameras = await Camera.insertMany([
    {
      uniqueCameraId: 'CAM-DEL-HK-101',
      vendor: 'Hikvision',
      model: 'DS-2CD2143G0-I 4MP Dome',
      location: locations[0]._id,
      ipAddress: '192.168.1.101',
      status: 'online',
      firmwareVersion: 'v5.6.80-build2601',
      clockOffsetSeconds: 0
    },
    {
      uniqueCameraId: 'CAM-DEL-DH-204',
      vendor: 'Dahua',
      model: 'IPC-HFW5442T-ASE 4MP Bullet',
      location: locations[0]._id,
      ipAddress: '192.168.1.102',
      status: 'online',
      firmwareVersion: 'v3.100.0000000.15.R',
      clockOffsetSeconds: +3
    },
    {
      uniqueCameraId: 'CAM-DEL-CP-309',
      vendor: 'CPPlus',
      model: 'CP-UNC-TE40L3 4MP IR Camera',
      location: locations[1]._id,
      ipAddress: '192.168.1.103',
      status: 'online',
      firmwareVersion: 'v2.800.0000.0',
      clockOffsetSeconds: -2
    },
    {
      uniqueCameraId: 'CAM-GGR-HK-501',
      vendor: 'Hikvision',
      model: 'DS-2CD2087G2-L 4K ColorVu',
      location: locations[2]._id,
      ipAddress: '10.0.4.15',
      status: 'online',
      firmwareVersion: 'v5.7.10-build2602',
      clockOffsetSeconds: 0
    }
  ]);

  // Link cameras to locations
  locations[0].cameraIds = [cameras[0]._id, cameras[1]._id];
  locations[1].cameraIds = [cameras[2]._id];
  locations[2].cameraIds = [cameras[3]._id];
  await Promise.all(locations.map(loc => loc.save()));

  console.log('[Seed] Creating physical sample files & SHA-256 evidence records...');
  
  const f1Path = path.join(uploadsDir, 'sample_hikvision_stream.mp4');
  const f1Content = Buffer.concat([
    Buffer.from([0x48, 0x49, 0x4B, 0x56]),
    Buffer.from('PramaanSync_Sample_Hikvision_4K_Traffic_Feed_Data_Content_2026')
  ]);
  fs.writeFileSync(f1Path, f1Content);
  const f1Hash = crypto.createHash('sha256').update(f1Content).digest('hex');

  const f2Path = path.join(uploadsDir, 'sample_dahua_stream.dav');
  const f2Content = Buffer.concat([
    Buffer.from([0x44, 0x48, 0x41, 0x56]),
    Buffer.from('PramaanSync_Sample_Dahua_DHAV_Entry_Camera_Feed_Content_2026')
  ]);
  fs.writeFileSync(f2Path, f2Content);
  const f2Hash = crypto.createHash('sha256').update(f2Content).digest('hex');

  const f3Path = path.join(uploadsDir, 'sample_cpplus_vault.dav');
  const f3Content = Buffer.concat([
    Buffer.from([0x43, 0x50, 0x50, 0x4C]),
    Buffer.from('PramaanSync_Sample_CPPlus_ATM_Vault_Footage_Anomalous_Gaps')
  ]);
  fs.writeFileSync(f3Path, f3Content);
  const f3Hash = crypto.createHash('sha256').update(f3Content).digest('hex');

  const evidenceRecords = await Evidence.insertMany([
    {
      evidenceId: 'EVD-2026-HK-001',
      name: 'Hikvision 4K Main Junction Traffic Stream',
      type: 'video',
      source: 'NVR Remote Ingestion - CAM-DEL-HK-101',
      captured: new Date(Date.now() - 3600 * 1000 * 2),
      officer: investigatorUser.badgeId,
      status: 'verified',
      hash: f1Hash,
      filePath: 'sample_hikvision_stream.mp4',
      fileSize: f1Content.length,
      userId: investigatorUser._id,
      recovered: false,
      cameraId: cameras[0]._id,
      metadata: {
        resolution: '3840x2160',
        fps: 30,
        codec: 'H.265 (Hikvision DAV)',
        vendor: 'Hikvision',
        magicHeader: '0x48494B56 (HIKV)',
        driftSeconds: 0
      }
    },
    {
      evidenceId: 'EVD-2026-DH-002',
      name: 'Dahua Commercial East Gate Entry Stream',
      type: 'video',
      source: 'NVR Remote Ingestion - CAM-DEL-DH-204',
      captured: new Date(Date.now() - 3600 * 1000 * 2),
      officer: investigatorUser.badgeId,
      status: 'verified',
      hash: f2Hash,
      filePath: 'sample_dahua_stream.dav',
      fileSize: f2Content.length,
      userId: investigatorUser._id,
      recovered: false,
      cameraId: cameras[1]._id,
      metadata: {
        resolution: '2560x1440',
        fps: 25,
        codec: 'H.264 (Dahua DHAV)',
        vendor: 'Dahua',
        magicHeader: '0x44484156 (DHAV)',
        driftSeconds: 3
      }
    },
    {
      evidenceId: 'EVD-2026-CP-003',
      name: 'CP Plus Vault Camera Feed (Flagged Timestamp Anomaly)',
      type: 'video',
      source: 'Drive Acquisition - SATA-01',
      captured: new Date(Date.now() - 3600 * 1000 * 5),
      officer: adminUser.badgeId,
      status: 'flagged',
      hash: f3Hash,
      filePath: 'sample_cpplus_vault.dav',
      fileSize: f3Content.length,
      userId: adminUser._id,
      recovered: true,
      cameraId: cameras[2]._id,
      metadata: {
        resolution: '1920x1080',
        fps: 25,
        codec: 'H.265 (CP Plus Instastream)',
        vendor: 'CPPlus',
        magicHeader: '0x4350504C (CPPL)',
        driftSeconds: -2
      },
      recoveryJob: {
        completedAt: new Date(Date.now() - 3600 * 1000 * 3),
        recoveredBy: adminUser.badgeId,
        framesCarved: 18,
        recoveredBlocks: 42,
        unallocatedSectorsRepaired: 7,
        sectorLogs: [
          'Unallocated scan complete on sample_cpplus_vault.dav: 7 sector ranges repaired.',
          'Frame carving recovered 18 GOP fragments from slack space around cluster 14.',
          'Block reconstruction assembled 42 valid media blocks; CPPL headers re-indexed.',
          'Vendor marker 0x4350504C (CPPL) re-validated after unallocated sector repair.'
        ],
        notes: 'Corrupted frames reconstructed via OEM Frame Carving Pipeline'
      }
    }
  ]);

  console.log('[Seed] Seeding TimelineEvents...');
  await TimelineEvent.insertMany([
    {
      evidenceId: evidenceRecords[0].evidenceId,
      event: 'captured',
      description: 'Footage captured from Hikvision CAM-DEL-HK-101',
      actor: investigatorUser.badgeId,
      state: 'success'
    },
    {
      evidenceId: evidenceRecords[0].evidenceId,
      event: 'uploaded',
      description: 'Ingested into PramaanSync Vault',
      actor: investigatorUser.badgeId,
      state: 'success'
    },
    {
      evidenceId: evidenceRecords[0].evidenceId,
      event: 'hash generated',
      description: `SHA-256 hash computed: ${f1Hash.slice(0, 16)}...`,
      actor: 'System Cryptography Module',
      state: 'success',
      hashSignature: f1Hash
    },
    {
      evidenceId: evidenceRecords[0].evidenceId,
      event: 'integrity verified',
      description: 'SHA-256 integrity check passed 100%',
      actor: 'System Integrity Engine',
      state: 'success'
    },
    {
      evidenceId: evidenceRecords[2].evidenceId,
      event: 'captured',
      description: 'Acquired from forensic write-blocked SATA drive',
      actor: adminUser.badgeId,
      state: 'warning'
    },
    {
      evidenceId: evidenceRecords[2].evidenceId,
      event: 'integrity verified',
      description: 'ALERT: Timestamp drift gap detected between frame 1400-1450',
      actor: 'Cross-Verification Engine',
      state: 'warning'
    },
    {
      evidenceId: evidenceRecords[2].evidenceId,
      event: 'footage recovered',
      description: 'Carved 18 frames and repaired 7 unallocated sector ranges (42 blocks restored).',
      actor: adminUser.badgeId,
      state: 'success'
    },
    {
      evidenceId: evidenceRecords[1].evidenceId,
      event: 'captured',
      description: 'Footage captured from Dahua CAM-DEL-DH-204',
      actor: investigatorUser.badgeId,
      state: 'success'
    },
    {
      evidenceId: evidenceRecords[1].evidenceId,
      event: 'uploaded',
      description: 'Ingested into PramaanSync Vault',
      actor: investigatorUser.badgeId,
      state: 'success'
    },
    {
      evidenceId: evidenceRecords[1].evidenceId,
      event: 'hash generated',
      description: `SHA-256 hash computed: ${f2Hash.slice(0, 16)}...`,
      actor: 'System Cryptography Module',
      state: 'success',
      hashSignature: f2Hash
    }
  ]);

  console.log('[Seed] Initializing KMS Log-Signing Key...');
  await kmsService.generateKey('log-signing', 'System Seed Script');

  console.log('[Seed] Seeding hash-chained export ledger for CASE-2026-DEL-041...');
  const hashChainService = require('./services/hashChainService');
  await hashChainService.appendExportLog({
    adminUserId: adminUser._id,
    adminBadgeId: adminUser.badgeId,
    evidenceIds: evidenceRecords.map((item) => item.evidenceId),
    caseId: 'CASE-2026-DEL-041',
    success: true
  });

  console.log('=====================================================');
  console.log(' Database Seeded Successfully!');
  console.log(' Demo Accounts Ready:');
  console.log('  1. Admin:        admin@pramaan.gov.in / DemoPass123!');
  console.log('  2. Inspector:    inspector@pramaan.gov.in / DemoPass123!');
  console.log('  3. Investigator: investigator@pramaan.gov.in / DemoPass123!');
  console.log('  4. Researcher:   researcher@pramaan.gov.in / DemoPass123!');
  console.log('=====================================================');
};

// If run directly from CLI
if (require.main === module) {
  const { connectDB, disconnectDB } = require('./config/db');
  (async () => {
    await connectDB();
    await seedData(true);
    await disconnectDB();
  })().catch(err => {
    console.error('Seed CLI error:', err);
    process.exit(1);
  });
}

module.exports = { seedData };
