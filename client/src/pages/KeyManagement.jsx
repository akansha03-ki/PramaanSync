import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const KeyManagement = () => {
  const [keysData, setKeysData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await API.get('/kms/keys');
      setKeysData(res.data);
    } catch (err) {
      console.error('Failed to load KMS keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async () => {
    setRotating(true);
    try {
      await API.post('/kms/rotate');
      fetchKeys();
      alert('Log-signing key rotated successfully.');
    } catch (err) {
      console.error('Key rotation error:', err);
    } finally {
      setRotating(false);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400">Loading KMS key store...</div>;
  }

  const { keys, architectureNote } = keysData || {};

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Title Bar with Serif Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">Key Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lifecycle tracking, rotation, and usage audit trails for log-signing cryptographic key pairs.</p>
        </div>

        {user?.role === 'Admin' && (
          <button
            onClick={handleRotateKey}
            disabled={rotating}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rotating ? 'animate-spin' : ''}`} />
            <span>{rotating ? 'Rotating Key...' : 'Rotate Key'}</span>
          </button>
        )}
      </div>

      <div className="p-3.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-slate-900 dark:text-slate-100">Architecture Note:</span> {architectureNote || 'KMS-pattern implementation (HMAC/RSA-based, application-level)'}
      </div>

      <div className="app-card space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Log-Signing Key Directory</h2>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {keys?.map((key) => (
            <div key={key.keyId} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-slate-100">{key.keyId}</span>
                <span className={`text-[11px] font-semibold uppercase ${
                  key.status === 'active' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {key.status}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-sans text-xs">{key.algorithm} · {key.purpose}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">Public Pem: {key.publicKeyPem?.slice(30, 80)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyManagement;
