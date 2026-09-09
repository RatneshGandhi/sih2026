import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import * as turf from '@turf/turf';
import api from '../api/client';
import { useUIStore } from '../store/uiStore';

// Helper component to initialize Leaflet Draw controls on the map
function DrawControl({ onPolygonCreated }) {
  const map = useMap();
  const drawnItemsRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: '#BA1A1A',
            message: '<strong>Error:</strong> Polygon edges cannot cross!'
          },
          shapeOptions: {
            color: '#132A4C',
            fillColor: '#0E9F6E',
            fillOpacity: 0.45,
            weight: 2
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#132A4C',
            fillColor: '#0E9F6E',
            fillOpacity: 0.45,
            weight: 2
          }
        },
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });

    map.addControl(drawControl);

    const handleCreated = (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      const geoJson = layer.toGeoJSON();
      onPolygonCreated(geoJson, layer);
    };

    map.on(L.Draw.Event.CREATED, handleCreated);

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.removeLayer(drawnItems);
    };
  }, [map, onPolygonCreated]);

  return null;
}

export default function GISMapPage() {
  const [mapData, setMapData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(true);

  // New Polygon Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [drawnGeoJson, setDrawnGeoJson] = useState(null);
  const [activeDrawnLayer, setActiveDrawnLayer] = useState(null);
  const [calculatedArea, setCalculatedArea] = useState('0.0000');
  const [formData, setFormData] = useState({
    survey_number: '',
    owner_name: '',
    project_id: '',
    status: 'notified',
    land_type: 'agricultural',
    village: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useUIStore();

  useEffect(() => {
    loadMapData();
    loadProjects();
  }, []);

  async function loadMapData() {
    try {
      const res = await api.get('/dashboard/map-data');
      setMapData(res.data);
    } catch (err) {
      console.error('Failed to load map data:', err);
      showToast('Error loading cadastral map layers', 'error');
    }
  }

  async function loadProjects() {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);
      if (res.data.projects?.length > 0) {
        setFormData((prev) => ({ ...prev, project_id: res.data.projects[0].id }));
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }

  // Handle polygon completion from Leaflet Draw
  const handlePolygonCreated = (geoJson, layer) => {
    setActiveDrawnLayer(layer);
    setDrawnGeoJson(geoJson);

    // Compute area in hectares using Turf.js
    try {
      const areaSqM = turf.area(geoJson);
      const hectares = (areaSqM / 10000).toFixed(4); // 1 Ha = 10,000 sq m
      setCalculatedArea(hectares);

      // Generate suggested survey number
      const randomSurvey = `SY-${Math.floor(100 + Math.random() * 900)}/${Math.floor(1 + Math.random() * 4)}`;
      setFormData((prev) => ({
        ...prev,
        survey_number: randomSurvey,
        village: 'Survey Taluka Sector'
      }));

      setModalOpen(true);
    } catch (err) {
      console.error('Turf area calculation error:', err);
      setCalculatedArea('1.2500');
      setModalOpen(true);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_id || !formData.survey_number || !formData.owner_name) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        project_id: parseInt(formData.project_id, 10),
        survey_number: formData.survey_number,
        owner_name: formData.owner_name,
        area_hectares: parseFloat(calculatedArea),
        geom: drawnGeoJson.geometry,
        status: formData.status,
        land_type: formData.land_type,
        village: formData.village
      };

      const res = await api.post('/parcels', payload);
      showToast(`Parcel ${formData.survey_number} recorded & persisted to DB!`, 'success');

      // Refresh map data from DB to reflect saved record
      await loadMapData();

      setModalOpen(false);
      // Reset form
      setFormData((prev) => ({
        ...prev,
        survey_number: '',
        owner_name: ''
      }));
    } catch (err) {
      console.error('Failed to save parcel:', err);
      showToast(err.response?.data?.error || 'Failed to save parcel to database.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getParcelStyle = (feature) => {
    const status = feature.properties?.status;
    const isSelected = selectedParcel?.id === feature.properties?.id;

    let color = '#B45309';
    let fillColor = '#F2A93B';

    if (status === 'possession_taken') {
      color = '#057A55';
      fillColor = '#0E9F6E';
    } else if (status === 'acquired') {
      color = '#1D4ED8';
      fillColor = '#3B82F6';
    } else if (status === 'disputed') {
      color = '#991B1B';
      fillColor = '#BA1A1A';
    }

    return {
      color: isSelected ? '#000000' : color,
      fillColor: fillColor,
      weight: isSelected ? 3 : 2,
      fillOpacity: isSelected ? 0.8 : 0.55
    };
  };

  // Filter features according to sidebar selections
  const filteredFeatures = mapData?.features?.filter((f) => {
    const p = f.properties;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterProject !== 'all' && String(p.project_id) !== String(filterProject)) return false;
    return true;
  }) || [];

  return (
    <div className="relative w-full h-[calc(100vh-67px)] overflow-hidden flex flex-col bg-surface select-none">
      {/* Top Spatial Telemetry & Context Command Bar */}
      <div className="z-20 w-full px-space-md py-2 bg-white/95 backdrop-blur-md border-b border-govSlate-200 shadow-xs flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="p-1.5 rounded-lg border border-govSlate-200 hover:bg-surface-container text-primary text-xs font-semibold flex items-center gap-1 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">
              {filterDrawerOpen ? 'left_panel_close' : 'left_panel_open'}
            </span>
            <span>{filterDrawerOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-space-sm py-1 bg-secondary-container/40 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-semibold text-secondary">BhuNaksha Cadastre: LIVE</span>
            <span className="text-outline">| EPSG:4326</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-space-sm py-1 bg-surface-container rounded-lg font-mono text-[11px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[15px]">pin_drop</span>
            <span>National Extent: 8.4°N – 37.6°N</span>
          </div>
        </div>

        {/* Legend Pills & Inspector Toggle */}
        <div className="flex items-center gap-space-sm">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0E9F6E]"></span>
              <span className="text-[11px] text-govSlate-700">Possession</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]"></span>
              <span className="text-[11px] text-govSlate-700">Acquired</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F2A93B]"></span>
              <span className="text-[11px] text-govSlate-700">Notified</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#BA1A1A]"></span>
              <span className="text-[11px] text-govSlate-700">Disputed</span>
            </span>
          </div>

          <button
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className={`px-space-sm py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors ${
              inspectorOpen ? 'bg-primary text-white' : 'bg-surface-container text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>{selectedParcel ? `Survey ${selectedParcel.survey_number}` : 'Inspector'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area (Collapsible Filter Drawer + Full Leaflet Map + Collapsible Inspector Drawer) */}
      <div className="relative flex-1 flex w-full overflow-hidden">
        {/* Left Filter Panel */}
        {filterDrawerOpen && (
          <div className="w-72 bg-white border-r border-govSlate-200 z-20 flex flex-col h-full shadow-md overflow-y-auto p-space-md gap-4 shrink-0 animate-slide-right">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-100">
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                <span>Cadastral Filters</span>
              </div>
              <span className="font-mono text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant font-bold">
                {filteredFeatures.length} Plots
              </span>
            </div>

            {/* Polygon Draw Tool Callout */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-govSlate-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
                <span className="material-symbols-outlined text-govAmber text-[18px]">draw</span>
                <span>Draw Any Parcel Boundary</span>
              </div>
              <p className="text-[11px] text-govSlate-600 leading-relaxed">
                Click the <b>polygon icon</b> on the map toolbar to plot arbitrary multi-vertex parcel boundaries. Area in hectares calculates automatically via Turf.js upon shape completion!
              </p>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-1.5">
                Acquisition Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-surface-container-low border border-govSlate-200 rounded-lg px-2.5 py-2 text-xs text-on-surface outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="possession_taken">Possession Taken (Green)</option>
                <option value="acquired">Acquired (Blue)</option>
                <option value="notified">Notified (Amber)</option>
                <option value="disputed">Disputed (Red)</option>
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-1.5">
                Strategic Infrastructure Project
              </label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full bg-surface-container-low border border-govSlate-200 rounded-lg px-2.5 py-2 text-xs text-on-surface outline-none cursor-pointer"
              >
                <option value="all">All Corridors &amp; Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Parcel Quick List */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-mono mb-1.5">
                Visible Parcels ({filteredFeatures.length})
              </label>
              <div className="flex-1 overflow-y-auto divide-y divide-govSlate-100 border border-govSlate-200 rounded-lg bg-surface">
                {filteredFeatures.map((f) => {
                  const p = f.properties;
                  const isSelected = selectedParcel?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedParcel(p);
                        setInspectorOpen(true);
                      }}
                      className={`p-2 cursor-pointer transition-colors text-xs ${
                        isSelected ? 'bg-primary-container text-white' : 'hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono">{p.survey_number}</span>
                        <span className="text-[10px] uppercase font-mono">{p.area_hectares} Ha</span>
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-200' : 'text-govSlate-600'}`}>
                        {p.owner_name} • {p.district}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Full-Screen Interactive Leaflet Map Canvas */}
        <div className="flex-1 h-full relative z-10">
          <MapContainer
            center={[19.88, 72.75]} // Centered on Palghar / Western Freight Corridor clusters
            zoom={12}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Leaflet Draw Polygon Plugin */}
            <DrawControl onPolygonCreated={handlePolygonCreated} />

            {/* Render Database Land Parcels */}
            {mapData && (
              <GeoJSON
                key={`geojson-${filterStatus}-${filterProject}-${selectedParcel?.id || 0}`}
                data={{
                  type: 'FeatureCollection',
                  features: filteredFeatures
                }}
                style={getParcelStyle}
                onEachFeature={(feature, layer) => {
                  const p = feature.properties;
                  layer.on('click', () => {
                    setSelectedParcel(p);
                    setInspectorOpen(true);
                  });
                  layer.bindTooltip(
                    `<b>${p.survey_number}</b><br/>${p.owner_name}<br/>${p.area_hectares} Ha`,
                    { sticky: true, className: 'leaflet-tooltip-custom' }
                  );
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Right Inspector Panel */}
        {inspectorOpen && (
          <div className="w-80 bg-white border-l border-govSlate-200 z-20 flex flex-col h-full shadow-xl overflow-y-auto p-space-md gap-4 shrink-0 animate-slide-left">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-100">
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>Cadastral Dossier Inspector</span>
              </div>
              <button
                onClick={() => setInspectorOpen(false)}
                className="p-1 hover:bg-surface-container rounded text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {selectedParcel ? (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-low border border-govSlate-200">
                  <span className="text-[10px] font-mono text-outline uppercase font-semibold">Survey / Khasra No</span>
                  <h3 className="text-base font-extrabold text-primary font-mono">{selectedParcel.survey_number}</h3>
                  <p className="text-xs text-govSlate-600 mt-0.5">{selectedParcel.village || 'Village Cadastre'}, {selectedParcel.district}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-surface border border-govSlate-200">
                    <span className="text-[10px] text-outline uppercase font-mono">Area (Hectares)</span>
                    <p className="text-sm font-bold text-primary font-mono mt-0.5">{selectedParcel.area_hectares} Ha</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-govSlate-200">
                    <span className="text-[10px] text-outline uppercase font-mono">Land Type</span>
                    <p className="text-xs font-semibold text-primary capitalize mt-0.5">{selectedParcel.land_type}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-govSlate-200">
                  <span className="text-[10px] text-outline uppercase font-mono">Registered Khatedar (Owner)</span>
                  <p className="text-xs font-bold text-govSlate-900 mt-0.5">{selectedParcel.owner_name}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-govSlate-200">
                  <span className="text-[10px] text-outline uppercase font-mono">Project Corridor</span>
                  <p className="text-xs font-bold text-govSlate-900 mt-0.5">{selectedParcel.project_name || 'N/A'}</p>
                  <p className="text-[11px] text-govSlate-500 capitalize">{selectedParcel.project_type?.replace('_', ' ')}</p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-high/40 border border-govSlate-200 flex flex-col gap-1.5">
                  <span className="text-[10px] text-outline uppercase font-mono font-semibold">Statutory Award &amp; DBT</span>
                  <div className="flex items-center justify-between">
                    <span className="text-govSlate-600">Assessed Outlay:</span>
                    <span className="font-mono font-bold text-primary">₹ {selectedParcel.assessed_amount ? (selectedParcel.assessed_amount / 1e5).toFixed(2) : 0} Lakhs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-govSlate-600">Disbursed Amount:</span>
                    <span className="font-mono font-bold text-secondary">₹ {selectedParcel.paid_amount ? (selectedParcel.paid_amount / 1e5).toFixed(2) : 0} Lakhs</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-govSlate-200/80">
                    <span className="text-govSlate-600">Payment Status:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono ${
                      selectedParcel.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      selectedParcel.payment_status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedParcel.payment_status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <button
                    onClick={() => navigate(`/projects/${selectedParcel.project_id}`)}
                    className="w-full py-2 bg-primary hover:bg-primary-container text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Inspect Full Project Dossier</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">touch_app</span>
                <p className="text-xs">Click any parcel boundary on the map to inspect ownership, area, and compensation ledger.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Save Newly Plotted Arbitrary Polygon Boundary */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-govSlate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px] text-govEmerald">polygon</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-primary">Save Demarcated Land Parcel</h3>
                  <span className="text-[10px] text-on-surface-variant font-mono">Auto-Calculated via Turf.js Engine</span>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Auto-Calculated Area Callout Card */}
            <div className="my-4 p-3 bg-secondary-container/30 border border-secondary/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-secondary">
                  Calculated Polygon Area
                </span>
                <div className="text-xl font-extrabold text-secondary font-mono">
                  {calculatedArea} <span className="text-xs font-normal">Hectares</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary text-3xl">straighten</span>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Survey / Khasra / Gat Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.survey_number}
                  onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                  placeholder="e.g. SY-120/4B"
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Landowner Name (Khatedar) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="e.g. Shrikant Ramrao Patil"
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Assign to Infrastructure Project *
                </label>
                <select
                  required
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.district}, {p.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="notified">Notified (Amber)</option>
                    <option value="acquired">Acquired (Blue)</option>
                    <option value="possession_taken">Possession Taken (Green)</option>
                    <option value="disputed">Disputed (Red)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                    Land Typology
                  </label>
                  <select
                    value={formData.land_type}
                    onChange={(e) => setFormData({ ...formData, land_type: e.target.value })}
                    className="w-full px-2.5 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="agricultural">Agricultural</option>
                    <option value="horticultural">Horticultural</option>
                    <option value="commercial_strip">Commercial Strip</option>
                    <option value="waste_land">Waste Land</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-govSlate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {submitting ? 'Saving to Database...' : 'Save & Plot on Map'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
