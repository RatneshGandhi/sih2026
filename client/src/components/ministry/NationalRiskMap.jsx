import React, { useState } from 'react';
import { STATES_DATA } from '../../data/ministryData';

export default function NationalRiskMap({ onSelectStateForGIS }) {
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredStates = STATES_DATA.filter((s) => {
    if (selectedFilter === 'HIGH') return s.riskScore >= 75;
    if (selectedFilter === 'ATTENTION') return s.riskScore >= 50 && s.riskScore < 75;
    if (selectedFilter === 'LOW') return s.riskScore < 50;
    return true;
  });

  const highRiskCount = STATES_DATA.filter((s) => s.riskScore >= 75).length;
  const attentionCount = STATES_DATA.filter((s) => s.riskScore >= 50 && s.riskScore < 75).length;
  const onTrackCount = STATES_DATA.filter((s) => s.riskScore < 50).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[24px]">troubleshoot</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Risk Overview &amp; Heatmap
            </h2>
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-mono text-[10px] font-bold border border-red-200">
              VULNERABILITY INDEX
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Institutional early warning system. Highlights administrative jurisdictions where legal disputes, compensation delays, or R&amp;R bottlenecks threaten critical infrastructure deadlines.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'ALL' ? 'bg-primary text-white shadow-xs' : 'bg-govSlate-100 text-govSlate-700 hover:bg-govSlate-200'
            }`}
          >
            All States ({STATES_DATA.length})
          </button>
          <button
            onClick={() => setSelectedFilter('HIGH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'HIGH' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>🔴 High Risk ({highRiskCount})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('ATTENTION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'ATTENTION' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>🟡 Attention ({attentionCount})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('LOW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'LOW' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>🟢 Low / On Track ({onTrackCount})</span>
          </button>
        </div>
      </div>

      {/* Visual Risk Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStates.map((st) => {
          const isHigh = st.riskScore >= 75;
          const isAttn = st.riskScore >= 50 && st.riskScore < 75;
          return (
            <div
              key={st.code}
              className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                isHigh
                  ? 'border-red-300 ring-1 ring-red-200'
                  : isAttn
                  ? 'border-amber-300'
                  : 'border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-govSlate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-govSlate-400">[{st.code}]</span>
                    <h3 className="font-bold text-base text-primary">{st.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      isHigh
                        ? 'bg-red-100 text-red-800'
                        : isAttn
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isHigh ? '🔴 High Risk' : isAttn ? '🟡 Attention' : '🟢 On Track'}
                  </span>
                </div>

                {/* Score gauge */}
                <div className="my-3 flex items-baseline justify-between">
                  <span className="text-xs text-govSlate-500 font-semibold">Vulnerability Score:</span>
                  <div className="text-right">
                    <span className={`text-2xl font-extrabold font-mono ${
                      isHigh ? 'text-red-600' : isAttn ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {st.riskScore}
                    </span>
                    <span className="text-xs text-govSlate-400"> / 100</span>
                  </div>
                </div>

                <div className="w-full bg-govSlate-100 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh ? 'bg-red-600' : isAttn ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${st.riskScore}%` }}
                  ></div>
                </div>

                {/* Risk Breakdown Details */}
                <div className="space-y-1.5 text-xs text-govSlate-600 pt-2 border-t border-govSlate-100">
                  <div className="flex justify-between">
                    <span>High Risk Projects:</span>
                    <strong className={st.highRiskProjects > 0 ? 'text-red-600' : 'text-govSlate-900'}>
                      {st.highRiskProjects} Corridors
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Land Disputes:</span>
                    <strong className="text-amber-700">{st.disputesCount} Cases</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Acquisition Velocity:</span>
                    <strong className="text-govEmerald">{st.acquisitionPct}% Complete</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Compensation:</span>
                    <strong className="font-mono text-primary">₹{st.compensationPendingCr} Cr</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-govSlate-100 flex items-center justify-between">
                <span className="text-[11px] text-govSlate-400 font-mono">
                  {st.districtsCount} Districts
                </span>
                <button
                  onClick={() => onSelectStateForGIS && onSelectStateForGIS(st.code)}
                  className="px-2.5 py-1 bg-govSlate-100 hover:bg-primary hover:text-white rounded-lg text-xs font-semibold text-primary transition-colors flex items-center gap-1"
                >
                  <span>Inspect GIS</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategic Policy Note */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-700 text-[22px] shrink-0 mt-0.5">policy</span>
        <div className="text-xs text-amber-950">
          <strong className="font-bold text-sm block mb-0.5 text-amber-900">
            Central Oversight Objective:
          </strong>
          Risk heatmap scores are synthesized from three statutory parameters under RFCTLARR 2013: (1) Density of Section 15 title objections, (2) Solatium disbursement backlog exceeding 60 days, and (3) Divergence between financial compensation and physical R&amp;R colony delivery.
        </div>
      </div>
    </div>
  );
}
