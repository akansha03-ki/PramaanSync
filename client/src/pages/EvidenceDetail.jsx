import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Wrench, 
  Video, 
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import API from '../services/api';

const EvidenceDetail = () => {
  const { id } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    fetchEvidenceDetail();
  }, [id]);

  const fetchEvidenceDetail = async () => {
    try {
      const [evRes, tlRes] = await Promise.all([
        API.get(`/evidence/${id}`),
        API.get(`/evidence/${id}/timeline`)
      ]);
      setEvidence(evRes.data);
      setTimeline(tlRes.data);
    } catch (err) {
      console.error('Failed to load evidence detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await API.post(`/integrity/verify/${id}`);
      setVerifyResult(res.data);
      fetchEvidenceDetail();
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleRecoverFootage = async () => {
    setRecovering(true);
    try {
      await API.post(`/recovery/${id}`);
      fetchEvidenceDetail();
      alert('Frame recovery pipeline completed.');
    } catch (err) {
      console.error('Recovery error:', err);
    } finally {
      setRecovering(false);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 min-h-screen">Loading evidence detail...</div>;
  }

  if (!evidence) {
    return (
      <div className="p-8 font-sans space-y-4 text-xs bg-slate-50 dark:bg-slate-950 min-h-screen">
        <p className="text-red-700 dark:text-red-400">Evidence record '{id}' not found.</p>
        <Link to="/evidence" className="text-amber-800 dark:text-amber-500 hover:underline">&larr; Back to Evidence</Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Link to="/evidence" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Evidence Directory</span>
      </Link>

      {/* Top Title Bar with Serif Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">{evidence.name}</h1>
            {evidence.status === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5" /> Flagged
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
            ID: {evidence.evidenceId} · Officer: {evidence.officer}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyIntegrity}
            disabled={verifying}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>Re-Verify Checksum</span>
          </button>

          <button
            onClick={handleRecoverFootage}
            disabled={recovering}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Frame Recovery</span>
          </button>
        </div>
      </div>

      {verifyResult && (
        <div className={`p-4 rounded border text-xs space-y-1 ${
          verifyResult.isMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="font-bold flex items-center gap-1.5">
            {verifyResult.isMatch ? <ShieldCheck className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-red-700" />}
            {verifyResult.isMatch ? 'VERIFICATION MATCH: Hash intact 100%' : 'VERIFICATION FAILED: Checksum Mismatch!'}
          </span>
          <p className="font-mono text-[11px]">Re-computed: {verifyResult.computedHash}</p>
        </div>
      )}

      {/* Main Grid: Player + Metadata & Custody Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 app-card space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Media Preview</h2>
          <div className="relative aspect-video bg-slate-900 rounded overflow-hidden flex items-center justify-center text-white font-mono text-xs">
            <video controls src={`/uploads/${evidence.filePath}`} className="w-full h-full object-contain" />
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-center text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">RESOLUTION</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{evidence.metadata?.resolution || '1920x1080'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">FPS</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{evidence.metadata?.fps || 25}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">CODEC</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{evidence.metadata?.codec || 'H.264'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">RECOVERED</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{evidence.recovered ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="app-card space-y-3 font-mono text-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">Checksum Metadata</h2>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">SHA-256 HASH</span>
              <p className="text-slate-900 dark:text-slate-100 font-bold break-all bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-200 dark:border-slate-700 rounded">{evidence.hash}</p>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-sans">Captured: {new Date(evidence.captured).toLocaleString()}</p>
            <p className="text-slate-600 dark:text-slate-400 font-sans">Size: {(evidence.fileSize / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          <div className="app-card space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Chain of Custody</h2>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700 text-xs">
              {timeline.map((evt, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${
                    evt.state === 'success' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}></div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 capitalize">{evt.event}</p>
                  <p className="text-slate-600 dark:text-slate-400">{evt.description}</p>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{evt.actor} · {new Date(evt.createdAt).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;
