import React, { useState, useEffect } from 'react';
import { Globe, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import API from '../services/api';

const RemoteIngestion = () => {
  const [cameras, setCameras] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showRegModal, setShowRegModal] = useState(false);
  const [uniqueCameraId, setUniqueCameraId] = useState(`CAM-DEL-${Date.now().toString().slice(-4)}`);
  const [vendor, setVendor] = useState('Hikvision');
  const [model, setModel] = useState('DS-2CD2143G0-I 4MP');
  const [ipAddress, setIpAddress] = useState('192.168.1.150');
  const [locationId, setLocationId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [camRes, locRes] = await Promise.all([
        API.get('/cameras'),
        API.get('/locations')
      ]);
      setCameras(camRes.data);
      setLocations(locRes.data);
      if (locRes.data.length > 0) setLocationId(locRes.data[0]._id);
    } catch (err) {
      console.error('Failed to fetch camera registry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCamera = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/cameras', {
        uniqueCameraId,
        vendor,
        model,
        ipAddress,
        locationId,
        firmwareVersion: 'v5.6.80-build2601'
      });
      setShowRegModal(false);
      fetchData();
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerIngest = async (camId) => {
    try {
      const res = await API.post('/cameras/ingest', { uniqueCameraId: camId });
      setIngestStatus(res.data);
    } catch (err) {
      console.error('Ingestion trigger failed:', err);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400">Loading NVR network registry...</div>;
  }

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Title Bar with Serif Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">Remote Ingestion</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Direct RTSP network ingestion connecting to multi-vendor NVR hardware across remote sites.</p>
        </div>

        <button
          onClick={() => setShowRegModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Camera</span>
        </button>
      </div>

      {ingestStatus && (
        <div className="app-card space-y-2 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-xs">
          <p className="font-bold text-emerald-900 dark:text-emerald-400">RTSP Stream Connected: {ingestStatus.camera?.uniqueCameraId}</p>
          <p className="font-mono text-slate-700 dark:text-slate-300">{ingestStatus.streamUrl}</p>
          <p className="text-emerald-700 dark:text-emerald-400">Acquired {(ingestStatus.bufferBytesAcquired / 1024 / 1024).toFixed(2)} MB buffer.</p>
        </div>
      )}

      <div className="app-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">UNIQUE CAMERA ID</th>
                <th className="p-4">VENDOR &amp; MODEL</th>
                <th className="p-4">NVR IP</th>
                <th className="p-4">LOCATION</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cameras.map((cam) => (
                <tr key={cam._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-semibold text-slate-900 dark:text-slate-100">{cam.uniqueCameraId}</td>
                  <td className="p-4 font-sans">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{cam.vendor}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{cam.model}</p>
                  </td>
                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">{cam.ipAddress}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">{cam.location?.name || 'Unassigned'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Online
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleTriggerIngest(cam.uniqueCameraId)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs transition-colors cursor-pointer"
                    >
                      Ingest Stream
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-700">Register Camera ID</h2>
            <form onSubmit={handleRegisterCamera} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">UNIQUE CAMERA ID</label>
                <input
                  type="text"
                  required
                  value={uniqueCameraId}
                  onChange={(e) => setUniqueCameraId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 rounded font-mono text-slate-900 dark:text-slate-100 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">VENDOR</label>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 rounded text-slate-800 dark:text-slate-200 outline-none transition-colors"
                  >
                    <option value="Hikvision">Hikvision</option>
                    <option value="Dahua">Dahua</option>
                    <option value="CPPlus">CP Plus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">MODEL</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 rounded text-slate-900 dark:text-slate-100 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">NVR IP</label>
                <input
                  type="text"
                  required
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2 rounded text-slate-900 dark:text-slate-100 font-mono outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRegModal(false)} className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium transition-colors">Save Camera</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteIngestion;
