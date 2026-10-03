import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageMetadata = {
  '/dashboard': {
    breadcrumb: 'System Telemetry',
    title: 'Dashboard',
    description: 'Overview of evidence intake, verification rates, active cases, and recent custody activity.'
  },
  '/evidence': {
    breadcrumb: 'Repository',
    title: 'Evidence',
    description: 'Master record of all ingested video, audio, image, and document evidence with SHA-256 root hashes.'
  },
  '/timeline': {
    breadcrumb: 'Audit Log',
    title: 'Timeline',
    description: 'Chronological sequence of custody events logged for every evidence record from intake to court submission.'
  },
  '/recovery': {
    breadcrumb: 'Forensic Restoration',
    title: 'Recovery',
    description: 'Frame carving pipeline for restoring deleted, corrupted, or damaged surveillance footage.'
  },
  '/integrity': {
    breadcrumb: 'Checksum Verification',
    title: 'Integrity',
    description: 'On-demand SHA-256 hash recalculation to verify evidence files against their initial intake checksum.'
  },
  '/sync-view': {
    breadcrumb: 'Multi-Camera Review',
    title: 'Sync View',
    description: 'Synchronized playback grid aligning overlapping camera angles with clock drift correction.'
  },
  '/camera-map': {
    breadcrumb: 'Geospatial Registry',
    title: 'Camera Map',
    description: 'Interactive map displaying surveillance camera density and physical location metadata across case sites.'
  },
  '/remote-ingestion': {
    breadcrumb: 'Network Access',
    title: 'Remote Ingestion',
    description: 'Direct RTSP network ingestion connecting to multi-vendor NVR hardware across remote sites.'
  },
  '/drive-acquisition': {
    breadcrumb: 'Physical Ingestion',
    title: 'Drive Acquisition',
    description: 'Raw sector imaging and immediate hashing of write-blocked physical DVR hard drives.'
  },
  '/export-logs': {
    breadcrumb: 'Dossier Output',
    title: 'Forensic Report',
    description: 'Court-admissible dossier sections with chain of custody ledgers, recovery appendix, and cryptographic proofs.'
  },
  '/kms-keys': {
    breadcrumb: 'Cryptographic Keys',
    title: 'Key Management',
    description: 'Lifecycle tracking, rotation, and usage audit trails for log-signing cryptographic key pairs.'
  },
  '/settings': {
    breadcrumb: 'Preferences',
    title: 'Settings',
    description: 'Manage officer profile, station identity, security settings, notifications, and appearance.'
  }
};

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname.startsWith('/evidence/')
    ? '/evidence'
    : location.pathname.startsWith('/reports/')
      ? '/export-logs'
      : location.pathname;
  const meta = pageMetadata[currentPath] || {
    breadcrumb: 'Overview',
    title: 'PramaanSync',
    description: 'Multi-Vendor DVR/NVR Digital Forensics Platform'
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 flex items-center justify-between sticky top-0 z-20 font-sans transition-colors duration-200">
      {/* Left: Breadcrumb + Title + Subtitle */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono mb-0.5">
          {meta.breadcrumb}
        </p>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {meta.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {meta.description}
        </p>
      </div>

      {/* Right: Bell Icon + Circular Avatar User Chip */}
      <div className="flex items-center gap-4">
        {/* Bell notification */}
        <button 
          type="button"
          onClick={() => alert('No unread security alerts.')}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Chip */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-semibold text-xs uppercase">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="text-xs pr-1">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{user.name.split(' ')[0]}</span>
              <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
              <span className="text-slate-600 dark:text-slate-300">{user.role}</span>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
