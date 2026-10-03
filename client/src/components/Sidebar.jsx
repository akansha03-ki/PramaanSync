import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  Video, 
  MapPin, 
  Globe, 
  HardDrive, 
  Download, 
  Key, 
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Evidence', path: '/evidence', icon: FileText },
    { label: 'Timeline', path: '/timeline', icon: Clock },
    { label: 'Recovery', path: '/recovery', icon: RotateCcw },
    { label: 'Integrity', path: '/integrity', icon: ShieldCheck },
    { label: 'Sync View', path: '/sync-view', icon: Video },
    { label: 'Camera Map', path: '/camera-map', icon: MapPin },
    { label: 'Remote Ingestion', path: '/remote-ingestion', icon: Globe },
    { label: 'Drive Acquisition', path: '/drive-acquisition', icon: HardDrive },
    { label: 'Forensic Report', path: '/export-logs', icon: Download, adminOnly: true },
    { label: 'Key Management', path: '/kms-keys', icon: Key },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-xs">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">PramaanSync</span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 font-sans">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'Admin') return null;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors border-l-2 ${
                  isActive
                    ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-400 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 opacity-80" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Footer */}
      {user && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
