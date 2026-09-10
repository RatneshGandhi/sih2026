import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { DISTRICT_INFO, DISTRICT_PARCELS, DISTRICT_PROJECTS } from '../../data/districtData';

const STATUS_CONFIG = {
  acquired: {
    color: '#057A55',
    fillColor: '#0E9F6E',
    label: 'Acquired',
    dot: 'bg-govEmerald'
  },
  under_process: {
    color: '#B45309',
    fillColor: '#F2A93B',
    label: 'Under Process',
    dot: 'bg-govAmber'
  },
  disputed: {
    color: '#991B1B',
    fillColor: '#BA1A1A',
    label: 'Disputed',
    dot: 'bg-error'
  },
  compensation_pending: {
    color: '#C2410C',
    fillColor: '#EA580C',
    label: 'Compensation Pending',
    dot: 'bg-orange-600'
  },
  verification_pending: {
    color: '#1D4ED8',
    fillColor: '#2563EB',
    label: 'Verification Pending',
    dot: 'bg-blue-600'
  }
};

export default function DistrictGIS({ onSelectParcel, initialProjectId = 'all' }) {
  const [filterTaluka, setFilterTaluka] = useState('All');
  const [filterVillage, setFilterVillage] = useState('All');
  const [filterProject, setFilterProject] = useState(initialProjectId);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedParcelId, setSelectedParcelId] = useState(null);

  // Filter parcels based on hierarchical dropdowns
  const filteredParcels = useMemo(() => {
    return DISTRICT_PARCELS.filter((p) => {
      if (filterTaluka !== 'All' && p.taluka !== filterTaluka) return false;
      if (filterVillage !== 'All' && p.village !== filterVillage) return false;
      if (filterProject !== 'all' && p.projectId !== filterProject) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      return true;
    });
  }, [filterTaluka, filterVillage, filterProject, filterStatus]);

  // Construct GeoJSON FeatureCollection from filtered parcels
  const geojsonData = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: filteredParcels.map((p) => ({
        type: 'Feature',
        id: p.id,
        properties: {
          id: p.id,
          survey_number: p.surveyNumber,
          khasra_number: p.khasraNumber,
          taluka: p.taluka,
          village: p.village,
          project_id: p.projectId,
          project_name: p.projectName,
          area_ha: p.areaHa,
          land_type: p.landType,
          status: p.status,
          status_label: p.statusLabel,
          rights_holder: p.rightsHolder,
          compensation_amount: p.compensation.assessedAmount,
          compensation_status: p.compensation.status,
          rr_required: p.rr.required,
          rr_status: p.rr.status,
          overall_verification: p.verification.overall.status
        },
        geometry: {
          type: 'Polygon',
          coordinates: [p.coordinates]
        }
      }))
    };
  }, [filteredParcels]);

  const activeParcelObj = DISTRICT_PARCELS.find((p) => p.id === selectedParcelId);

  const getFeatureStyle = (feature) => {
    const status = feature.properties?.status || 'under_process';
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.under_process;
    const isSelected = feature.properties?.id === selectedParcelId;

    return {
      color: isSelected ? '#001533' : cfg.color,
      fillColor: cfg.fillColor,
      weight: isSelected ? 4 : 2,
      fillOpacity: isSelected ? 0.8 : 0.55
    };
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[24px] text-primary">map</span>
          <div>
            <h2 className="font-bold text-base text-primary">District Cadastral GIS Dashboard</h2>
            <p className="text-xs text-govSlate-500">
              Interactive cadastral parcels across Ratnagiri District, color-coded by statutory verification &amp; acquisition lifecycle.
            </p>
          </div>
        </div>

        {/* 5-Status Map Legend */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap bg-govSlate-50 px-3 py-1.5 rounded-lg border border-govSlate-200">
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1 text-[11px] font-medium text-govSlate-700">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: val.fillColor }}></span>
              <span>{val.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Parcel Filtering Hierarchy (State -> District -> Taluka -> Village -> Project -> Status) */}
      <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-200 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        {/* State (Fixed) */}
        <div className="flex flex-col min-w-[110px]">
          <span className="text-[10px] font-bold text-govSlate-500 uppercase">State (Fixed)</span>
          <span className="font-bold text-govSlate-800 bg-govSlate-200/70 px-2 py-1 rounded text-xs">
            {DISTRICT_INFO.state}
          </span>
        </div>

        {/* District (Fixed) */}
        <div className="flex flex-col min-w-[110px]">
          <span className="text-[10px] font-bold text-govSlate-500 uppercase">District (Fixed)</span>
          <span className="font-bold text-govSlate-800 bg-govSlate-200/70 px-2 py-1 rounded text-xs">
            {DISTRICT_INFO.district}
          </span>
        </div>

        {/* Taluka Filter */}
        <div className="flex flex-col min-w-[120px]">
          <span className="text-[10px] font-bold text-govSlate-600 uppercase">Taluka</span>
          <select
            value={filterTaluka}
            onChange={(e) => setFilterTaluka(e.target.value)}
            className="bg-white border border-govSlate-300 rounded px-2 py-1 font-semibold text-xs outline-none focus:ring-1 focus:ring-primary"
          >
            {DISTRICT_INFO.talukas.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Talukas' : t}</option>
            ))}
          </select>
        </div>

        {/* Village Filter */}
        <div className="flex flex-col min-w-[120px]">
          <span className="text-[10px] font-bold text-govSlate-600 uppercase">Village</span>
          <select
            value={filterVillage}
            onChange={(e) => setFilterVillage(e.target.value)}
            className="bg-white border border-govSlate-300 rounded px-2 py-1 font-semibold text-xs outline-none focus:ring-1 focus:ring-primary"
          >
            {DISTRICT_INFO.villages.map((v) => (
              <option key={v} value={v}>{v === 'All' ? 'All Villages' : v}</option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div className="flex flex-col min-w-[160px]">
          <span className="text-[10px] font-bold text-govSlate-600 uppercase">Project</span>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-white border border-govSlate-300 rounded px-2 py-1 font-semibold text-xs outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Projects</option>
            {DISTRICT_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Parcel Status Filter */}
        <div className="flex flex-col min-w-[130px]">
          <span className="text-[10px] font-bold text-govSlate-600 uppercase">Parcel Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-govSlate-300 rounded px-2 py-1 font-semibold text-xs outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="acquired">🟢 Acquired</option>
            <option value="under_process">🟡 Under Process</option>
            <option value="disputed">🔴 Disputed</option>
            <option value="compensation_pending">🟠 Comp. Pending</option>
            <option value="verification_pending">🔵 Verif. Pending</option>
          </select>
        </div>

        {/* Filter Count & Reset */}
        <div className="ml-auto flex items-center gap-2 self-end">
          <span className="font-mono text-xs font-bold text-primary bg-white border border-govSlate-300 px-2 py-1 rounded">
            {filteredParcels.length} Parcels Active
          </span>
          <button
            onClick={() => {
              setFilterTaluka('All');
              setFilterVillage('All');
              setFilterProject('all');
              setFilterStatus('all');
            }}
            className="text-xs text-govSlate-500 hover:text-primary underline font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Map + Side Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Leaflet Map (Col 1-8 / 9) */}
        <div className="lg:col-span-8 xl:col-span-9 h-[460px] rounded-xl overflow-hidden border border-govSlate-200 relative shadow-inner">
          <MapContainer
            center={[17.000, 73.305]}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
            key={`${filterTaluka}-${filterVillage}-${filterProject}-${filterStatus}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              data={geojsonData}
              style={getFeatureStyle}
              onEachFeature={(feature, layer) => {
                const p = feature.properties;
                layer.on({
                  click: () => {
                    setSelectedParcelId(p.id);
                    if (onSelectParcel) onSelectParcel(p.id);
                  }
                });
                layer.bindTooltip(
                  `<div style="font-family: Inter, sans-serif; font-size: 11px;">
                    <strong>Plot ${p.id}</strong> (Survey: ${p.survey_number})<br/>
                    Owner: ${p.rights_holder}<br/>
                    Area: ${p.area_ha} Ha | Status: <strong style="text-transform: capitalize;">${p.status_label || p.status}</strong>
                  </div>`,
                  { sticky: true }
                );
              }}
            />
          </MapContainer>

          {/* Quick Floating Map Disclaimer */}
          <div className="absolute bottom-2 left-2 z-[1000] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded border border-govSlate-200 text-[10px] font-mono text-govSlate-600 shadow-xs pointer-events-none">
            Synthetic GeoJSON Cadastral Mesh • Ratnagiri District CALA Demonstration
          </div>
        </div>

        {/* Right Inspector Drawer (Col 9-12 / 3-4) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-govSlate-50 rounded-xl border border-govSlate-200 p-4 flex flex-col justify-between h-[460px] overflow-y-auto">
          {activeParcelObj ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between pb-2 border-b border-govSlate-200">
                <div>
                  <span className="font-mono text-xs font-bold text-primary bg-white px-2 py-0.5 rounded border border-govSlate-200">
                    {activeParcelObj.id}
                  </span>
                  <h3 className="font-extrabold text-sm text-govSlate-900 mt-1">
                    Survey {activeParcelObj.surveyNumber}
                  </h3>
                  <p className="text-[11px] text-govSlate-500">
                    {activeParcelObj.village}, {activeParcelObj.taluka}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                  activeParcelObj.status === 'acquired' ? 'bg-govEmerald' :
                  activeParcelObj.status === 'disputed' ? 'bg-error' :
                  activeParcelObj.status === 'compensation_pending' ? 'bg-orange-600' :
                  activeParcelObj.status === 'verification_pending' ? 'bg-blue-600' :
                  'bg-govAmber'
                }`}>
                  {activeParcelObj.statusLabel}
                </span>
              </div>

              {/* Attributes */}
              <div className="space-y-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-govSlate-200">
                  <span className="text-[10px] font-bold text-govSlate-500 uppercase">Rights Holder</span>
                  <div className="font-bold text-govSlate-900 mt-0.5">{activeParcelObj.rightsHolder}</div>
                  {activeParcelObj.coOwners?.length > 0 && (
                    <div className="text-[10px] text-govSlate-500 mt-0.5">
                      Co-owners: {activeParcelObj.coOwners.join(', ')}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-govSlate-200">
                    <span className="text-[10px] font-bold text-govSlate-500 uppercase">Area</span>
                    <div className="font-mono font-bold text-govSlate-900">{activeParcelObj.areaHa} Ha</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-govSlate-200">
                    <span className="text-[10px] font-bold text-govSlate-500 uppercase">Compensation</span>
                    <div className="font-mono font-bold text-govEmerald">
                      ₹ {(activeParcelObj.compensation.assessedAmount / 100000).toFixed(1)}L
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-govSlate-200">
                  <span className="text-[10px] font-bold text-govSlate-500 uppercase">5-Pillar Verification</span>
                  <div className="text-[11px] font-bold text-govSlate-800 mt-0.5">
                    {activeParcelObj.verification.overall.status}
                  </div>
                  <div className="text-[10px] text-govSlate-500 mt-0.5">
                    Action: {activeParcelObj.verification.overall.recommendedAction}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-govSlate-200">
                  <span className="text-[10px] font-bold text-govSlate-500 uppercase">Project</span>
                  <div className="font-semibold text-primary truncate mt-0.5">{activeParcelObj.projectName}</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onSelectParcel && onSelectParcel(activeParcelObj.id)}
                  className="w-full py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Open Full Parcel Dossier
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-govSlate-500">
              <span className="material-symbols-outlined text-[36px] text-govSlate-400 mb-2">touch_app</span>
              <p className="text-xs font-semibold text-govSlate-700">Select a Cadastral Parcel</p>
              <p className="text-[11px] text-govSlate-500 mt-1">
                Click any colored parcel on the Ratnagiri GIS grid to inspect survey coordinates, rights holders, and verification pillars.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
