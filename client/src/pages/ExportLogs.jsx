import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Lock, CheckCircle2, FileText, FileCheck, Database, Award, Video } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CASE_ID, REPORT_SECTIONS } from '../utils/reportContent';
import { downloadFullReportPdf } from '../utils/reportPdf';

const sectionIcons = {
  'video-analysis': Video,
  'executive-summary': FileText,
  'evidence-register': Database,
  'recovery-appendix': FileCheck,
  'ledger-proof': Award
};

const ExportLogs = () => {
  const [logs, setLogs] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [caseReport, setCaseReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState('');

  // Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState([]);
  const [secondaryPassphrase, setSecondaryPassphrase] = useState('');
  const [caseId, setCaseId] = useState(DEFAULT_CASE_ID);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [exportError, setExportError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchLogsAndEvidence();
  }, []);

  const fetchLogsAndEvidence = async () => {
    try {
      const evRes = await API.get('/evidence');
      setEvidenceList(evRes.data);
      if (evRes.data.length > 0) {
        setSelectedEvidenceIds([evRes.data[0].evidenceId]);
      }

      try {
        const reportRes = await API.get(`/reports/${caseId}`);
        setCaseReport(reportRes.data);
        if (reportRes.data.exportLogs?.length) {
          setLogs(reportRes.data.exportLogs);
        }
      } catch (reportErr) {
        console.error('Failed to load case report:', reportErr);
      }

      try {
        const logsRes = await API.get('/export/logs');
        setLogs(logsRes.data.logs || []);
      } catch {
        /* keep report-filtered logs if export directory is unavailable */
      }
    } catch (err) {
      console.error('Failed to load export logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExport = async (e) => {
    e.preventDefault();
    setExporting(true);
    setExportError('');
    setExportResult(null);

    try {
      const res = await API.post('/export/generate', {
        secondaryPassphrase,
        evidenceIds: selectedEvidenceIds,
        caseId,
        encryptPackage: true
      });

      setExportResult(res.data);
      setSecondaryPassphrase('');
      fetchLogsAndEvidence();
    } catch (err) {
      setExportError(err.response?.data?.error || 'Export authorization failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadFullReport = async () => {
    setPdfError('');
    try {
      const res = await API.get(`/reports/${caseId}`);
      setCaseReport(res.data);
      downloadFullReportPdf(res.data);
    } catch (err) {
      if (caseReport) {
        try {
          downloadFullReportPdf(caseReport);
          return;
        } catch (pdfErr) {
          setPdfError(pdfErr.message || 'Unable to generate the full forensic PDF.');
          return;
        }
      }
      setPdfError(err.response?.data?.error || err.message || 'Unable to generate the full forensic PDF.');
    }
  };

  const toggleEvidenceSelect = (id) => {
    setSelectedEvidenceIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400">Loading document dossier...</div>;
  }

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono mb-1">
            {caseId} / CONNAUGHT PLACE TRAFFIC NODE / DOSSIER OUTPUT
          </p>
          <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">Forensic Report</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Official court-admissible dossier package containing chain of custody ledgers and cryptographic proofs.</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadFullReport}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Full Report (PDF)</span>
        </button>
      </div>

      {pdfError && (
        <p className="text-xs text-red-700 dark:text-red-400">{pdfError}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORT_SECTIONS.map((section) => {
          const Icon = sectionIcons[section.id] || FileText;
          return (
            <div key={section.id} className="app-card space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">REPORT SECTION</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{section.cardTitle}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {section.description}
              </p>
              <Link
                to={`/reports/${caseId}/${section.id}`}
                className="text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 hover:underline inline-block pt-1"
              >
                Review section →
              </Link>
            </div>
          );
        })}
      </div>

      {/* Summary Bar */}
      <div className="app-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Dossier ready for export</p>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-semibold">{caseId}</span>
            <span>·</span>
            <span>{evidenceList.length} Items Included</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>

        {user?.role === 'Admin' ? (
          <button
            onClick={() => setShowExportModal(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate PDF / Encrypted Bundle</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Admin role required for dossier export</span>
        )}
      </div>

      {/* Export Result Success Box */}
      {exportResult && (
        <div className="app-card space-y-3 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Secure Package Generated ({exportResult.exportFile})
            </span>
            <a href={exportResult.downloadUrl} download className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded text-xs">
              Download Package
            </a>
          </div>
          <p className="font-mono text-[11px] text-slate-700 dark:text-slate-400">Hash Chain Signature: {exportResult.exportLogChain?.hashChainEntry}</p>
        </div>
      )}

      {/* Hash-Chained Log Entries Directory */}
      <div className="app-card space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Export Audit Log Chain</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 font-sans">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">ADMIN BADGE ID</th>
                <th className="p-3">CASE ID</th>
                <th className="p-3 font-mono">HASH CHAIN ENTRY</th>
                <th className="p-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-mono font-semibold text-slate-900 dark:text-slate-100">{log.adminBadgeId}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{log.caseId || 'CASE-GENERAL'}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{log.hashChainEntry}</td>
                  <td className="p-3 text-right">
                    {log.success ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400">
                        Denied
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Secondary Passphrase Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="app-card w-full max-w-lg space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Admin Secondary Passphrase Gate</span>
              </h2>
            </div>

            {exportError && (
              <div className="p-3 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
                {exportError}
              </div>
            )}

            <form onSubmit={handleGenerateExport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">SECONDARY PASSPHRASE</label>
                <input
                  type="password"
                  required
                  placeholder="Enter secondary export passphrase..."
                  value={secondaryPassphrase}
                  onChange={(e) => setSecondaryPassphrase(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 p-2.5 rounded font-mono outline-none focus:border-slate-900 dark:focus:border-slate-400 text-sm transition-colors"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Default demo passphrase: <code className="font-mono text-amber-800 dark:text-amber-500 font-semibold">SecureForensicExport2026!</code></p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">SELECT EVIDENCE ITEMS</label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded space-y-1">
                  {evidenceList.map((ev) => (
                    <label key={ev._id} className="flex items-center gap-2 text-slate-800 dark:text-slate-200 p-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvidenceIds.includes(ev.evidenceId)}
                        onChange={() => toggleEvidenceSelect(ev.evidenceId)}
                        className="accent-amber-600"
                      />
                      <span className="font-mono">{ev.evidenceId}</span> — <span>{ev.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={exporting}
                  className="px-4 py-2 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors"
                >
                  {exporting ? 'Authorizing...' : 'Generate Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportLogs;
