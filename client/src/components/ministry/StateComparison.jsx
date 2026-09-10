import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { STATES_DATA } from '../../data/ministryData';

const SORT_OPTIONS = [
  { id: 'acquisitionPct', label: 'Acquisition %', format: (v) => `${v}%` },
  { id: 'projectsCount', label: 'Total Projects', format: (v) => `${v} Prj` },
  { id: 'landAcquiredHa', label: 'Land Acquired (Ha)', format: (v) => `${v.toLocaleString()} Ha` },
  { id: 'compensationDisbursedCr', label: 'Compensation Disbursed (Cr)', format: (v) => `₹${v} Cr` },
  { id: 'rrCompletedPct', label: 'R&R Completion %', format: (v) => `${v}%` },
  { id: 'timelineAdherencePct', label: 'Timeline Adherence %', format: (v) => `${v}%` },
  { id: 'riskScore', label: 'Risk Score (100)', format: (v) => `${v}/100` }
];

export default function StateComparison({ onSelectStateForGIS }) {
  const [sortKey, setSortKey] = useState('acquisitionPct');
  const [sortAsc, setSortAsc] = useState(false);
  const [activeStateModal, setActiveStateModal] = useState(null);

  // Sorted data
  const sortedStates = useMemo(() => {
    return [...STATES_DATA].sort((a, b) => {
      const valA = a[sortKey] || 0;
      const valB = b[sortKey] || 0;
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [sortKey, sortAsc]);

  // Chart data
  const chartData = useMemo(() => {
    return sortedStates.map((s) => ({
      name: s.name,
      code: s.code,
      value: s[sortKey],
      riskScore: s.riskScore,
      riskLevel: s.riskLevel
    }));
  }, [sortedStates, sortKey]);

  const activeOption = SORT_OPTIONS.find((o) => o.id === sortKey);

  const getBarColor = (item) => {
    if (sortKey === 'riskScore') {
      return item.value >= 75 ? '#DC2626' : item.value >= 50 ? '#D97706' : '#059669';
    }
    return item.riskScore >= 75 ? '#DC2626' : item.riskScore >= 50 ? '#D97706' : '#059669';
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* State Ministry-Level Read-Only Summary Modal */}
      {activeStateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-govSlate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-govSlate-50 border-b border-govSlate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold font-mono">
                  {activeStateModal.code}
                </div>
                <div>
                  <h3 className="font-bold text-base text-primary">
                    {activeStateModal.name} — Ministry Overview
                  </h3>
                  <p className="text-xs text-govSlate-500">
                    Aggregated State Cadastre &amp; Statutory Telemetry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveStateModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-govSlate-200 flex items-center justify-center text-govSlate-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-govSlate-700">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-700">shield</span>
                <span>
                  <strong>Ministry Read-Only Mode:</strong> Consolidated state data. State Department administration remains isolated in state portal.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-200">
                  <span className="text-[10px] text-govSlate-500 uppercase font-bold">Total Projects</span>
                  <div className="font-extrabold text-base text-primary mt-0.5">{activeStateModal.projectsCount}</div>
                </div>
                <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-200">
                  <span className="text-[10px] text-govSlate-500 uppercase font-bold">Acquisition Scope</span>
                  <div className="font-extrabold text-base text-govSlate-900 mt-0.5">{activeStateModal.landProposedHa.toLocaleString()} Ha</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold">Acquired</span>
                  <div className="font-extrabold text-base text-emerald-700 mt-0.5">{activeStateModal.landAcquiredHa.toLocaleString()} Ha ({activeStateModal.acquisitionPct}%)</div>
                </div>
                <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-200">
                  <span className="text-[10px] text-govSlate-500 uppercase font-bold">Compensation Disbursed</span>
                  <div className="font-extrabold text-base text-primary mt-0.5">₹{activeStateModal.compensationDisbursedCr} Cr</div>
                </div>
                <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-200">
                  <span className="text-[10px] text-govSlate-500 uppercase font-bold">R&amp;R Completed</span>
                  <div className="font-extrabold text-base text-govSlate-900 mt-0.5">{activeStateModal.rrCompletedPct}%</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-[10px] text-red-800 uppercase font-bold">Composite Risk Score</span>
                  <div className="font-extrabold text-base text-red-600 mt-0.5">{activeStateModal.riskScore} / 100</div>
                </div>
              </div>

              <div className="p-3.5 bg-govSlate-50 rounded-xl border border-govSlate-200">
                <span className="font-bold text-xs text-primary block mb-2">Tracked Districts:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(activeStateModal.districts || []).map((d) => (
                    <span key={d.name} className="px-2.5 py-1 bg-white border border-govSlate-200 rounded-lg text-xs font-semibold text-govSlate-800">
                      {d.name} ({d.projectsCount} Prj, {d.acquisitionPct}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-govSlate-50 border-t border-govSlate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  const targetCode = activeStateModal.code;
                  setActiveStateModal(null);
                  if (onSelectStateForGIS) onSelectStateForGIS(targetCode);
                }}
                className="px-4 py-1.5 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Inspect in National GIS</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <button
                onClick={() => setActiveStateModal(null)}
                className="px-4 py-1.5 border border-govSlate-200 hover:bg-govSlate-100 text-govSlate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">bar_chart</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              State Performance Comparison
            </h2>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
              CROSS-STATE BENCHMARK
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Comparative performance telemetry across Indian States. Sort by key operational vectors to identify high-velocity and lagging jurisdictions.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-govSlate-600 uppercase tracking-wider">
            Sort By:
          </span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="h-9 px-3 bg-govSlate-50 border border-govSlate-200 rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="h-9 px-3 bg-govSlate-100 hover:bg-govSlate-200 text-govSlate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Toggle Sort Order"
          >
            <span className="material-symbols-outlined text-[16px]">
              {sortAsc ? 'arrow_upward' : 'arrow_downward'}
            </span>
            <span>{sortAsc ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-govSlate-500">
              State Ranking by:
            </span>
            <span className="px-2.5 py-0.5 rounded bg-primary text-white font-mono text-xs font-bold">
              {activeOption?.label}
            </span>
          </div>
          <span className="text-xs text-govSlate-500">
            Click any bar or table row to open state executive brief
          </span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                domain={sortKey.includes('Pct') || sortKey === 'riskScore' ? [0, 100] : ['auto', 'auto']}
              />
              <Tooltip
                formatter={(value) => [activeOption.format(value), activeOption.label]}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                onClick={(data) => {
                  const st = STATES_DATA.find((s) => s.code === data.code);
                  if (st) setActiveStateModal(st);
                }}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-govSlate-50 border-b border-govSlate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">table_chart</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
              Inter-State Cadastral Performance Ledger
            </h3>
          </div>
          <span className="text-[11px] font-mono text-govSlate-500">
            Showing {sortedStates.length} benchmark states
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-govSlate-100 text-govSlate-600 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">Rank &amp; State</th>
                <th className="p-3">Projects</th>
                <th className="p-3">Proposed (Ha)</th>
                <th className="p-3">Acquired (Ha)</th>
                <th className="p-3">Acquisition %</th>
                <th className="p-3">Disbursed</th>
                <th className="p-3">R&amp;R %</th>
                <th className="p-3">Timeline %</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Central Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {sortedStates.map((st, idx) => {
                const isHigh = st.riskScore >= 75;
                const isAttn = st.riskScore >= 50 && st.riskScore < 75;
                return (
                  <tr
                    key={st.code}
                    onClick={() => setActiveStateModal(st)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3 flex items-center gap-2">
                      <span className="font-mono text-govSlate-400 font-bold w-4">#{idx + 1}</span>
                      <span className="font-bold text-primary text-sm">{st.name}</span>
                      <span className="px-1.5 py-0.2 bg-govSlate-100 text-govSlate-600 font-mono text-[10px] rounded">
                        {st.code}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold">{st.projectsCount}</td>
                    <td className="p-3 font-mono">{st.landProposedHa.toLocaleString()}</td>
                    <td className="p-3 font-mono font-semibold text-primary">{st.landAcquiredHa.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-govEmerald">{st.acquisitionPct}%</span>
                        <div className="w-16 bg-govSlate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-govEmerald h-full rounded-full" style={{ width: `${st.acquisitionPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono">₹{st.compensationDisbursedCr} Cr</td>
                    <td className="p-3 font-mono font-semibold">{st.rrCompletedPct}%</td>
                    <td className="p-3 font-mono font-semibold">{st.timelineAdherencePct}%</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isHigh
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isAttn
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {st.riskScore}/100 • {st.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStateModal(st);
                        }}
                        className="px-2.5 py-1 rounded bg-primary hover:bg-primary/90 text-white font-semibold text-[11px] transition-colors"
                      >
                        Inspect State
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
