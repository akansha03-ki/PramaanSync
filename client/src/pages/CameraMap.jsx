import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Layers, X } from 'lucide-react';
import API from '../services/api';

const cameraIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CameraMap = () => {
  const [locations, setLocations] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorFilter, setVendorFilter] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchMapData();
  }, [vendorFilter]);

  const fetchMapData = async () => {
    try {
      const [locRes, camRes] = await Promise.all([
        API.get('/locations'),
        API.get('/cameras', { params: { vendor: vendorFilter } })
      ]);
      setLocations(locRes.data);
      setCameras(camRes.data);
    } catch (err) {
      console.error('Failed to load map telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400">Loading geospatial camera map...</div>;
  }

  const defaultCenter = [28.6315, 77.2167];

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Title Bar with Serif Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">Camera Map</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interactive map displaying surveillance camera density and physical location metadata across case sites.</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded outline-none transition-colors"
          >
            <option value="">All Vendors</option>
            <option value="Hikvision">Hikvision</option>
            <option value="Dahua">Dahua</option>
            <option value="CPPlus">CP Plus</option>
          </select>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded font-medium border transition-colors cursor-pointer ${
              showHeatmap 
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            Heatmap: {showHeatmap ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Map Box */}
      <div className="relative h-[550px] w-full app-card p-0 overflow-hidden">
        <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showHeatmap && locations.map((loc) => (
            <Circle
              key={`heat-${loc._id}`}
              center={[loc.gpsLat, loc.gpsLng]}
              radius={1400}
              pathOptions={{ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.2, stroke: false }}
            />
          ))}

          {locations.map((loc) => (
            <Marker 
              key={loc._id} 
              position={[loc.gpsLat, loc.gpsLng]} 
              icon={cameraIcon}
              eventHandlers={{ click: () => setSelectedLocation(loc) }}
            >
              <Popup>
                <div className="font-sans text-xs space-y-1">
                  <p className="font-bold text-slate-900">{loc.name}</p>
                  <p className="text-slate-600">Case: {loc.caseId}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{loc.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Locality Side Drawer */}
        {selectedLocation && (
          <div className="absolute top-4 right-4 z-[1000] w-80 app-card space-y-3 font-sans text-xs shadow-lg max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-slate-100">LOCALITY DETAILS</span>
              <button onClick={() => setSelectedLocation(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedLocation.name}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{selectedLocation.address}</p>
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px] mt-1">Case: {selectedLocation.caseId}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Cameras ({selectedLocation.cameraIds?.length || 0})</span>
              {selectedLocation.cameraIds && selectedLocation.cameraIds.length > 0 ? (
                selectedLocation.cameraIds.map((cam) => (
                  <div key={cam._id || cam} className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded space-y-0.5">
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-100">{cam.uniqueCameraId || cam}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{cam.vendor} · IP: {cam.ipAddress || '192.168.1.10x'}</p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">No cameras registered for this locality.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraMap;
