import React from 'react';
import { DISTRICT_PROJECTS } from '../../data/districtData';

const STAGES = [
  'Proposal',
  'Scrutiny',
  'Land Identification',
  'Verification',
  'Notification',
  'Objections',
  'Valuation',
  'Award',
  'Compensation',
  'R&R',
  'Possession'
];

export default function DistrictProjectProgress({ onSelectProject }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-primary">timeline</span>
          <div>
            <h2 className="font-bold text-base text-primary">District Projects Lifecycle Progress (11 Stages)</h2>
            <p className="text-xs text-govSlate-500">
              End-to-end statutory progression under RFCTLARR Act, 2013 from Preliminary Proposal to Section 38 Possession.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-govEmerald"></span> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Current
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-error"></span> Delayed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-govSlate-300"></span> Pending
          </span>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {DISTRICT_PROJECTS.map((proj) => {
          return (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-govSlate-200 bg-govSlate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col gap-3"
            >
              {/* Project Title & Progress Pct */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                      {proj.code}
                    </span>
                    <h4 className="font-extrabold text-sm text-govSlate-900">{proj.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      proj.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                      proj.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      Risk: {proj.riskScore}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-govSlate-600 mt-1 flex-wrap">
                    <span>Current Stage: <strong className="text-primary">{proj.currentStage}</strong></span>
                    {proj.delayedStage !== 'None' && (
                      <span className="text-error font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">flag</span>
                        Delayed Stage: {proj.delayedStage}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-primary">{proj.progressPct}%</span>
                    <span className="text-[10px] text-govSlate-500 block">Overall Acquisition</span>
                  </div>
                  <button
                    onClick={() => onSelectProject && onSelectProject(proj)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-colors"
                  >
                    Dossier
                  </button>
                </div>
              </div>

              {/* 11-Stage Pipeline Stepper Bar */}
              <div className="grid grid-cols-11 gap-1 pt-1">
                {STAGES.map((stageName, idx) => {
                  const stageObj = proj.stages?.find((s) => s.name.toLowerCase() === stageName.toLowerCase());
                  const isCompleted = stageObj?.status === 'completed';
                  const isDelayed = stageObj?.status === 'delayed';
                  const isInProgress = stageObj?.status === 'in-progress';

                  let bg = 'bg-govSlate-200 text-govSlate-400';
                  if (isDelayed) bg = 'bg-error text-white font-bold animate-pulse';
                  else if (isInProgress) bg = 'bg-blue-600 text-white font-bold';
                  else if (isCompleted) bg = 'bg-govEmerald text-white';

                  return (
                    <div key={stageName} className="flex flex-col items-center gap-1 group relative">
                      <div className={`h-2.5 w-full rounded-xs transition-all ${bg}`}></div>
                      <span className="text-[9px] font-mono text-govSlate-600 truncate w-full text-center hidden xl:block">
                        {idx + 1}. {stageName.split(' ')[0]}
                      </span>
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:block z-20 bg-primary text-white text-[10px] font-mono py-1 px-2 rounded shadow-lg whitespace-nowrap">
                        {stageName}: {stageObj?.status || 'pending'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
