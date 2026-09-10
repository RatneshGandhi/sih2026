import React, { useState } from 'react';
import { DISTRICT_PROJECTS } from '../../data/districtData';

export default function DistrictProjectList({ onInspectParcels }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-primary">folder_open</span>
          <div>
            <h2 className="font-bold text-base text-primary">District Projects (Ratnagiri Jurisdiction)</h2>
            <p className="text-xs text-govSlate-500">
              Corridor monitoring under CALA purview with land acquisition metrics, compensation status, and statutory risk index.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-primary bg-surface-container px-2.5 py-1 rounded-full">
          {DISTRICT_PROJECTS.length} Major Projects
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DISTRICT_PROJECTS.map((proj) => {
          return (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-govSlate-200 hover:border-primary hover:shadow-md transition-all bg-white flex flex-col justify-between group cursor-pointer"
              onClick={() => setSelectedProject(proj)}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-primary bg-govSlate-100 px-2 py-0.5 rounded">
                      {proj.code}
                    </span>
                    <h3 className="font-extrabold text-sm text-govSlate-900 mt-1 group-hover:text-primary transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-[11px] text-govSlate-500">{proj.agency}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono tracking-wide ${
                    proj.riskLevel === 'HIGH' ? 'bg-red-100 text-error border border-red-200' :
                    proj.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {proj.riskLevel === 'HIGH' ? '🔴 High — ' : proj.riskLevel === 'MEDIUM' ? '🟡 Med — ' : '🟢 Low — '}
                    {proj.riskScore}/100
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="my-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-govSlate-600 font-sans">Acquisition Progress</span>
                    <span className="font-bold text-primary">{proj.progressPct}%</span>
                  </div>
                  <div className="w-full bg-govSlate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        proj.riskLevel === 'HIGH' ? 'bg-error' :
                        proj.riskLevel === 'MEDIUM' ? 'bg-govAmber' :
                        'bg-govEmerald'
                      }`}
                      style={{ width: `${proj.progressPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metric Items Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-govSlate-100">
                  <div>
                    <span className="text-[10px] text-govSlate-500 font-bold uppercase">Total Parcels</span>
                    <div className="font-mono font-bold text-govSlate-900">{proj.parcels}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-govSlate-500 font-bold uppercase">Affected Families</span>
                    <div className="font-mono font-bold text-govSlate-900">{proj.affectedFamilies} PAFs</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-govSlate-500 font-bold uppercase">Land Proposed</span>
                    <div className="font-mono font-bold text-govSlate-900">{proj.landProposedHa} Ha</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-govSlate-500 font-bold uppercase">Land Acquired</span>
                    <div className="font-mono font-bold text-govEmerald">{proj.landAcquiredHa} Ha</div>
                  </div>
                </div>

                {/* Compensation & R&R Status */}
                <div className="mt-3 pt-2 border-t border-govSlate-100 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-govSlate-500">Compensation:</span>
                    <span className="font-semibold text-govSlate-800 truncate max-w-[170px]">{proj.compensationStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-govSlate-500">R&amp;R Status:</span>
                    <span className="font-semibold text-govSlate-800 truncate max-w-[170px]">{proj.rrStatus}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-govSlate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-govSlate-500">Stage: {proj.currentStage}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(proj);
                  }}
                  className="px-2.5 py-1 rounded bg-surface-container group-hover:bg-primary group-hover:text-white text-primary text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>Inspect Dossier</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* In-Dashboard District Project Details Modal (DO NOT CREATE SEPARATE DASHBOARD) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded">
                    {selectedProject.code}
                  </span>
                  <h3 className="font-bold text-base">{selectedProject.name}</h3>
                </div>
                <p className="text-xs text-govSlate-300 mt-0.5">
                  District Magistrate Project Oversight Dossier • {selectedProject.agency}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-govSlate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-govSlate-50">
              {/* Key Metrics Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-govSlate-200">
                <div>
                  <span className="text-govSlate-500 font-bold uppercase text-[10px]">Land Proposed</span>
                  <div className="text-lg font-black text-primary font-tnum mt-0.5">{selectedProject.landProposedHa} Ha</div>
                  <span className="text-[10px] text-govSlate-500">Across {selectedProject.parcels} plots</span>
                </div>
                <div>
                  <span className="text-govSlate-500 font-bold uppercase text-[10px]">Land Acquired</span>
                  <div className="text-lg font-black text-govEmerald font-tnum mt-0.5">{selectedProject.landAcquiredHa} Ha</div>
                  <span className="text-[10px] text-govEmerald font-semibold">{selectedProject.progressPct}% Complete</span>
                </div>
                <div>
                  <span className="text-govSlate-500 font-bold uppercase text-[10px]">Affected Families</span>
                  <div className="text-lg font-black text-govSlate-900 font-tnum mt-0.5">{selectedProject.affectedFamilies}</div>
                  <span className="text-[10px] text-govSlate-500">PAFs Identified</span>
                </div>
                <div>
                  <span className="text-govSlate-500 font-bold uppercase text-[10px]">Statutory Risk</span>
                  <div className="text-lg font-black text-error font-tnum mt-0.5">{selectedProject.riskScore}/100</div>
                  <span className="text-[10px] font-bold text-error">{selectedProject.riskLevel} PRIORITY</span>
                </div>
              </div>

              {/* Status & Bottleneck Breakdown */}
              <div className="bg-white p-4 rounded-xl border border-govSlate-200 space-y-2.5">
                <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-govAmber">warning</span>
                  District Bottleneck &amp; Vulnerability Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-govSlate-50 border border-govSlate-200">
                    <span className="font-bold text-govSlate-700 block">Primary Bottleneck:</span>
                    <span className="text-error font-bold">{selectedProject.mainBottleneck}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-govSlate-50 border border-govSlate-200">
                    <span className="font-bold text-govSlate-700 block">Predicted Delay:</span>
                    <span className="text-govSlate-900 font-bold">{selectedProject.predictedDelay}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-xs">
                  <span className="font-bold">Statutory CALA Action:</span>
                  <p className="mt-0.5">&ldquo;{selectedProject.recommendedAction}&rdquo;</p>
                </div>
              </div>

              {/* Statutory Lifecycle Stage Progress */}
              <div className="bg-white p-4 rounded-xl border border-govSlate-200">
                <span className="font-bold text-xs text-primary block mb-2">Statutory Stage Status</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedProject.stages?.map((s, idx) => (
                    <span
                      key={s.name}
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${
                        s.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        s.status === 'delayed' ? 'bg-red-100 text-error border-red-200 animate-pulse' :
                        s.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-govSlate-100 text-govSlate-500 border-govSlate-200'
                      }`}
                    >
                      {idx + 1}. {s.name} ({s.status})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-govSlate-200 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedProject(null);
                  if (onInspectParcels) onInspectParcels(selectedProject.id);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                Filter GIS Parcels for this Project
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-1.5 rounded-lg border border-govSlate-300 hover:bg-govSlate-100 text-govSlate-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
