import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { NATIONAL_KPIS, STATES_DATA } from '../../data/ministryData';

export default function NationalKPIs() {
  const kpi = NATIONAL_KPIS;

  // Chart 1: Land Proposed vs Acquired across states
  const landData = STATES_DATA.map((s) => ({
    name: s.code,
    fullName: s.name,
    Proposed: s.landProposedHa,
    Acquired: s.landAcquiredHa
  }));

  // Chart 2: Compensation Flow (Assessed vs Disbursed across states)
  const compensationData = STATES_DATA.map((s) => ({
    name: s.code,
    Assessed: s.compensationAssessedCr,
    Approved: s.compensationApprovedCr,
    Disbursed: s.compensationDisbursedCr
  }));

  // Chart 3: R&R Breakdown (Pie)
  const rrPieData = [
    { name: 'R&R Completed', value: kpi.rrCompletedPct, color: '#059669' },
    { name: 'R&R Pending', value: kpi.rrPendingPct, color: '#D97706' }
  ];

  // Chart 4: Possession Status (Pie)
  const possessionPieData = [
    { name: 'Possession Taken', value: kpi.possessionCompletedPct, color: '#00224D' },
    { name: 'Possession Pending', value: kpi.possessionPendingPct, color: '#DC2626' }
  ];

  // Chart 5: Timeline Adherence (Pie)
  const timelinePieData = [
    { name: 'On Schedule', value: kpi.timelineAdherencePct, color: '#059669' },
    { name: 'Delayed', value: kpi.delayedPct, color: '#DC2626' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">trending_up</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Acquisition Progress &amp; Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
              AGGREGATED CADASTRE
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Visualizing statutory lifecycle conversions from preliminary Section 11 notices to final Section 38 possession transfers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-govSlate-500 bg-govSlate-50 px-3 py-1.5 rounded-lg border border-govSlate-200">
          <span>Target Adherence: <strong>74%</strong></span>
          <span>•</span>
          <span>Pending Solatium: <strong>₹340 Cr</strong></span>
        </div>
      </div>

      {/* Row 1: Large Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Land Proposed vs Acquired */}
        <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">crop_free</span>
              <h3 className="font-bold text-sm text-primary">
                1. Land Proposed vs Acquired (Hectares)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-govEmerald font-bold">
              National: 76.1%
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={landData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(value, name) => [`${value.toLocaleString()} Ha`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Proposed" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Acquired" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Compensation Flow (Assessed vs Disbursed) */}
        <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
              <h3 className="font-bold text-sm text-primary">
                2. Compensation Assessed vs Disbursed (₹ Cr)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-primary font-bold">
              Total Disbursed: ₹8,420 Cr
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compensationData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(value, name) => [`₹${value} Cr`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Assessed" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Approved" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Disbursed" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Statutory Conversion Donuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Donut 1: R&R Completed vs Pending */}
        <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-100 mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-primary">
                3. R&amp;R Resettlement (Sec 31-38)
              </span>
              <span className="font-mono text-xs font-bold text-govEmerald">
                {kpi.rrCompletedPct}%
              </span>
            </div>
            <p className="text-[11px] text-govSlate-500">
              Homestead handover for {kpi.affectedFamilies.toLocaleString()} Project Affected Families.
            </p>

            <div className="h-[180px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rrPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {rrPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-govSlate-100">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Completed ({kpi.rrCompletedPct}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending ({kpi.rrPendingPct}%)</span>
          </div>
        </div>

        {/* Donut 2: Possession Handover */}
        <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-100 mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-primary">
                4. Physical Possession (Sec 38)
              </span>
              <span className="font-mono text-xs font-bold text-primary">
                {kpi.possessionCompletedPct}%
              </span>
            </div>
            <p className="text-[11px] text-govSlate-500">
              Certified unencumbered land handover to project implementing agencies.
            </p>

            <div className="h-[180px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={possessionPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {possessionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-govSlate-100">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00224D]"></span> Handed Over ({kpi.possessionCompletedPct}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Pending ({kpi.possessionPendingPct}%)</span>
          </div>
        </div>

        {/* Donut 3: Timeline Adherence */}
        <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-100 mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-primary">
                5. Statutory Timeline Adherence
              </span>
              <span className="font-mono text-xs font-bold text-govEmerald">
                {kpi.timelineAdherencePct}%
              </span>
            </div>
            <p className="text-[11px] text-govSlate-500">
              Corridors progressing within Section 25 statutory 12-month award window.
            </p>

            <div className="h-[180px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={timelinePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {timelinePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-govSlate-100">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> On Schedule ({kpi.timelineAdherencePct}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Delayed ({kpi.delayedPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
