import React, { useEffect, useState } from 'react';
import { CheckCircle2, Wrench } from 'lucide-react';
import API from '../services/api';
import { formatDateTime } from '../utils/reportContent';

const Recovery = () => {
  const [activeStep, setActiveStep] = useState(2);
  const [runningJob, setRunningJob] = useState(false);
  const [history, setHistory] = useState([]);
  const [targetId, setTargetId] = useState('');
  const [evidenceList, setEvidenceList] = useState([]);

  const loadRecoveryData = async () => {
    try {
      const res = await API.get('/evidence');
      const items = res.data || [];
      setEvidenceList(items);
      setHistory(
        items
          .filter((item) => item.recovered || item.recoveryJob)
          .map((item) => ({
            filename: item.filePath || item.name,
            evidenceId: item.evidenceId,
            date: formatDateTime(item.recoveryJob?.completedAt || item.captured),
            recoveredBy: item.recoveryJob?.recoveredBy || item.officer,
            framesCarved: item.recoveryJob?.framesCarved,
            recoveredBlocks: item.recoveryJob?.recoveredBlocks
          }))
      );
      const unrecovered = items.find((item) => !item.recovered);
      setTargetId((prev) => prev || unrecovered?.evidenceId || items[0]?.evidenceId || '');
    } catch (err) {
      console.error('Failed to load recovery history:', err);
    }
  };

  useEffect(() => {
    loadRecoveryData();
  }, []);

  const handleStartRecovery = async () => {
    if (!targetId) return;
    setRunningJob(true);
    setActiveStep(0);
    setTimeout(() => setActiveStep(1), 1000);
    setTimeout(() => setActiveStep(2), 2000);
    try {
      await API.post(`/evidence/recovery/${targetId}`);
    } catch (err) {
      console.error('Recovery job failed:', err);
    }
    setTimeout(() => {
      setActiveStep(3);
      setRunningJob(false);
      loadRecoveryData();
    }, 3500);
  };

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">Recovery</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Frame carving pipeline for restoring deleted, corrupted, or damaged surveillance footage.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs rounded px-2 py-2"
          >
            {evidenceList.map((item) => (
              <option key={item.evidenceId} value={item.evidenceId}>
                {item.evidenceId} — {item.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleStartRecovery}
            disabled={runningJob || !targetId}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{runningJob ? 'Carving Streams...' : 'Run Frame Carving Job'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="app-card space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Job Progress</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated 4-stage frame carving pipeline.</p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
            <div className="relative space-y-0.5">
              <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${activeStep >= 0 ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">1. Locating Unallocated Sectors</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scanning raw drive image for unreferenced video stream headers.</p>
            </div>
            <div className="relative space-y-0.5">
              <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${activeStep >= 1 ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">2. Verifying Frame Markers</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Matching magic byte signatures (HIKV / DHAV / CPPL) against index table.</p>
            </div>
            <div className="relative space-y-0.5">
              <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${activeStep >= 2 ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">3. Restoring Corrupted Stream Blocks</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reconstructing dropped keyframes and inter-frame motion vectors.</p>
            </div>
            <div className="relative space-y-0.5">
              <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${activeStep >= 3 ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">4. Recovery Complete</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Carved stream verified and indexed into evidence repository.</p>
            </div>
          </div>
        </div>

        <div className="app-card space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recovery History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Jobs stored on evidence records — same source as the Recovery Appendix.</p>
          </div>

          <div className="space-y-3">
            {history.length === 0 && (
              <p className="text-xs text-slate-500">No completed recovery jobs on file yet.</p>
            )}
            {history.map((item) => (
              <div key={item.evidenceId} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span>{item.filename}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{item.date}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>{item.evidenceId}</span>
                  <span>Recovered by: {item.recoveredBy}</span>
                </div>
                {(item.framesCarved != null) && (
                  <p className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {item.framesCarved} frames carved · {item.recoveredBlocks} blocks restored
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recovery;
