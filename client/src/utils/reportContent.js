export const DEFAULT_CASE_ID = 'CASE-2026-DEL-041';

export const REPORT_SECTIONS = [
  {
    id: 'video-analysis',
    title: 'Forensic Video Breakdown',
    cardTitle: 'Video Analysis',
    description: 'Structured breakdown of ingested video: summary, technical parameters, integrity, motion notes, and custody events.'
  },
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    cardTitle: 'Executive Summary',
    description: 'High-level case background, incident timeline overview, and primary intake findings verified by station inspectors.'
  },
  {
    id: 'evidence-register',
    title: 'Evidence Register',
    cardTitle: 'Evidence Register',
    description: 'Master table of all ingested video stream files, file sizes, officer badges, and individual root SHA-256 hashes.'
  },
  {
    id: 'recovery-appendix',
    title: 'Recovery Appendix',
    cardTitle: 'Recovery Appendix',
    description: 'Technical report detailing frame carving results, recovered block counts, and unallocated sector repair logs.'
  },
  {
    id: 'ledger-proof',
    title: 'Ledger Proof',
    cardTitle: 'Ledger Proof',
    description: 'Cryptographic audit chain log signed via KMS key pair confirming unbroken chain of custody.'
  }
];

export const formatBytes = (bytes) => {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

export const videoEvidence = (report) =>
  (report?.evidence || []).filter((item) => (item.type || 'video') === 'video');

const locationNames = (report) => {
  const names = (report?.locations || []).map((loc) => loc.name).filter(Boolean);
  if (names.length) return names;
  return ['Unspecified locality'];
};

const heading = (text) => ({ type: 'heading', text });
const paragraph = (text) => ({ type: 'paragraph', text });
const note = (text) => ({ type: 'note', text });
const table = (headers, rows) => ({ type: 'table', headers, rows });
const kv = (rows) => ({ type: 'kv', rows });

export const buildVideoAnalysisBlocks = (report, videoId) => {
  const videos = videoEvidence(report);
  const video = videos.find((item) => item.evidenceId === videoId) || videos[0];

  if (!video) {
    return [
      heading('Video Summary'),
      paragraph('No video evidence is registered against this case. Intake a video file before a forensic video breakdown can be issued.')
    ];
  }

  const events = (report.timeline || []).filter((event) => event.evidenceId === video.evidenceId);
  const meta = video.metadata || {};
  const integrityEvents = events.filter((event) => String(event.event).toLowerCase().includes('integrity'));
  const lastIntegrity = integrityEvents[integrityEvents.length - 1];

  return [
    heading('Video Summary'),
    paragraph(
      `${video.name} (${video.evidenceId}) was ingested from ${video.source || 'an unspecified source'} ` +
      `on ${formatDateTime(video.captured)}. The recording was received by officer ${video.officer || 'unrecorded'} ` +
      `and is presently marked ${video.status || 'pending'} in the evidence vault` +
      `${video.recovered ? ', following a completed frame-carving recovery job' : ''}.`
    ),
    paragraph(
      `The exhibit occupies ${formatBytes(video.fileSize)} on disk under filename ${video.filePath || video.name}. ` +
      `Root SHA-256 computed at intake is ${video.hash || 'not recorded'}.`
    ),
    heading('Technical Analysis'),
    kv([
      ['Vendor / codec', `${meta.vendor || 'Unknown'} / ${meta.codec || 'Unknown'}`],
      ['Resolution', meta.resolution || 'Not recorded'],
      ['Frame rate', meta.fps ? `${meta.fps} fps` : 'Not recorded'],
      ['Magic header', meta.magicHeader || 'Not recorded'],
      ['Clock drift', typeof meta.driftSeconds === 'number' ? `${meta.driftSeconds} seconds` : 'Not recorded'],
      ['Camera', video.cameraId?.uniqueCameraId || video.cameraId?.model || 'Not linked']
    ]),
    heading('Integrity Check'),
    paragraph(
      lastIntegrity
        ? `The most recent integrity event is “${lastIntegrity.event}” (${formatDateTime(lastIntegrity.createdAt)}), ` +
          `logged by ${lastIntegrity.actor}: ${lastIntegrity.description}`
        : `No dedicated integrity-verification event has been logged for this file. Vault status is currently ${video.status || 'pending'}, ` +
          `and the stored root hash remains ${video.hash || 'unavailable'}.`
    ),
    heading('Motion / Object Notes'),
    note('Sample output — detection pipeline not yet connected.'),
    paragraph(
      'Automated person, vehicle, and object detectors are not wired to this build. The lines below are illustrative only and must not be cited as detector findings.'
    ),
    paragraph('00:00:08 — sample: subject enters frame from the near sidewalk (not a live detection).'),
    paragraph('00:01:14 — sample: vehicle crosses the primary lane (not a live detection).'),
    paragraph('00:02:41 — sample: crowd density increases at the far edge of frame (not a live detection).'),
    heading('Chain of Custody'),
    events.length
      ? table(
        ['Time', 'Event', 'Actor', 'Record'],
        events.map((event) => [
          formatDateTime(event.createdAt),
          event.event,
          event.actor,
          event.description
        ])
      )
      : paragraph('No custody timeline events are recorded for this exhibit.')
  ];
};

export const buildExecutiveSummaryBlocks = (report) => {
  const evidence = report?.evidence || [];
  const locations = locationNames(report);
  const cameras = report?.cameras || [];
  const timeline = [...(report?.timeline || [])].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  const verified = evidence.filter((item) => item.status === 'verified').length;
  const flagged = evidence.filter((item) => item.status === 'flagged').length;
  const recovered = evidence.filter((item) => item.recovered).length;
  const firstCapture = evidence[0]?.captured;
  const lastCapture = evidence[evidence.length - 1]?.captured;
  const officers = [...new Set(evidence.map((item) => item.officer).filter(Boolean))];

  const overview = timeline.slice(0, 12).map((event) =>
    `On ${formatDateTime(event.createdAt)}, ${event.actor} recorded “${event.event}” for ${event.evidenceId}: ${event.description}`
  );

  return [
    heading('Case Background'),
    paragraph(
      `This report concerns case ${report.caseId}, covering ${locations.join('; ')}. ` +
      `${cameras.length} registered camera${cameras.length === 1 ? '' : 's'} sit on the locality map for this matter, ` +
      `and ${evidence.length} evidence object${evidence.length === 1 ? '' : 's'} currently sit in the vault.`
    ),
    paragraph(
      evidence.length
        ? `Intake spans ${formatDateTime(firstCapture)} through ${formatDateTime(lastCapture)}. ` +
          `Receiving officers on record: ${officers.join(', ') || 'not recorded'}.`
        : 'No evidence objects have been ingested for this case at the time of generation.'
    ),
    heading('Incident Timeline Overview'),
    ...(overview.length
      ? overview.map((line) => paragraph(line))
      : [paragraph('The custody timeline is empty for the exhibits associated with this case.')]),
    heading('Intake Findings'),
    paragraph(
      `Of ${evidence.length} ingested file${evidence.length === 1 ? '' : 's'}, ${verified} ` +
      `${verified === 1 ? 'is' : 'are'} verified, ${flagged} flagged, and ${recovered} recovered through the frame-carving pipeline. ` +
      `Each file carries a server-side SHA-256 root hash computed at intake; those hashes appear in the Evidence Register that follows this summary in the full dossier.`
    ),
    paragraph(
      flagged
        ? 'Flagged items require examiner attention before court disclosure. See Integrity Check entries in the video breakdown and the Recovery Appendix where carving was required.'
        : 'No files are presently flagged. Hash status at generation is consistent with a clean intake set, subject to the Ledger Proof chain check.'
    )
  ];
};

export const buildEvidenceRegisterBlocks = (report) => {
  const evidence = report?.evidence || [];
  return [
    heading('Master Register'),
    paragraph(
      `The following table is the master register of files ingested for ${report.caseId}. ` +
      'Filename, size, receiving officer badge, and SHA-256 root hash are taken from live Evidence records.'
    ),
    evidence.length
      ? table(
        ['Filename', 'Size', 'Officer badge', 'SHA-256'],
        evidence.map((item) => [
          item.filePath || item.name,
          formatBytes(item.fileSize),
          item.officer || '—',
          item.hash || '—'
        ])
      )
      : paragraph('No evidence records are present for this case.'),
    evidence.length
      ? table(
        ['Evidence ID', 'Display name', 'Source', 'Status', 'Captured'],
        evidence.map((item) => [
          item.evidenceId,
          item.name,
          item.source || '—',
          item.status || '—',
          formatDateTime(item.captured)
        ])
      )
      : null
  ].filter(Boolean);
};

export const buildRecoveryAppendixBlocks = (report) => {
  const jobs = report?.recoveryJobs || [];
  if (!jobs.length) {
    return [
      heading('Recovery Jobs'),
      paragraph(
        `No completed recovery jobs are recorded for ${report.caseId}. ` +
        'When the Recovery module finishes a frame-carving run, carved frame counts, restored blocks, and unallocated sector logs appear here.'
      )
    ];
  }

  const blocks = [
    heading('Recovery Jobs'),
    paragraph(
      `${jobs.length} recovery job${jobs.length === 1 ? '' : 's'} from the Recovery module ${jobs.length === 1 ? 'is' : 'are'} on file for this case. ` +
      'Counts and sector logs below are stored on the evidence record at the time carving completed.'
    )
  ];

  jobs.forEach((job) => {
    const details = job.recoveryJob || {};
    blocks.push(heading(`${job.filename || job.name} (${job.evidenceId})`));
    blocks.push(kv([
      ['Recovered by', details.recoveredBy || job.officer || '—'],
      ['Completed', formatDateTime(details.completedAt)],
      ['Frames carved', details.framesCarved ?? '—'],
      ['Recovered blocks', details.recoveredBlocks ?? '—'],
      ['Unallocated sectors repaired', details.unallocatedSectorsRepaired ?? '—']
    ]));
    if (details.notes) {
      blocks.push(paragraph(details.notes));
    }
    blocks.push(heading('Unallocated sector repair log'));
    const logs = details.sectorLogs || [];
    if (logs.length) {
      logs.forEach((line) => blocks.push(paragraph(line)));
    } else {
      blocks.push(paragraph('No sector repair log lines were stored for this job.'));
    }
  });

  return blocks;
};

export const buildLedgerProofBlocks = (report) => {
  const logs = report?.exportLogs || [];
  const chain = report?.chainVerification || {};
  const blocks = [
    heading('Hash-Chain Audit'),
    paragraph(
      `Ledger entries below are the cryptographic export audit chain for ${report.caseId}, ` +
      'the same source used by Export Logs, restricted to this case. ' +
      `Platform-wide chain verification at generation: ${chain.isChainIntact ? 'intact' : 'break detected'} ` +
      `(${chain.totalEntries || 0} total chain entries).`
    )
  ];

  if (!logs.length) {
    blocks.push(paragraph(
      'No export-ledger entries have been written for this case. An admin-gated export will append the next hash-chain record.'
    ));
    return blocks;
  }

  logs.forEach((log, index) => {
    blocks.push(heading(`Chain entry ${index + 1}`));
    blocks.push(kv([
      ['Timestamp', formatDateTime(log.timestamp)],
      ['Admin badge', log.adminBadgeId || '—'],
      ['Evidence IDs', (log.evidenceIds || []).join(', ') || '—'],
      ['Result', log.success ? 'Approved' : 'Denied'],
      ['Previous hash', log.previousHash || '—'],
      ['Hash-chain entry', log.hashChainEntry || '—'],
      ['KMS signature', log.signedSignature || '—']
    ]));
  });

  return blocks;
};

export const buildSectionDocument = (sectionId, report, options = {}) => {
  const meta = REPORT_SECTIONS.find((section) => section.id === sectionId) || REPORT_SECTIONS[0];
  const videoId = options.videoId;
  let blocks;

  switch (sectionId) {
    case 'video-analysis':
      blocks = buildVideoAnalysisBlocks(report, videoId);
      break;
    case 'evidence-register':
      blocks = buildEvidenceRegisterBlocks(report);
      break;
    case 'recovery-appendix':
      blocks = buildRecoveryAppendixBlocks(report);
      break;
    case 'ledger-proof':
      blocks = buildLedgerProofBlocks(report);
      break;
    case 'executive-summary':
    default:
      blocks = buildExecutiveSummaryBlocks(report);
      break;
  }

  return {
    id: meta.id,
    title: meta.title,
    generatedAt: report?.generatedAt || new Date().toISOString(),
    caseId: report?.caseId,
    blocks
  };
};

export const buildFullDossierDocuments = (report) => {
  const videos = videoEvidence(report);
  const documents = [];

  if (videos.length) {
    videos.forEach((video, index) => {
      const doc = buildSectionDocument('video-analysis', report, { videoId: video.evidenceId });
      documents.push({
        ...doc,
        title: videos.length > 1
          ? `${doc.title} (${index + 1} of ${videos.length}: ${video.evidenceId})`
          : doc.title
      });
    });
  } else {
    documents.push(buildSectionDocument('video-analysis', report));
  }

  ['executive-summary', 'evidence-register', 'recovery-appendix', 'ledger-proof'].forEach((id) => {
    documents.push(buildSectionDocument(id, report));
  });

  return documents;
};
