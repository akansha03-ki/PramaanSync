import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Video, 
  MapPin, 
  HardDrive, 
  Activity, 
  Cpu, 
  Clock, 
  Download,
  Terminal,
  ArrowUpRight
} from 'lucide-react';
import API from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testSuiteOutput, setTestSuiteOutput] = useState(null);
  const [runningTest, setRunningTest] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunParserTestSuite = async () => {
    setRunningTest(true);
    try {
      const res = await API.get('/oem/test-suite');
      setTestSuiteOutput(res.data);
    } catch (err) {
      console.error('Failed to run test suite:', err);
    } finally {
      setRunningTest(false);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400">Loading platform overview...</div>;
  }

  const { summary, vendorDistribution, recentActivity } = data || {};

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono">
            System Operational · {summary?.totalEvidence || 0} Records Monitored
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunParserTestSuite}
            disabled={runningTest}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{runningTest ? 'Running Suite...' : 'Run Parser Suite'}</span>
          </button>

          <Link
            to="/sync-view"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Open Sync View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Parser Test Suite Output */}
      {testSuiteOutput && (
        <div className="app-card space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              OEM Parser CI Test Results (Synthetic Fixtures)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              PASSED {testSuiteOutput.passed}/{testSuiteOutput.total} ({testSuiteOutput.successRate})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {testSuiteOutput.results.map((res, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <span>{res.fixtureId}</span>
                  <span className={res.status === 'PASSED' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>{res.status}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Vendor: {res.detectedVendor}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{res.magicHeader}</p>
              </div>
            ))}
          </div>

          <button onClick={() => setTestSuiteOutput(null)} className="text-[11px] text-slate-500 hover:underline">
            Dismiss Results
          </button>
        </div>
      )}

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="app-card space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Evidence</p>
          <p className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">{summary?.totalEvidence || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Intake records registered</p>
        </div>

        <div className="app-card space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Verified Integrity</p>
          <p className="text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{summary?.verifiedEvidence || 0}</p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Match
          </span>
        </div>

        <div className="app-card space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Flagged Anomalies</p>
          <p className="text-3xl font-bold font-mono text-amber-700 dark:text-amber-500">{summary?.flaggedEvidence || 0}</p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500">
            <AlertTriangle className="w-3.5 h-3.5" /> Timestamp Flags
          </span>
        </div>

        <div className="app-card space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Registered Cameras</p>
          <p className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">{summary?.totalCameras || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Across {summary?.totalLocations || 0} locations</p>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="app-card space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>OEM VENDOR BREAKDOWN</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution across multi-vendor DVR adapters.</p>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-800 dark:text-slate-200">Hikvision</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{vendorDistribution?.Hikvision || 0} feeds</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-slate-800 dark:bg-slate-200 h-full rounded-full" style={{ width: `${(vendorDistribution?.Hikvision / (summary?.totalCameras || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-800 dark:text-slate-200">Dahua</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{vendorDistribution?.Dahua || 0} feeds</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-slate-700 dark:bg-slate-400 h-full rounded-full" style={{ width: `${(vendorDistribution?.Dahua / (summary?.totalCameras || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-800 dark:text-slate-200">CP Plus</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{vendorDistribution?.CPPlus || 0} feeds</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-amber-600 dark:bg-amber-500 h-full rounded-full" style={{ width: `${(vendorDistribution?.CPPlus / (summary?.totalCameras || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 app-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>CHAIN OF CUSTODY ACTIVITY</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recent intake, hashing, and verification events.</p>
            </div>
            <Link to="/evidence" className="text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline">View Repository &rarr;</Link>
          </div>

          <div className="space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((act, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">{act.event}</span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">[{act.evidenceId}]</span>
                      <span className={`text-[10px] font-medium capitalize ${
                        act.state === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-500'
                      }`}>
                        · {act.state}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{act.description}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                    <p>{new Date(act.createdAt).toLocaleTimeString()}</p>
                    <p className="text-slate-400 dark:text-slate-500">{act.actor}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No activity logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
