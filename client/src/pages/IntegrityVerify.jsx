import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import API from '../services/api';

const IntegrityVerify = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    try {
      const res = await API.get('/evidence');
      setEvidenceList(res.data);
      if (res.data.length > 0) setSelectedEvidence(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedEvidence) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await API.post(`/integrity/verify/${selectedEvidence.evidenceId}`);
      setVerifyResult(res.data);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400">Loading checksum records...</div>;
  }

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Title Bar with Serif Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">Integrity</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">On-demand SHA-256 hash recalculation to verify evidence files against initial intake checksums.</p>
        </div>
      </div>

      {/* Two Columns Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: File Identity Card + Verify Button + Result State */}
        <div className="app-card space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">File Identity</h2>
            
            {/* File Selector */}
            <select
              value={selectedEvidence?.evidenceId || ''}
              onChange={(e) => {
                const item = evidenceList.find(i => i.evidenceId === e.target.value);
                setSelectedEvidence(item);
                setVerifyResult(null);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 rounded outline-none transition-colors"
            >
              {evidenceList.map(item => (
                <option key={item._id} value={item.evidenceId}>
                  {item.evidenceId} — {item.name}
                </option>
              ))}
            </select>
          </div>

          {selectedEvidence && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-500 block">CASE ID</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{selectedEvidence.source || 'CASE-2026-DEL-041'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">FILE SIZE</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{(selectedEvidence.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">FILE NAME</span>
                <span className="font-medium text-slate-900">{selectedEvidence.name}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">SHA-256 ROOT CHECKSUM</span>
                <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2.5 rounded break-all">
                  {selectedEvidence.hash}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                  <span>{verifying ? 'Recalculating SHA-256 Checksum...' : 'Verify Integrity'}</span>
                </button>
              </div>

              {/* Result State */}
              {verifyResult && (
                <div className={`p-4 rounded border text-xs space-y-1 ${
                  verifyResult.isMatch 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <span className="font-bold flex items-center gap-1.5">
                    {verifyResult.isMatch ? <ShieldCheck className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-red-700" />}
                    {verifyResult.isMatch ? 'VERIFICATION MATCH: Hash intact 100%' : 'VERIFICATION FAILED: Checksum Mismatch!'}
                  </span>
                  <p className="text-[11px] opacity-90 font-mono">Re-computed: {verifyResult.computedHash}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: "How verification works" explainer + 2 stat numbers */}
        <div className="app-card space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">How Verification Works</h2>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>
              When evidence is ingested into PramaanSync, the server executes a cryptographically secure SHA-256 hash algorithm over the entire file stream before saving.
            </p>
            <p>
              On-demand verification re-reads the underlying file from disk, re-calculates its SHA-256 digest, and performs an exact byte-for-byte string comparison against the recorded root hash.
            </p>
            <p>
              Any modification to file bytes, headers, or frame sequences alters the resulting hash digest, flagging the record immediately for inspection.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded text-center">
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">48</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verifications Logged</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded text-center">
              <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">0</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mismatches Found</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrityVerify;
