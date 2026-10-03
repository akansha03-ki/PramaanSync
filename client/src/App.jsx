import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EvidenceList from './pages/EvidenceList';
import EvidenceDetail from './pages/EvidenceDetail';
import Timeline from './pages/Timeline';
import Recovery from './pages/Recovery';
import SyncView from './pages/SyncView';
import CameraMap from './pages/CameraMap';
import RemoteIngestion from './pages/RemoteIngestion';
import DriveAcquisition from './pages/DriveAcquisition';
import IntegrityVerify from './pages/IntegrityVerify';
import ExportLogs from './pages/ExportLogs';
import ReportDocument from './pages/ReportDocument';
import KeyManagement from './pages/KeyManagement';
import Settings from './pages/Settings';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans text-xs text-slate-500 dark:text-slate-400">
        Authenticating Credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/evidence" element={<EvidenceList />} />
            <Route path="/evidence/:id" element={<EvidenceDetail />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/recovery" element={<Recovery />} />
            <Route path="/sync-view" element={<SyncView />} />
            <Route path="/camera-map" element={<CameraMap />} />
            <Route path="/remote-ingestion" element={<RemoteIngestion />} />
            <Route path="/drive-acquisition" element={<DriveAcquisition />} />
            <Route path="/integrity" element={<IntegrityVerify />} />
            <Route path="/export-logs" element={<ExportLogs />} />
            <Route path="/reports/:caseId/:section" element={<ReportDocument />} />
            <Route path="/kms-keys" element={<KeyManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
