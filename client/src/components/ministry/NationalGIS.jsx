import React, { useState } from 'react';
import { STATES_DATA } from '../../data/ministryData';
import { DISTRICT_PARCELS } from '../../data/districtData';
import MinistryParcelModal from './MinistryParcelModal';

export default function NationalGIS({ onDeepDiveProject }) {
  // 5-Tier Drill-down state:
  // Tier 1: India (state = null)
  // Tier 2: State (selectedState)
  // Tier 3: District (selectedDistrict)
  // Tier 4: Project (selectedProject)
  // Tier 5: Parcel (selectedParcelModal)
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedDistrictName, setSelectedDistrictName] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedParcelForModal, setSelectedParcelForModal] = useState(null);

  const selectedState = STATES_DATA.find((s) => s.code === selectedStateCode);
  const selectedDistrict = selectedState?.districts?.find((d) => d.name === selectedDistrictName);
  const selectedProject = selectedDistrict?.activeProjects?.find((p) => p.id === selectedProjectId);

  // Filter parcels for Tier 5 if Ratnagiri / Mumbai-Goa Railway
  const relevantParcels = selectedProject?.id === 'PRJ-001'
    ? DISTRICT_PARCELS.slice(0, 8)
    : [
        {
          id: 'P103',
          surveyNumber: 'SRV-103',
          rightsHolder: 'Rahul Sharma',
          areaHa: 2.45,
          status: 'disputed',
          village: 'Shirgaon'
        },
        {
          id: 'P104',
          surveyNumber: 'SRV-104',
          rightsHolder: 'Vikas Kadam',
          areaHa: 1.80,
          status: 'acquired',
          village: 'Shirgaon'
        },
        {
          id: 'P105',
          surveyNumber: 'SRV-105',
          rightsHolder: 'Sunita Patil',
          areaHa: 3.10,
          status: 'compensation_pending',
          village: 'Mirya'
        }
      ];

  // Helper reset functions for breadcrumbs
  const resetToIndia = () => {
    setSelectedStateCode(null);
    setSelectedDistrictName(null);
    setSelectedProjectId(null);
  };

  const resetToState = () => {
    setSelectedDistrictName(null);
    setSelectedProjectId(null);
  };

  const resetToDistrict = () => {
    setSelectedProjectId(null);
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Read-Only Modal when Tier 5 parcel is clicked */}
      {selectedParcelForModal && (
        <MinistryParcelModal
          parcel={selectedParcelForModal}
          onClose={() => setSelectedParcelForModal(null)}
        />
      )}

      {/* Header with 5-Tier Breadcrumb */}
      <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-primary">public</span>
            <h2 className="font-extrabold text-base sm:text-lg text-primary">
              National GIS Cadastre &amp; Multi-Tier Drill-Down
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
              5-LEVEL HIERARCHY
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-0.5">
            Institutional Central monitoring: Drill down seamlessly from Sovereign India down to individual cadastral plots.
          </p>
        </div>

        {/* Live Breadcrumb Navigator */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs bg-govSlate-50 px-3 py-1.5 rounded-lg border border-govSlate-200">
          <button
            onClick={resetToIndia}
            className={`font-semibold transition-colors ${
              !selectedStateCode ? 'text-primary font-bold' : 'text-govSlate-500 hover:text-primary underline'
            }`}
          >
            🇮🇳 INDIA
          </button>

          {selectedState && (
            <>
              <span className="text-govSlate-400">/</span>
              <button
                onClick={resetToState}
                className={`font-semibold transition-colors ${
                  !selectedDistrictName ? 'text-primary font-bold' : 'text-govSlate-500 hover:text-primary underline'
                }`}
              >
                {selectedState.name}
              </button>
            </>
          )}

          {selectedDistrict && (
            <>
              <span className="text-govSlate-400">/</span>
              <button
                onClick={resetToDistrict}
                className={`font-semibold transition-colors ${
                  !selectedProjectId ? 'text-primary font-bold' : 'text-govSlate-500 hover:text-primary underline'
                }`}
              >
                {selectedDistrict.name}
              </button>
            </>
          )}

          {selectedProject && (
            <>
              <span className="text-govSlate-400">/</span>
              <span className="font-bold text-govEmerald">
                {selectedProject.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Quick Status Bar */}
      <div className="bg-white rounded-xl px-4 py-2.5 border border-govSlate-200 shadow-xs flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-govSlate-700 text-[11px] uppercase tracking-wider">
            Risk Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-govSlate-700 text-[11px]">🟢 On Track (Risk &lt;50)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-govSlate-700 text-[11px]">🟡 Attention (Risk 50–70)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span className="text-govSlate-700 text-[11px]">🔴 High Risk (Risk &gt;70)</span>
          </div>
        </div>

        <span className="text-[11px] text-govSlate-500 font-mono">
          Click any State or Corridor to drill down
        </span>
      </div>

      {/* Main Multi-Tier Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Map Grid (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">map</span>
                <h3 className="font-bold text-sm text-primary">
                  {!selectedStateCode
                    ? 'All-India State Level GIS Overview'
                    : !selectedDistrictName
                    ? `${selectedState.name} — District Boundary Overlay`
                    : !selectedProjectId
                    ? `${selectedDistrict.name} District — Active Corridors`
                    : `${selectedProject.name} — Cadastral Parcels`}
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-govSlate-100 text-govSlate-600">
                {!selectedStateCode
                  ? '7 Major Focus States'
                  : !selectedDistrictName
                  ? `${selectedState.districts?.length || 4} Tracked Districts`
                  : !selectedProjectId
                  ? `${selectedDistrict.activeProjects?.length || 2} Projects`
                  : `${relevantParcels.length} Cadastral Parcels`}
              </span>
            </div>

            {/* Interactive Vector / Schematic National GIS Map */}
            <div className="bg-slate-900 rounded-xl p-4 min-h-[380px] text-white flex flex-col justify-between relative overflow-hidden shadow-inner">
              {/* Simulated Map Coordinates & Grid */}
              <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 backdrop-blur-xs">
                GIS PROJECTION: EPSG:4326 • LAT 20.5937° N, LNG 78.9629° E
              </div>

              {/* Central Map Visualizer depending on Tier */}
              {!selectedStateCode ? (
                /* Tier 1: India State Selector Map */
                <div className="my-auto py-6">
                  <div className="text-center mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      Interactive State Command Grid
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Select a state to inspect aggregated projects, disputes, and acquisition pace.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto">
                    {STATES_DATA.map((st) => {
                      const isHigh = st.riskScore >= 75;
                      const isAttn = st.riskScore >= 50 && st.riskScore < 75;
                      return (
                        <button
                          key={st.code}
                          onClick={() => {
                            setSelectedStateCode(st.code);
                            setSelectedDistrictName(null);
                            setSelectedProjectId(null);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all hover:scale-102 flex flex-col justify-between ${
                            st.code === 'MH'
                              ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-400/40'
                              : isHigh
                              ? 'bg-red-950/40 border-red-500/60 hover:border-red-400'
                              : isAttn
                              ? 'bg-amber-950/30 border-amber-500/50 hover:border-amber-400'
                              : 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white">{st.name}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isHigh ? 'bg-red-500' : isAttn ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                            ></span>
                          </div>
                          <div className="mt-2 text-[10px] text-slate-300 font-mono">
                            <div>Acquisition: <strong className="text-white">{st.acquisitionPct}%</strong></div>
                            <div>Projects: <strong className="text-white">{st.projectsCount}</strong></div>
                            <div>Risk: <strong className={isHigh ? 'text-red-400' : isAttn ? 'text-amber-400' : 'text-emerald-400'}>{st.riskScore}/100</strong></div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : !selectedDistrictName ? (
                /* Tier 2: State District Level */
                <div className="my-auto py-6">
                  <div className="text-center mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                      {selectedState.name} — District Selection
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Select a district to zoom into active infrastructure alignments.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                    {(selectedState.districts || []).map((dist) => (
                      <button
                        key={dist.name}
                        onClick={() => {
                          setSelectedDistrictName(dist.name);
                          setSelectedProjectId(null);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all hover:scale-102 ${
                          dist.name === 'Ratnagiri'
                            ? 'bg-blue-900/60 border-blue-400 ring-2 ring-blue-400/40'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-blue-400">location_city</span>
                            {dist.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-700 text-slate-200">
                            {dist.projectsCount} Projects
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-300 font-mono space-y-0.5">
                          <div>Acquired: <strong className="text-white">{dist.acquisitionPct}%</strong></div>
                          <div>Disputes: <strong className="text-amber-400">{dist.disputesCount}</strong></div>
                          <div>High-Risk: <strong className="text-red-400">{dist.highRiskProjects} Corridors</strong></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : !selectedProjectId ? (
                /* Tier 3: District Projects Level */
                <div className="my-auto py-6">
                  <div className="text-center mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      {selectedDistrict.name} District — Project Alignments
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Select an infrastructure corridor to inspect cadastral progress and risk factors.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 max-w-lg mx-auto">
                    {(selectedDistrict.activeProjects || [
                      {
                        id: 'PRJ-001',
                        name: 'Mumbai-Goa Railway Double Track Line',
                        agency: 'KRCL',
                        progressPct: 72,
                        riskScore: 82
                      }
                    ]).map((prj) => (
                      <button
                        key={prj.id}
                        onClick={() => setSelectedProjectId(prj.id)}
                        className={`p-3 rounded-xl border text-left transition-all hover:scale-101 ${
                          prj.id === 'PRJ-001'
                            ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/30'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{prj.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-900/60 text-red-300 border border-red-700">
                            Risk: {prj.riskScore}/100 🔴
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-300 flex items-center gap-3">
                          <span>Agency: <strong>{prj.agency}</strong></span>
                          <span>Progress: <strong className="text-emerald-400">{prj.progressPct}%</strong></span>
                          <span>Parcels: <strong>{prj.parcelsCount || 342}</strong></span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Tier 4: Cadastral Plots Level */
                <div className="my-auto py-4">
                  <div className="text-center mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      {selectedProject.name} — Cadastral Parcels Grid
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Click Parcel P103 to open Central Read-Only Cadastral Dossier.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl mx-auto">
                    {relevantParcels.map((pcl) => {
                      const isDisputed = pcl.status === 'disputed';
                      return (
                        <button
                          key={pcl.id}
                          onClick={() => setSelectedParcelForModal(pcl)}
                          className={`p-2.5 rounded-xl border text-left transition-all hover:scale-103 ${
                            pcl.id === 'P103'
                              ? 'bg-red-900/60 border-red-400 ring-2 ring-red-400/50 animate-pulse'
                              : isDisputed
                              ? 'bg-red-950/40 border-red-700 hover:border-red-500'
                              : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-white">
                              {pcl.id}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isDisputed ? 'bg-red-500' : 'bg-emerald-400'
                              }`}
                            ></span>
                          </div>
                          <div className="text-[10px] text-slate-300 mt-1 truncate">
                            {pcl.surveyNumber}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            {pcl.rightsHolder}
                          </div>
                          <div className="text-[9px] font-mono text-amber-300 mt-1">
                            {pcl.areaHa} Ha
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Interactive Strip */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Spatial Cadastre Layer Active</span>
                </div>
                {selectedStateCode && (
                  <button
                    onClick={resetToIndia}
                    className="text-xs text-primary-200 hover:text-white font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">undo</span>
                    <span>Return to India Level</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ministry Read-Only Detail Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Context Card: Dynamic based on Drill-Down State */}
          {!selectedState ? (
            /* National India Summary */
            <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-govSlate-400 font-bold">
                    Tier 1: Sovereign Cadastre
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary text-white font-mono text-[10px] font-bold">
                    INDIA LEVEL
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-extrabold text-lg text-primary">All-India Sovereign Overview</h4>
                  <p className="text-xs text-govSlate-600 mt-1">
                    Aggregate monitoring across 184 major infrastructure corridors under the RFCTLARR statutory regime.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                    <span className="text-[10px] text-govSlate-500 uppercase font-bold">Total Corridors</span>
                    <div className="font-mono font-extrabold text-lg text-primary mt-0.5">184 Projects</div>
                  </div>
                  <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                    <span className="text-[10px] text-govSlate-500 uppercase font-bold">Total Extent</span>
                    <div className="font-mono font-extrabold text-lg text-govSlate-900 mt-0.5">48,250 Ha</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold">Acquired</span>
                    <div className="font-mono font-extrabold text-lg text-emerald-700 mt-0.5">36,720 Ha (76%)</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-[10px] text-red-800 uppercase font-bold">High Risk Projects</span>
                    <div className="font-mono font-extrabold text-lg text-red-600 mt-0.5">18 Corridors</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-700 shrink-0">touch_app</span>
                  <span>
                    <strong>SIH Hackathon Drill-Down Demo:</strong> Click on <strong>Maharashtra</strong> in the map grid on the left to inspect district-level metrics.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStateCode('MH')}
                className="mt-4 w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Drill Down to Maharashtra</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          ) : !selectedDistrict ? (
            /* State Summary Card (e.g. Maharashtra) */
            <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-govSlate-400 font-bold">
                    Tier 2: State Oversight
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
                    {selectedState.riskLevel}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-extrabold text-xl text-primary uppercase tracking-tight">
                    {selectedState.name}
                  </h4>
                  <p className="text-xs text-govSlate-600 mt-0.5">
                    State Cadastre Node • {selectedState.districtsCount} Revenue Districts
                  </p>
                </div>

                {/* State metrics requested in user prompt */}
                <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs">
                  <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                    <span className="text-[10px] text-govSlate-500 uppercase font-bold">Projects</span>
                    <div className="font-mono font-extrabold text-lg text-primary mt-0.5">
                      {selectedState.projectsCount}
                    </div>
                  </div>
                  <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                    <span className="text-[10px] text-govSlate-500 uppercase font-bold">Land Proposed</span>
                    <div className="font-mono font-extrabold text-lg text-govSlate-900 mt-0.5">
                      {selectedState.landProposedHa.toLocaleString()} Ha
                    </div>
                  </div>
                  <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                    <span className="text-[10px] text-govSlate-500 uppercase font-bold">Land Acquired</span>
                    <div className="font-mono font-extrabold text-lg text-govSlate-900 mt-0.5">
                      {selectedState.landAcquiredHa.toLocaleString()} Ha
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold">Acquisition Progress</span>
                    <div className="font-mono font-extrabold text-lg text-emerald-700 mt-0.5">
                      {selectedState.acquisitionPct}%
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-[10px] text-red-800 uppercase font-bold">High Risk Projects</span>
                    <div className="font-mono font-extrabold text-lg text-red-600 mt-0.5">
                      {selectedState.highRiskProjects}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-800 uppercase font-bold">Disputes</span>
                    <div className="font-mono font-extrabold text-lg text-amber-700 mt-0.5">
                      {selectedState.disputesCount}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-700 shrink-0">subdirectory_arrow_right</span>
                  <span>
                    Click <strong>[View Districts]</strong> below or choose <strong>Ratnagiri</strong> on the map to zoom into CALA benches.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={resetToIndia}
                  className="px-3 py-2 border border-govSlate-200 hover:bg-govSlate-50 text-govSlate-700 rounded-xl text-xs font-semibold"
                >
                  ← All India
                </button>
                <button
                  onClick={() => setSelectedDistrictName('Ratnagiri')}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Districts (Ratnagiri)</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : !selectedProject ? (
            /* District Summary Card (e.g. Ratnagiri) */
            <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-govSlate-400 font-bold">
                    Tier 3: District CALA Jurisdiction
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono text-[10px] font-bold">
                    HIGH RISK BENCH
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-extrabold text-xl text-primary uppercase tracking-tight">
                    {selectedDistrict.name}
                  </h4>
                  <p className="text-xs text-govSlate-600 mt-0.5">
                    District Magistrate &amp; CALA Bench • {selectedState.name}
                  </p>
                </div>

                {/* District metrics requested in user prompt */}
                <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs">
                  <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                    <span className="text-[10px] text-govSlate-500 uppercase font-bold">Projects</span>
                    <div className="font-mono font-extrabold text-lg text-primary mt-0.5">
                      {selectedDistrict.projectsCount}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold">Acquisition</span>
                    <div className="font-mono font-extrabold text-lg text-emerald-700 mt-0.5">
                      {selectedDistrict.acquisitionPct}%
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-[10px] text-red-800 uppercase font-bold">High Risk</span>
                    <div className="font-mono font-extrabold text-lg text-red-600 mt-0.5">
                      {selectedDistrict.highRiskProjects}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-800 uppercase font-bold">Disputes</span>
                    <div className="font-mono font-extrabold text-lg text-amber-700 mt-0.5">
                      {selectedDistrict.disputesCount}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-700 shrink-0">train</span>
                  <span>
                    Select <strong>Mumbai-Goa Railway</strong> to inspect progress, risk breakdown (82/100), and cadastral parcels.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={resetToState}
                  className="px-3 py-2 border border-govSlate-200 hover:bg-govSlate-50 text-govSlate-700 rounded-xl text-xs font-semibold"
                >
                  ← {selectedState.name}
                </button>
                <button
                  onClick={() => setSelectedProjectId('PRJ-001')}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Select Mumbai-Goa Railway</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            /* Project Summary Card (e.g. Mumbai-Goa Railway) */
            <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-govSlate-400 font-bold">
                    Tier 4: Corridor Telemetry
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-mono text-[10px] font-bold">
                    RISK 82 / 100 🔴
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-extrabold text-lg text-primary tracking-tight">
                    {selectedProject.name}
                  </h4>
                  <p className="text-xs text-govSlate-600 mt-0.5">
                    {selectedProject.agency} • {selectedDistrict.name}, {selectedState.name}
                  </p>
                </div>

                {/* Project metrics requested in user prompt */}
                <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs">
                  <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                    <span className="text-[10px] text-govSlate-500 uppercase font-bold">Progress</span>
                    <div className="font-mono font-extrabold text-lg text-primary mt-0.5">
                      {selectedProject.progressPct}%
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-[10px] text-red-800 uppercase font-bold">Risk Score</span>
                    <div className="font-mono font-extrabold text-lg text-red-600 mt-0.5">
                      82 / 100
                    </div>
                  </div>
                  <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                    <span className="text-[10px] text-govSlate-500 uppercase font-bold">Expected Completion</span>
                    <div className="font-mono font-bold text-xs text-govSlate-800 mt-0.5">
                      {selectedProject.expectedCompletion}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-800 uppercase font-bold">Predicted Completion</span>
                    <div className="font-mono font-bold text-xs text-amber-800 mt-0.5">
                      {selectedProject.predictedCompletion} ({selectedProject.predictedDelay})
                    </div>
                  </div>
                </div>

                {/* Project Bottleneck Banner */}
                <div className="mt-3 p-3 bg-red-50/60 rounded-xl border border-red-200 text-xs">
                  <span className="font-bold text-red-900 block">Main Bottlenecks:</span>
                  <span className="text-govSlate-700 mt-0.5 block">{selectedProject.mainBottleneck}</span>
                </div>

                {/* Parcel P103 Quick Inspector */}
                <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                      TIER 5 CADASTRE TARGET:
                    </span>
                    <span className="font-bold text-sm">Parcel P103 (Rahul Sharma)</span>
                    <span className="text-[10px] text-slate-400 block">Survey SRV-103 • 2.45 Ha</span>
                  </div>
                  <button
                    onClick={() => setSelectedParcelForModal(relevantParcels[0])}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    View Parcel P103
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={resetToDistrict}
                  className="px-3 py-2 border border-govSlate-200 hover:bg-govSlate-50 text-govSlate-700 rounded-xl text-xs font-semibold"
                >
                  ← {selectedDistrict.name}
                </button>
                <button
                  onClick={() => onDeepDiveProject && onDeepDiveProject(selectedProject)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>Why is this project at risk?</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
