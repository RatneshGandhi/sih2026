import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/client';
import StatusBadge from './components/StatusBadge';

// Helper component to pan and zoom to selected feature
function MapController({ selectedFeature, allFeatures }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFeature && selectedFeature.geometry) {
      try {
        const geojsonLayer = L.geoJSON(selectedFeature);
        const bounds = geojsonLayer.getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { maxZoom: 16, padding: [50, 50], duration: 1.2 });
        }
      } catch (e) {
        console.error('Error centering on parcel:', e);
      }
    } else if (allFeatures && allFeatures.length > 0) {
      try {
        const geojsonLayer = L.geoJSON({ type: 'FeatureCollection', features: allFeatures });
        const bounds = geojsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [selectedFeature, allFeatures, map]);

  return null;
}

export default function MyLandMap() {
  const [geoData, setGeoData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const geoJsonRef = useRef(null);

  const fetchMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/citizen/map-data');
      setGeoData(res.data);
    } catch (err) {
      console.error('Failed to fetch citizen map data:', err);
      setError(err.response?.data?.error || 'Failed to load cadastral map boundaries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const getParcelStyle = (feature) => {
    const status = feature?.properties?.status;
    switch (status) {
      case 'notified':
        return { color: '#2563EB', weight: 2.5, fillColor: '#3B82F6', fillOpacity: 0.35 };
      case 'acquired':
        return { color: '#D97706', weight: 2.5, fillColor: '#F59E0B', fillOpacity: 0.35 };
      case 'possession_taken':
        return { color: '#059669', weight: 2.5, fillColor: '#10B981', fillOpacity: 0.4 };
      case 'disputed':
        return { color: '#DC2626', weight: 2.5, fillColor: '#EF4444', fillOpacity: 0.4 };
      default:
        return { color: '#475569', weight: 2, fillColor: '#94A3B8', fillOpacity: 0.3 };
    }
  };

  const onEachFeature = (feature, layer) => {
    const p = feature.properties;
    const statusText = p.status === 'notified' ? '🔵 Notified' :
      p.status === 'acquired' ? '🟡 Acquisition in Progress' :
      p.status === 'possession_taken' ? '🟢 Possession Taken' : '🔴 Disputed';

    layer.bindPopup(`
      <div style="font-family: Inter, sans-serif; font-size: 12px; padding: 4px; min-width: 180px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: bold; margin-bottom: 2px;">Survey Number</div>
        <div style="color: #001533; font-size: 15px; font-weight: 800; margin-bottom: 6px;">${p.survey_number}</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748B;">Area:</span>
          <span style="font-weight: 700; color: #0F172A; font-family: monospace;">${p.area_hectares} Ha</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748B;">Status:</span>
          <span style="font-weight: 700;">${statusText}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #64748B;">Village:</span>
          <span style="font-weight: 600; color: #0F172A;">${p.village || 'N/A'}</span>
        </div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #334155;">
          <b>Project:</b> ${p.project_name || 'N/A'}
        </div>
      </div>
    `);

    layer.on('click', () => {
      setSelectedFeature(feature);
    });
  };

  const features = geoData?.features || [];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-5 w-full">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-govSlate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">map</span>
              <h1 className="text-xl font-extrabold text-govSlate-900 font-sans tracking-tight">
                My Land Cadastre Map
              </h1>
            </div>
            <p className="text-xs text-govSlate-500 mt-1">
              Geospatial demarcation of only your statutory landholdings under active acquisition.
            </p>
          </div>

          {/* Map Legend */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs bg-surface-container-low px-3 py-2 rounded-xl border border-govSlate-200">
            <span className="flex items-center gap-1.5 font-medium text-govSlate-700">
              <span className="w-3 h-3 rounded-xs bg-blue-600"></span>
              Notified
            </span>
            <span className="flex items-center gap-1.5 font-medium text-govSlate-700">
              <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
              Acquisition in Progress
            </span>
            <span className="flex items-center gap-1.5 font-medium text-govSlate-700">
              <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
              Possession Taken
            </span>
            <span className="flex items-center gap-1.5 font-medium text-govSlate-700">
              <span className="w-3 h-3 rounded-xs bg-rose-600"></span>
              Disputed
            </span>
          </div>
        </div>

        {/* Workspace: Parcel Selector Sidebar + Full Leaflet Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[550px]">
          {/* Left Column: My Land Parcels List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="bg-white rounded-2xl border border-govSlate-200 p-4 shadow-xs flex items-center justify-between">
              <span className="text-xs font-bold text-govSlate-700 uppercase tracking-wider">
                Select Parcel to Inspect
              </span>
              <span className="text-xs font-mono font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">
                {features.length} Plots
              </span>
            </div>

            {loading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-2xl bg-white border border-govSlate-200 p-4 animate-pulse"></div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                {error}
              </div>
            )}

            {!loading && !error && features.length === 0 && (
              <div className="p-8 bg-white border border-govSlate-200 rounded-2xl text-center text-xs text-govSlate-500">
                No geographic boundaries available for your account.
              </div>
            )}

            {!loading && !error && features.map((feat) => {
              const p = feat.properties;
              const isSelected = selectedFeature?.id === feat.id;

              return (
                <div
                  key={feat.id}
                  onClick={() => setSelectedFeature(feat)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-govSlate-200 hover:border-govSlate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-govSlate-500 uppercase font-semibold">Survey No</span>
                      <h4 className="text-base font-extrabold text-govSlate-900 font-sans">{p.survey_number}</h4>
                    </div>
                    <StatusBadge status={p.status} type="parcel" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-govSlate-600 pt-2 border-t border-govSlate-100">
                    <span>Village: <b>{p.village || 'N/A'}</b></span>
                    <span className="font-mono font-bold text-govSlate-900">{p.area_hectares} Ha</span>
                  </div>

                  <div className="text-[11px] text-govSlate-500 truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">folder</span>
                    <span className="truncate">{p.project_name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Leaflet Canvas */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-govSlate-200 shadow-xs overflow-hidden flex flex-col min-h-[500px] relative">
            <MapContainer
              center={[19.8820, 72.7450]} // Palghar Maharashtra default
              zoom={13}
              scrollWheelZoom={true}
              className="w-full h-full min-h-[500px]"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {geoData && (
                <GeoJSON
                  key={JSON.stringify(geoData)}
                  ref={geoJsonRef}
                  data={geoData}
                  style={getParcelStyle}
                  onEachFeature={onEachFeature}
                />
              )}

              <MapController selectedFeature={selectedFeature} allFeatures={features} />
            </MapContainer>

            {/* Quick zoom to all control overlay */}
            <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md rounded-xl p-2 border border-govSlate-200 shadow-md flex items-center gap-2">
              <button
                onClick={() => setSelectedFeature(null)}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">fit_screen</span>
                Fit All Parcels
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
