import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import 'leaflet/dist/leaflet.css';

// District center coordinates for quick pan & zoom
const DISTRICT_COORDS = {
  Maharashtra: [19.7515, 75.7139, 7],
  Pune: [18.5204, 73.8567, 10],
  Palghar: [19.6967, 72.7699, 10],
  'Mumbai Suburban': [19.1136, 72.8697, 11],
  Nashik: [20.0110, 73.7903, 10],
  Ratnagiri: [16.9902, 73.3120, 10],
  Nagpur: [21.1458, 79.0882, 10],
  Solapur: [17.6599, 75.9064, 10]
};

function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 10, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function StateGISMapPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeParcel, setActiveParcel] = useState(null);

  const [mapCenter, setMapCenter] = useState([19.7515, 75.7139]);
  const [mapZoom, setMapZoom] = useState(7);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/state/map-data');
      setGeoData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load state map data:', err);
      setError('Unable to load cadastral GIS layers from spatial database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    if (district === 'All') {
      setMapCenter([19.7515, 75.7139]);
      setMapZoom(7);
    } else if (DISTRICT_COORDS[district]) {
      const [lat, lng, zoom] = DISTRICT_COORDS[district];
      setMapCenter([lat, lng]);
      setMapZoom(zoom);
    }
  };

  const getFeatureStyle = (feature) => {
    const status = feature.properties?.status;
    switch (status) {
      case 'possession_taken':
        return { color: '#057A55', fillColor: '#0E9F6E', weight: 2, fillOpacity: 0.65 };
      case 'acquired':
        return { color: '#1D4ED8', fillColor: '#3B82F6', weight: 2, fillOpacity: 0.6 };
      case 'disputed':
        return { color: '#991B1B', fillColor: '#BA1A1A', weight: 2.5, fillOpacity: 0.75 };
      case 'notified':
      default:
        return { color: '#B45309', fillColor: '#F2A93B', weight: 2, fillOpacity: 0.55 };
    }
  };

  const filteredFeatures = (geoData?.features || []).filter(f => {
    const p = f.properties || {};
    if (selectedDistrict !== 'All' && p.district !== selectedDistrict) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const filteredGeoJson = {
    type: 'FeatureCollection',
    features: filteredFeatures
  };

  const districtsList = ['All', ...new Set((geoData?.features || []).map(f => f.properties?.district).filter(Boolean))];

  return (
    <div className="space-y-4 pb-12">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Spatial Cadastre
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'} GIS Node</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            State Land Acquisition Cadastral Map
          </h1>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* District selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold outline-none cursor-pointer"
            >
              {districtsList.map(d => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Districts' : `${d} District`}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">filter_list</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Parcel Statuses</option>
              <option value="possession_taken">Possession Taken</option>
              <option value="acquired">Acquired</option>
              <option value="notified">Notified</option>
              <option value="disputed">Disputed / Flagged</option>
            </select>
          </div>

          <button
            onClick={loadMapData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Refresh Cadastre"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Map & Detail Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Map Container */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative h-[620px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-medium">Rendering GeoJSON cadastral polygons...</span>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center p-6 text-center text-xs text-red-600">
              {error}
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <MapFlyTo center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <GeoJSON
                key={`${selectedDistrict}-${statusFilter}-${filteredFeatures.length}`}
                data={filteredGeoJson}
                style={getFeatureStyle}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => setActiveParcel(feature.properties)
                  });
                }}
              />
            </MapContainer>
          )}

          {/* Map Status Overlay Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-xs z-[1000] space-y-1.5 pointer-events-auto">
            <span className="font-bold text-slate-900 block text-[11px] mb-1">Cadastre Classification</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-600 rounded-xs"></span>
              <span className="text-slate-700 text-[11px]">Possession Taken</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
              <span className="text-slate-700 text-[11px]">Acquired</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-xs"></span>
              <span className="text-slate-700 text-[11px]">Section 11 Notified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-xs"></span>
              <span className="text-slate-700 text-[11px]">Litigation / Disputed</span>
            </div>
          </div>
        </div>

        {/* Right Info Drawer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between h-[620px] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Spatial Inspector</h3>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {filteredFeatures.length} Parcels
              </span>
            </div>

            {activeParcel ? (
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                    {activeParcel.district} District
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                    Survey #{activeParcel.survey_number}
                  </h4>
                  <p className="text-xs text-slate-500">{activeParcel.village_name || 'Village Cadastre'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Project:</span>
                    <span className="font-bold text-slate-800 text-right truncate max-w-[150px]">
                      {activeParcel.project_title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Code:</span>
                    <span className="font-mono font-semibold text-slate-800">{activeParcel.project_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Area:</span>
                    <span className="font-bold text-slate-900">{Number(activeParcel.area_hectares).toFixed(2)} Ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Landowner:</span>
                    <span className="font-medium text-slate-800">{activeParcel.owner_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assessed:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{Number(activeParcel.assessed_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold capitalize text-slate-900">{activeParcel.status?.replace('_', ' ')}</span>
                  </div>
                </div>

                {activeParcel.status === 'disputed' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                    <div className="flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[16px]">report</span>
                      <span>Disputed / Flagged Parcel</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Subject to valuation objection or legal stay. Intervention recommended.
                    </p>
                  </div>
                )}

                {activeParcel.project_id && (
                  <button
                    onClick={() => navigate(`/state/projects/${activeParcel.project_id}`)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Open Project Dossier</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
                <p className="text-xs font-medium text-slate-600">Click any parcel on map to inspect</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Shows legal ownership, compensation, and project association.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Projection: EPSG:4326</span>
            <span className="font-mono">WGS 84</span>
          </div>
        </div>
      </div>
    </div>
  );
}
