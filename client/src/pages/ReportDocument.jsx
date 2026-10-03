import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import API from '../services/api';
import {
  DEFAULT_CASE_ID,
  REPORT_SECTIONS,
  buildSectionDocument,
  videoEvidence
} from '../utils/reportContent';
import { downloadSectionPdf } from '../utils/reportPdf';

const BlockView = ({ block }) => {
  if (block.type === 'heading') {
    return (
      <h2 className="font-serif text-xl font-medium text-slate-900 dark:text-slate-100 pt-6 first:pt-0 border-b border-slate-200 dark:border-slate-800 pb-2">
        {block.text}
      </h2>
    );
  }

  if (block.type === 'paragraph') {
    return (
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
        {block.text}
      </p>
    );
  }

  if (block.type === 'note') {
    return (
      <p className="text-xs italic text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded px-3 py-2">
        {block.text}
      </p>
    );
  }

  if (block.type === 'kv') {
    return (
      <dl className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-x-4 gap-y-2 text-sm">
        {block.rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold pt-0.5">
              {label}
            </dt>
            <dd className="text-slate-800 dark:text-slate-200 font-serif break-all">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    );
  }

  if (block.type === 'table') {
    return (
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              {block.headers.map((header) => (
                <th key={header} className="p-2.5 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="align-top">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-2.5 text-slate-700 dark:text-slate-300 font-mono break-all">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

const ReportDocument = () => {
  const { caseId, section } = useParams();
  const resolvedCase = caseId || DEFAULT_CASE_ID;
  const sectionMeta = REPORT_SECTIONS.find((item) => item.id === section);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get(`/reports/${resolvedCase}`);
        if (cancelled) return;
        setReport(res.data);
        const videos = videoEvidence(res.data);
        if (videos.length) setSelectedVideoId(videos[0].evidenceId);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Unable to load case report.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [resolvedCase]);

  const videos = useMemo(() => videoEvidence(report), [report]);
  const document = useMemo(() => {
    if (!report || !sectionMeta) return null;
    return buildSectionDocument(section, report, { videoId: selectedVideoId });
  }, [report, section, sectionMeta, selectedVideoId]);

  if (!sectionMeta) {
    return <Navigate to={`/reports/${resolvedCase}/executive-summary`} replace />;
  }

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500">Preparing forensic document...</div>;
  }

  if (error || !document) {
    return (
      <div className="p-8 space-y-3 text-xs">
        <p className="text-red-700 dark:text-red-400">{error || 'Document could not be assembled.'}</p>
        <Link to="/export-logs" className="text-amber-800 dark:text-amber-500 hover:underline">Back to Forensic Report</Link>
      </div>
    );
  }

  const handleDownload = () => {
    setPdfError('');
    try {
      downloadSectionPdf(section, report, { videoId: selectedVideoId });
    } catch (err) {
      setPdfError(err.message || 'PDF generation failed.');
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            to="/export-logs"
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Forensic Report
          </Link>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded text-xs font-medium inline-flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>

        {pdfError && (
          <p className="text-xs text-red-700 dark:text-red-400">{pdfError}</p>
        )}

        {section === 'video-analysis' && videos.length > 1 && (
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Video</span>
            <select
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-slate-800 dark:text-slate-200 outline-none"
            >
              {videos.map((video) => (
                <option key={video.evidenceId} value={video.evidenceId}>
                  {video.evidenceId} — {video.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm px-8 md:px-14 py-12 space-y-5 min-h-[80vh]">
          <header className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              {document.caseId} · Forensic document
            </p>
            <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">
              {document.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated {new Date(document.generatedAt).toLocaleString()}
            </p>
          </header>

          {document.blocks.map((block, index) => (
            <BlockView key={`${block.type}-${index}`} block={block} />
          ))}
        </article>
      </div>
    </div>
  );
};

export default ReportDocument;
