import React, { useState } from 'react';
import { PREDICTIVE_DELAY_PROJECTS } from '../../data/ministryData';

export default function PredictiveAnalytics({ onSelectProjectForDeepDive }) {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  const filteredProjects = PREDICTIVE_DELAY_PROJECTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.state.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.district.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.mainBottleneck.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesState = selectedStateFilter === 'ALL' || p.state === selectedStateFilter;
    return matchesSearch && matchesState;
  });

  const uniqueStates = Array.from(new Set(PREDICTIVE_DELAY_PROJECTS.map((p) => p.state)));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[26px]">psychology</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              Predictive Delay Analysis Engine
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-mono text-[10px] font-bold border border-red-300">
              18 PROJECTS AT RISK
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1 max-w-3xl">
            <strong>Headline Finding:</strong> 18 major national infrastructure corridors are algorithmically forecasted to miss their statutory completion deadlines due to unresolved legal disputes, compensation delays, and R&amp;R bottlenecks.
          </p>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 max-w-sm">
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <span className="material-symbols-outlined text-[16px] text-blue-700">code</span>
            <span>Transparent Rule-Based Prototype Engine</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-snug">
            Calculated via statutory duration variance vs historical CALA objection resolution velocity. Structured for plug-and-play replacement by production ML models.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-govSlate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined text-[18px] text-govSlate-400 absolute left-3 top-2.5">search</span>
          <input
            type="text"
            placeholder="Search corridors, states, bottlenecks..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-govSlate-50 border border-govSlate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-govSlate-500">Filter by State:</span>
          <select
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
            className="h-9 px-3 bg-govSlate-50 border border-govSlate-200 rounded-lg text-xs font-semibold text-primary focus:outline-none"
          >
            <option value="ALL">All States ({PREDICTIVE_DELAY_PROJECTS.length})</option>
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Predictive Projects Table */}
      <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-govSlate-50 border-b border-govSlate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">analytics</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
              Corridors Likely to Miss Statutory Deadlines
            </h3>
          </div>
          <span className="text-[11px] font-mono text-govSlate-500">
            Showing {filteredProjects.length} of {PREDICTIVE_DELAY_PROJECTS.length} critical corridors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-govSlate-100 text-govSlate-600 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">Rank &amp; Project Name</th>
                <th className="p-3">State &amp; District</th>
                <th className="p-3">Current Progress</th>
                <th className="p-3">Expected Target</th>
                <th className="p-3">Predicted Completion</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Main Bottleneck Factors</th>
                <th className="p-3 text-right">Root-Cause Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {filteredProjects.map((p) => {
                const isTop1 = p.rank === 1;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-red-50/30 transition-colors ${
                      isTop1 ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-600 w-5">
                          #{p.rank}
                        </span>
                        <div>
                          <div className="font-bold text-govSlate-900 text-sm">
                            {p.name}
                          </div>
                          <span className="text-[10px] text-govSlate-500 font-mono">
                            {p.agency} • {p.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-primary">{p.state}</div>
                      <span className="text-[11px] text-govSlate-500">{p.district}</span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{p.progressPct}%</span>
                        <div className="w-12 bg-govSlate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${p.progressPct}%` }}></div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-mono text-govSlate-600">
                      {p.expectedCompletion}
                    </td>

                    <td className="p-3">
                      <div className="font-mono font-bold text-red-700">
                        {p.predictedCompletion}
                      </div>
                      <span className="inline-block px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-mono text-[9px] font-bold">
                        {p.delayFormatted}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-50 text-red-700 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        {p.riskScore} • HIGH
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="text-[11px] text-govSlate-700 font-medium line-clamp-2">
                        {p.mainBottleneck}
                      </p>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectProjectForDeepDive && onSelectProjectForDeepDive(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto ${
                          isTop1
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                            : 'bg-govSlate-100 hover:bg-primary hover:text-white text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        <span>Why at Risk?</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
