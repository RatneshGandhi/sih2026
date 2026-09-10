import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TIMELINE_PERFORMANCE } from '../../data/ministryData';

export default function TimelineAnalytics() {
  const tp = TIMELINE_PERFORMANCE;

  const pieData = [
    { name: 'On Schedule', value: tp.onSchedulePct, color: '#059669' },
    { name: 'Statutorily Delayed', value: tp.delayedPct, color: '#DC2626' }
  ];

  const barData = tp.stageDurations.map((d) => ({
    stage: d.stage.split('(')[0].trim(),
    fullName: d.stage,
    ActualMonths: d.durationMonths,
    StatutoryTarget: d.targetMonths
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">schedule</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Timeline Adherence &amp; Duration Analytics
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-mono text-[10px] font-bold border border-blue-200">
              WORKFLOW BOTTLENECK ANALYSIS
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Analyzing end-to-end statutory timelines from Section 11 gazette notification to Section 38 handover to isolate where procedural time is being lost.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-800">On Schedule</span>
            <div className="font-mono font-extrabold text-lg text-emerald-700">{tp.onSchedulePct}%</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
            <span className="text-[10px] uppercase font-bold text-red-800">Delayed</span>
            <div className="font-mono font-extrabold text-lg text-red-600">{tp.delayedPct}%</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Bar vs Target + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Stage Durations Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
                <h3 className="font-bold text-sm text-primary">
                  Stage Duration Benchmarks (Actual vs Statutory Target in Months)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-govSlate-500">
                Avg End-to-End: {tp.averageAcquisitionMonths} mos
              </span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} unit=" mos" />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }}
                    width={130}
                  />
                  <Tooltip
                    formatter={(val, name) => [`${val} Months`, name]}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="ActualMonths" fill="#DC2626" radius={[0, 4, 4, 0]} name="Actual Duration" />
                  <Bar dataKey="StatutoryTarget" fill="#059669" radius={[0, 4, 4, 0]} name="Target (Act Benchmark)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-950 flex items-start gap-2">
            <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0">warning</span>
            <span>
              <strong>Key Bottleneck Finding:</strong> The transition from <strong>Compensation to Possession</strong> exhibits the highest relative slippage (+1.3 months above statutory target), driven primarily by disputes over physical R&amp;R colony allotment.
            </span>
          </div>
        </div>

        {/* Right: Pie Breakdown + Metric Cards (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 mb-2">
              <h3 className="font-bold text-sm text-primary">Schedule Distribution</h3>
              <span className="font-mono text-xs text-govSlate-500 font-semibold">
                184 Corridors
              </span>
            </div>

            <div className="h-[180px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-3 pt-3 border-t border-govSlate-100 text-xs">
              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                <span className="font-semibold text-emerald-900">On Track Within 12 Mos</span>
                <span className="font-mono font-bold text-emerald-700">136 Projects (74%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <span className="font-semibold text-red-900">At Risk / Slipped</span>
                <span className="font-mono font-bold text-red-700">48 Projects (26%)</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-govSlate-500 font-mono mt-3">
            Statutory Target Benchmark: RFCTLARR Section 25 Window
          </div>
        </div>
      </div>
    </div>
  );
}
