import React from 'react';
import { NATIONAL_KPIS, STATES_DATA } from '../../data/ministryData';

export default function NationalPossession() {
  const kpi = NATIONAL_KPIS;

  const bottleneckReasons = [
    { reason: 'Compensation Pending in Escrow', percentage: 42, count: '38 Corridors', icon: 'payments', color: '#DC2626' },
    { reason: 'R&R Housing & Amenities Incomplete', percentage: 28, count: '26 Corridors', icon: 'home_work', color: '#D97706' },
    { reason: 'Legal Title & Court Stays', percentage: 18, count: '17 Corridors', icon: 'gavel', color: '#2563EB' },
    { reason: 'Field Verification & Demarcation Pending', percentage: 12, count: '11 Corridors', icon: 'straighten', color: '#059669' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">agriculture</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Possession Handover Status (Section 38)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
              PHYSICAL HANDOVER
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Tracking execution of Collector possession certificates under Section 38 of RFCTLARR Act, 2013 across central infrastructure projects.
          </p>
        </div>

        {/* Read-Only Restriction Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-xs text-blue-900 max-w-md">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-[16px] text-blue-700">lock</span>
            <span>Central Ministry Permission: READ ONLY</span>
          </div>
          <p className="text-[11px] text-blue-800 mt-0.5">
            Ministry monitors physical possession handover velocity. Handover certificates can only be legally issued by the District Collector under Section 38.
          </p>
        </div>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-govSlate-500 block">
            Possession Handed Over
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-govEmerald mt-1">
            {kpi.possessionCompletedPct}%
          </div>
          <div className="w-full bg-govSlate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-govEmerald h-full rounded-full" style={{ width: `${kpi.possessionCompletedPct}%` }}></div>
          </div>
          <span className="text-[11px] text-govSlate-500 mt-1 block">
            26,070 Hectares certified
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
            Possession Pending
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-red-600 mt-1">
            {kpi.possessionPendingPct}%
          </div>
          <div className="w-full bg-govSlate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-red-600 h-full rounded-full" style={{ width: `${kpi.possessionPendingPct}%` }}></div>
          </div>
          <span className="text-[11px] text-red-700 font-medium mt-1 block">
            10,650 Hectares pending handover
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
            Average Handover Lag
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-primary mt-1">
            4.8 <span className="text-xs font-normal text-govSlate-500">Months</span>
          </div>
          <span className="text-[11px] text-govSlate-500 mt-1 block">
            Post-award statutory lag
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-govSlate-500 block">
            Legal Injunctions Active
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-govSlate-900 mt-1">
            42 <span className="text-xs font-normal text-govSlate-500">Stays</span>
          </div>
          <span className="text-[11px] text-govSlate-500 mt-1 block">
            Stay orders across High Courts
          </span>
        </div>
      </div>

      {/* Bottlenecks Breakdown */}
      <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">troubleshoot</span>
            <h3 className="font-bold text-sm text-primary">
              Possession Slipped: Core Bottleneck Distribution
            </h3>
          </div>
          <span className="text-[11px] font-mono text-govSlate-500">
            Categorized across 48 slipped projects
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bottleneckReasons.map((b, i) => (
            <div key={i} className="p-4 bg-govSlate-50 rounded-xl border border-govSlate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-white border border-govSlate-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]" style={{ color: b.color }}>
                      {b.icon}
                    </span>
                  </span>
                  <span className="font-mono font-extrabold text-sm" style={{ color: b.color }}>
                    {b.percentage}%
                  </span>
                </div>
                <h4 className="font-bold text-xs text-govSlate-900 mt-2">{b.reason}</h4>
                <div className="text-[11px] text-govSlate-500 font-mono mt-0.5">{b.count}</div>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-govSlate-200 mt-3">
                <div className="h-full rounded-full" style={{ width: `${b.percentage}%`, backgroundColor: b.color }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Handover Comparison */}
      <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-govSlate-50 border-b border-govSlate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
            State-Level Section 38 Possession Handover Ratio
          </h3>
          <span className="text-[11px] font-mono text-govSlate-500">Central Oversight</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-govSlate-100 text-govSlate-600 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">State</th>
                <th className="p-3">Possession Taken %</th>
                <th className="p-3">Certified Handover (Ha)</th>
                <th className="p-3">Pending Handover (Ha)</th>
                <th className="p-3">Primary Blockers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {STATES_DATA.map((st) => (
                <tr key={st.code} className="hover:bg-govSlate-50/70 transition-colors">
                  <td className="p-3 font-bold text-primary text-sm">{st.name}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-govEmerald">
                        {st.possessionCompletedPct}%
                      </span>
                      <div className="w-20 bg-govSlate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-govEmerald h-full rounded-full" style={{ width: `${st.possessionCompletedPct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    {Math.round((st.landAcquiredHa * st.possessionCompletedPct) / 100).toLocaleString()} Ha
                  </td>
                  <td className="p-3 font-mono font-semibold text-red-600">
                    {Math.round(st.landAcquiredHa * (1 - st.possessionCompletedPct / 100)).toLocaleString()} Ha
                  </td>
                  <td className="p-3 text-[11px] text-govSlate-600">
                    {st.possessionCompletedPct < 70
                      ? 'R&R Housing amenities delayed & Section 64 reference stays'
                      : 'Minor boundary demarcation pending in 2 talukas'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
