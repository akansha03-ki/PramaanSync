import React, { useState } from 'react';
import { User, Shield, Bell, Moon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [station, setStation] = useState(user?.station || '');
  const [badgeId, setBadgeId] = useState(user?.badgeId || '');
  const [saved, setSaved] = useState(false);

  // Security Toggles
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  // Notifications Toggles
  const [notifyIngestion, setNotifyIngestion] = useState(true);
  const [notifyIntegrity, setNotifyIntegrity] = useState(true);
  const [notifyExports, setNotifyExports] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/me', { name, station, badgeId });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Title Bar with Serif Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage officer profile, station identity, security policies, and system preferences.</p>
        </div>

        {saved && (
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* 2x2 Card Grid Pattern */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Profile */}
        <div className="app-card space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>PROFILE</span>
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">OFFICER NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2.5 rounded outline-none focus:border-slate-900 dark:focus:border-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">BADGE ID</label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2.5 rounded outline-none focus:border-slate-900 dark:focus:border-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">STATION / HEADQUARTERS</label>
              <input
                type="text"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2.5 rounded outline-none focus:border-slate-900 dark:focus:border-slate-100"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium rounded text-xs transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Card 2: Security */}
        <div className="app-card space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>SECURITY</span>
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Multi-Factor Authentication</p>
                <p className="text-slate-500 dark:text-slate-400">Require OTP code for secondary admin validation.</p>
              </div>
              <div 
                onClick={() => setTwoFactor(!twoFactor)} 
                className={`toggle-switch ${twoFactor ? 'active' : ''}`}
              >
                <div className="toggle-switch-handle"></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Auto-Logout Timeout</p>
                <p className="text-slate-500 dark:text-slate-400">Terminate session after 15 minutes of inactivity.</p>
              </div>
              <div 
                onClick={() => setSessionTimeout(!sessionTimeout)} 
                className={`toggle-switch ${sessionTimeout ? 'active' : ''}`}
              >
                <div className="toggle-switch-handle"></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <a 
                href="#password" 
                onClick={(e) => { e.preventDefault(); alert('Please contact IT Administrator to reset access password.'); }}
                className="text-xs font-semibold text-amber-700 dark:text-amber-500 hover:underline"
              >
                Change password →
              </a>
            </div>
          </div>
        </div>

        {/* Card 3: Notifications */}
        <div className="app-card space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>NOTIFICATIONS</span>
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Stream Ingestion Alerts</p>
                <p className="text-slate-500 dark:text-slate-400">Notify when new camera stream is ingested.</p>
              </div>
              <div 
                onClick={() => setNotifyIngestion(!notifyIngestion)} 
                className={`toggle-switch ${notifyIngestion ? 'active' : ''}`}
              >
                <div className="toggle-switch-handle"></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Checksum Mismatch Alerts</p>
                <p className="text-slate-500 dark:text-slate-400">Immediate alert on SHA-256 integrity failures.</p>
              </div>
              <div 
                onClick={() => setNotifyIntegrity(!notifyIntegrity)} 
                className={`toggle-switch ${notifyIntegrity ? 'active' : ''}`}
              >
                <div className="toggle-switch-handle"></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Admin Export Logs</p>
                <p className="text-slate-500 dark:text-slate-400">Notify when an evidence package is generated.</p>
              </div>
              <div 
                onClick={() => setNotifyExports(!notifyExports)} 
                className={`toggle-switch ${notifyExports ? 'active' : ''}`}
              >
                <div className="toggle-switch-handle"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Appearance (REAL Theme Switcher) */}
        <div className="app-card space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>APPEARANCE</span>
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">Select application theme:</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-4 py-2.5 rounded text-xs font-medium border cursor-pointer transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Light Theme
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-4 py-2.5 rounded text-xs font-medium border cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Dark Theme
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Theme selection updates all pages immediately and persists across sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
