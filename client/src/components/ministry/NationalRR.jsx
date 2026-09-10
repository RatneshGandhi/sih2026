import React from 'react';
import { NATIONAL_KPIS, STATES_DATA } from '../../data/ministryData';

export default function NationalRR() {
  const kpi = NATIONAL_KPIS;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">home_work</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Rehabilitation &amp; Resettlement (R&amp;R) Monitoring
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-mono text-[10px] font-bold border border-blue-200">
              RFCTLARR SECTIONS 31-38
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Tracking social impact mitigation, alternative housing allotments, annuity grants, and livelihood restoration for project-displaced families.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-govSlate-500 bg-govSlate-50 px-3 py-1.5 rounded-lg border border-govSlate-200">
          <span>Social Impact Census: <strong>Active</strong></span>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-govSlate-500 block">
            Affected Families (PAFs)
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-primary mt-1">
            {kpi.affectedFamilies.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">PAFs</span>
          </div>
          <p className="text-[11px] text-govSlate-500 mt-1">
            Identified via Social Impact Assessment (SIA)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Physically Displaced
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-700 mt-1">
            18,420 <span className="text-xs font-normal text-govSlate-500">Families</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-1">
            Requiring mandatory alternate homestead plots
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            R&amp;R Completed
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-govEmerald mt-1">
            {kpi.rrCompletedPct}%
          </div>
          <div className="w-full bg-govSlate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-govEmerald h-full rounded-full" style={{ width: `${kpi.rrCompletedPct}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">
            R&amp;R Pending
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-red-600 mt-1">
            {kpi.rrPendingPct}%
          </div>
          <p className="text-[11px] text-red-700 font-medium mt-1">
            Stalling Section 38 final possession handover
          </p>
        </div>
      </div>

      {/* State-Level R&R Comparison Table */}
      <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-govSlate-50 border-b border-govSlate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">family_restroom</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
              State-by-State R&amp;R Completion Benchmark
            </h3>
          </div>
          <span className="text-[11px] font-mono text-govSlate-500">
            Target Benchmark: &ge; 75% Completion
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-govSlate-100 text-govSlate-600 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">State</th>
                <th className="p-3">Total Projects</th>
                <th className="p-3">R&amp;R Completion %</th>
                <th className="p-3">Resettlement Progress</th>
                <th className="p-3">Compliance Status</th>
                <th className="p-3">Main Interventions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {STATES_DATA.map((st) => {
                const isLow = st.rrCompletedPct < 70;
                const isHigh = st.rrCompletedPct >= 80;
                return (
                  <tr key={st.code} className="hover:bg-govSlate-50/70 transition-colors">
                    <td className="p-3 font-bold text-primary text-sm flex items-center gap-2">
                      <span>{st.name}</span>
                      <span className="px-1.5 py-0.2 bg-govSlate-100 text-govSlate-600 font-mono text-[10px] rounded">
                        {st.code}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold">{st.projectsCount} Corridors</td>
                    <td className="p-3">
                      <span className={`font-mono font-extrabold text-sm ${
                        isLow ? 'text-red-600' : isHigh ? 'text-govEmerald' : 'text-amber-700'
                      }`}>
                        {st.rrCompletedPct}%
                      </span>
                    </td>
                    <td className="p-3 w-48">
                      <div className="w-full bg-govSlate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isLow ? 'bg-red-500' : isHigh ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${st.rrCompletedPct}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isLow
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isHigh
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isLow ? '🟠 Lagging (<70%)' : isHigh ? '🟢 On Track' : '🟡 Attention'}
                      </span>
                    </td>
                    <td className="p-3 text-govSlate-600 text-[11px]">
                      {isLow
                        ? 'Homestead amenities pending layout clearance'
                        : 'Annuity and housing handover progressing on schedule'}
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
