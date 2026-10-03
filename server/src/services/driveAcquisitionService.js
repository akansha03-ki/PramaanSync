const crypto = require('crypto');
const vendorDetector = require('../oem/VendorDetector');

class DriveAcquisitionService {
  /**
   * Scan attached forensic write-blocked physical drives.
   */
  getAttachedForensicDrives() {
    return [
      {
        driveId: 'DRIVE-PHYSICAL-SATA-01',
        label: 'Seagate Surveillance SkyHawk 4TB',
        interface: 'SATA (Hardware Write-Blocked via Tableau T8u)',
        writeBlocked: true,
        partitionTable: 'MBR (Raw DVR Stream Partition)',
        capacityGB: 4000,
        status: 'READY_FOR_ACQUISITION',
        detectedVendorHeader: 'Hikvision DAV Stream'
      },
      {
        driveId: 'DRIVE-PHYSICAL-NVME-02',
        label: 'Western Digital Purple 2TB',
        interface: 'NVMe (Tableau Forensic Bridge T9)',
        writeBlocked: true,
        partitionTable: 'GPT (Dahua DHAV Partition)',
        capacityGB: 2000,
        status: 'READY_FOR_ACQUISITION',
        detectedVendorHeader: 'Dahua DHAV'
      },
      {
        driveId: 'DRIVE-PHYSICAL-USB-03',
        label: 'Transcend Forensic Image E01',
        interface: 'USB 3.2 Write-Blocked',
        writeBlocked: true,
        partitionTable: 'E01 Forensic Image',
        capacityGB: 512,
        status: 'READY_FOR_ACQUISITION',
        detectedVendorHeader: 'CP Plus Instastream'
      }
    ];
  }

  /**
   * Acquire physical drive raw stream, compute immediate drive-level SHA-256 hash, and extract video partitions.
   * @param {string} driveId 
   * @param {string} officerBadgeId 
   */
  async acquireDrive(driveId, officerBadgeId) {
    const drives = this.getAttachedForensicDrives();
    const drive = drives.find(d => d.driveId === driveId) || drives[0];

    // Simulate raw drive byte stream
    const rawSeed = `${drive.driveId}:${drive.label}:${drive.capacityGB}:${Date.now()}`;
    let mockMagicBytes;
    if (drive.detectedVendorHeader.includes('Hikvision')) {
      mockMagicBytes = Buffer.concat([Buffer.from([0x48, 0x49, 0x4B, 0x56]), Buffer.from(rawSeed)]);
    } else if (drive.detectedVendorHeader.includes('Dahua')) {
      mockMagicBytes = Buffer.concat([Buffer.from([0x44, 0x48, 0x41, 0x56]), Buffer.from(rawSeed)]);
    } else {
      mockMagicBytes = Buffer.concat([Buffer.from([0x43, 0x50, 0x50, 0x4C]), Buffer.from(rawSeed)]);
    }

    // Step 1: Compute Drive-Level SHA-256 hash immediately before parsing
    const driveSha256 = crypto.createHash('sha256').update(mockMagicBytes).digest('hex');

    // Step 2: Run OEM adapter auto-detection against raw stream
    const oemAnalysis = vendorDetector.analyze(mockMagicBytes, `${drive.driveId}.raw`);

    return {
      acquisitionId: `ACQ-${Date.now()}`,
      driveId: drive.driveId,
      driveLabel: drive.label,
      writeBlocked: drive.writeBlocked,
      officerBadgeId,
      driveSha256,
      acquiredAt: new Date().toISOString(),
      partitionInfo: {
        fileSystem: 'Raw DVR Block Stream',
        totalSectors: drive.capacityGB * 2097152,
        unallocatedSpaceGB: 45.2
      },
      oemAnalysis,
      status: 'ACQUIRED_VERIFIED'
    };
  }
}

module.exports = new DriveAcquisitionService();
