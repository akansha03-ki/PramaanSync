import React, { useState, useEffect } from 'react';
import { HardDrive, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import API from '../services/api';

const DriveAcquisition = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acquiringDriveId, setAcquiringDriveId] = useState(null);
  const [acquisitionResult, setAcquisitionResult] = useState(null);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await API.get('/oem/drives');
      setDrives(res.data);
    } catch (err) {
      console.error('Failed to load forensic drives:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcquireDrive = async (driveId) => {
    setAcquiringDriveId(driveId);
    setAcquisitionResult(null);
    try {
      const res = await API.post('/oem/drives/acquire', { driveId });
      setAcquisitionResult(res.data);
    } catch (err) {
      console.error('Drive acquisition error:', err);
    } finally {
      setAcquiringDriveId(null);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400">Scanning write-blocked hardware interfaces...</div>;
  }

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Title Bar with Serif Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">Drive Acquisition</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Raw sector imaging and immediate hashing of write-blocked physical DVR hard drives.</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Write-Blocker Hardware Locked</span>
        </div>
      </div>

      {acquisitionResult && (
        <div className="app-card space-y-3 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-xs">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
            <span className="font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Physical Drive Imaged &amp; Hashed ({acquisitionResult.driveId})
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 text-[11px] block">IMMEDIATE RAW DRIVE SHA-256 CHECKSUM</span>
            <p className="font-mono text-slate-900 dark:text-slate-100 font-bold break-all">{acquisitionResult.driveSha256}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drives.map((drive) => (
          <div key={drive.driveId} className="app-card space-y-4 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-slate-900 dark:text-slate-100">{drive.driveId}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">Write-Blocked</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{drive.label}</p>
              <p className="text-slate-500 dark:text-slate-400">{drive.interface}</p>
              <p className="text-slate-600 dark:text-slate-400">Partition: {drive.partitionTable}</p>
            </div>

            <button
              onClick={() => handleAcquireDrive(drive.driveId)}
              disabled={acquiringDriveId === drive.driveId}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {acquiringDriveId === drive.driveId ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Hashing &amp; Imaging...</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Start Acquisition</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriveAcquisition;
