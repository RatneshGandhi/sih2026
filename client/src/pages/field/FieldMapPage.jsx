import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/client';
import { useUIStore } from '../../store/uiStore';
import { STATUS_CONFIG } from './FieldOfficerDashboard';

// Custom Map Helper to fly/fit to bounds
function MapController({ features, selectedParcelId, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!features || features.length === 0) return;

    try {
      if (selectedParcelId) {
        const target = features.find((f) => f.properties.id === parseInt(selectedParcelId, 10));
        if (target && target.geometry) {
          const layer = L.geoJSON(target.geometry);
          map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 16 });
          return;
        }
      }

      // Default: fit all assigned parcels
      const allGeoJson = L.geoJSON({ type: 'FeatureCollection', features });
      map.fitBounds(allGeoJson.getBounds(), { padding: [40, 40], maxZoom: 15 });
    } catch (e) {
      console.warn('Map bounds fit error:', e);
    }
  }, [features, selectedParcelId, map]);

  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      map.flyTo([userLocation.lat, userLocation.lng], 16, { animate: true });
    }
  }, [userLocation, map]);

  return null;
}

// User current GPS marker icon (pulsing blue)
const userGpsIcon = new L.DivIcon({
  className: 'custom-gps-pin',
  html: `
    <div class="relative flex items-center justify-center">
      <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-md"></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function FieldMapPage() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [tileLayerType, setTileLayerType] = useState('voyager'); // 'voyager' | 'satellite' | 'osm'
  const [filterStatus, setFilterStatus] = useState('all');

  const [searchParams] = useSearchParams();
  const selectedParcelId = searchParams.get('parcel_id');
  const navigate = useNavigate();
  const { showToast } = useUIStore();

  useEffect(() => {
    async function loadMapData() {
      try {
        setLoading(true);
        const res = await api.get('/field/map-data');
        setGeoData(res.data);

        if (selectedParcelId && res.data.features) {
          const match = res.data.features.find((f) => f.properties.id === parseInt(selectedParcelId, 10));
          if (match) setSelectedParcel(match.properties);
        }
      } catch (err) {
        console.error('Failed to load field map features:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, [selectedParcelId]);

  // Color mapping based on statutory instructions:
  // GREEN = Verified
  // YELLOW = Pending
  // RED = Disputed / Flagged
  // BLUE = In Progress
  // GRAY = Submitted for Review
  const getParcelStyle = (feature) => {
    const status = feature.properties?.status;
    let color = '#F2A93B'; // yellow / pending
    let fillColor = '#FEF08A';

    switch (status) {
      case 'verified':
        color = '#057A55';
        fillColor = '#0E9F6E';
        break;
      case 'in_progress':
        color = '#1D4ED8';
        fillColor = '#3B82F6';
        break;
      case 'submitted_for_review':
        color = '#475569';
        fillColor = '#64748B';
        break;
      case 'disputed':
        color = '#991B1B';
        fillColor = '#BA1A1A';
        break;
      case 'pending':
      default:
        color = '#D97706';
        fillColor = '#F2A93B';
        break;
    }

    const isSelected = selectedParcel && selectedParcel.id === feature.properties.id;

    return {
      color: isSelected ? '#001533' : color,
      fillColor: fillColor,
      weight: isSelected ? 4 : 2,
      fillOpacity: isSelected ? 0.65 : 0.45,
      dashArray: status === 'pending' ? '4, 4' : null
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        setSelectedParcel(feature.properties);
      }
    });
  };

  // Find My Location Trigger
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported.', 'error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setLocating(false);
        showToast('Map centered to your real-time field position.', 'success');
      },
      (err) => {
        setLocating(false);
        showToast('Unable to lock current location: ' + err.message, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const tileUrls = {
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const filteredFeatures = (geoData?.features || []).filter((f) => {
    if (filterStatus === 'all') return true;
    return f.properties.status === filterStatus;
  });

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full h-[calc(100vh-80px)]">
      {/* Top Controls Strip */}
      <div className="bg-white rounded-xl p-3.5 border border-govSlate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[22px]">map</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-primary font-sans">
                Assigned Parcels Cadastre GIS
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {filteredFeatures.length} PARCELS MAPPED
              </span>
            </div>
            <p className="text-[11px] text-govSlate-500 font-sans">
              Interactive cadastral layer displaying only parcels assigned to your field jurisdiction
            </p>
          </div>
        </div>

        {/* Action Buttons & Layer Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-govSlate-200 text-govSlate-700 font-medium"
          >
            <option value="all">All Assigned Statuses</option>
            <option value="pending">Pending (Yellow)</option>
            <option value="in_progress">In Progress (Blue)</option>
            <option value="submitted_for_review">Submitted for Review (Gray)</option>
            <option value="verified">Verified (Green)</option>
            <option value="disputed">Disputed / Flagged (Red)</option>
          </select>

          {/* Tile Layer Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-govSlate-200 text-xs">
            <button
              onClick={() => setTileLayerType('voyager')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                tileLayerType === 'voyager' ? 'bg-white text-primary shadow-xs font-bold' : 'text-govSlate-600'
              }`}
            >
              Vector
            </button>
            <button
              onClick={() => setTileLayerType('satellite')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                tileLayerType === 'satellite' ? 'bg-white text-primary shadow-xs font-bold' : 'text-govSlate-600'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Locate Me */}
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all"
            title="Locate my position on map"
          >
            <span className={`material-symbols-outlined text-[16px] ${locating ? 'animate-spin' : ''}`}>
              my_location
            </span>
            <span>{locating ? 'Locating...' : 'My Location'}</span>
          </button>
        </div>
      </div>

      {/* Map Container and Floating Parcel Inspector */}
      <div className="flex-1 w-full relative rounded-xl border border-govSlate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-xs font-mono text-govSlate-500 font-medium">Loading Cadastral Layer...</span>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[19.8824, 72.7482]}
            zoom={14}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url={tileUrls[tileLayerType]}
            />

            {filteredFeatures.length > 0 && (
              <GeoJSON
                key={`${filterStatus}-${tileLayerType}`}
                data={{ type: 'FeatureCollection', features: filteredFeatures }}
                style={getParcelStyle}
                onEachFeature={onEachFeature}
              />
            )}

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userGpsIcon}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong>Your Field Location</strong><br />
                    Accuracy: ±{Math.round(userLocation.accuracy)}m
                  </div>
                </Popup>
              </Marker>
            )}

            <MapController
              features={filteredFeatures}
              selectedParcelId={selectedParcelId}
              userLocation={userLocation}
            />
          </MapContainer>
        )}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md rounded-xl p-3 border border-govSlate-200 shadow-md flex flex-col gap-1.5 text-xs font-sans">
          <span className="text-[10px] font-bold text-govSlate-500 uppercase tracking-wider">
            Verification Status
          </span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-700"></span>
            <span className="text-govSlate-700 font-medium">Verified (Green)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500 border border-blue-700"></span>
            <span className="text-govSlate-700 font-medium">In Progress (Blue)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500 border border-amber-700"></span>
            <span className="text-govSlate-700 font-medium">Pending (Yellow)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-500 border border-slate-700"></span>
            <span className="text-govSlate-700 font-medium">Submitted for Review (Gray)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-600 border border-red-800"></span>
            <span className="text-govSlate-700 font-medium">Disputed / Flagged (Red)</span>
          </div>
        </div>

        {/* Selected Parcel Inspector Drawer / Card */}
        {selectedParcel && (
          <div className="absolute top-4 right-4 z-[400] w-80 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-govSlate-200 shadow-lg flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-govSlate-400">PARCEL #{selectedParcel.id}</span>
                <h3 className="font-bold text-sm text-primary font-sans">{selectedParcel.survey_number}</h3>
                <p className="text-[11px] text-govSlate-500 line-clamp-1">{selectedParcel.project_name}</p>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-govSlate-400 hover:text-govSlate-600 font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2 rounded border border-govSlate-100">
                <span className="text-govSlate-400 block font-semibold">Area</span>
                <span className="font-mono font-bold text-primary">{selectedParcel.area_hectares} Ha</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-govSlate-100">
                <span className="text-govSlate-400 block font-semibold">Status</span>
                <span className="capitalize font-bold text-govSlate-800">{selectedParcel.status?.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="text-xs text-govSlate-600 flex flex-col gap-1">
              <div>Owner: <strong>{selectedParcel.owner_name}</strong></div>
              <div>Location: <strong>{selectedParcel.village}, {selectedParcel.district}</strong></div>
            </div>

            <button
              onClick={() => navigate(`/field/parcels/${selectedParcel.id}`)}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs"
            >
              <span>Open Verification Workstation</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
