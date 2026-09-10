import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { DISTRICT_FINANCIALS, DISTRICT_COMPENSATION_RECORDS, DISTRICT_PROJECTS, DISTRICT_INFO } from '../../data/districtData';

export default function DistrictCompensation({ onViewParcel }) {
  const [filterProject, setFilterProject] = useState('all');
  const [filterVillage, setFilterVillage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStage, setFilterStage] = useState('all');

  const chartData = [
    { name: 'Assessed', amount: DISTRICT_FINANCIALS.assessedCr, color: '#132A4C' },
    { name: 'Approved', amount: DISTRICT_FINANCIALS.approvedCr, color: '#3B82F6' },
    { name: 'Disbursed', amount: DISTRICT_FINANCIALS.disbursedCr, color: '#0E9F6E' },
    { name: 'Pending', amount: DISTRICT_FINANCIALS.pendingCr, color: '#EA580C' }
  ];

  const filteredRecords = useMemo(() => {
    return DISTRICT_COMPENSATION_RECORDS.filter((r) => {
      if (filterProject !== 'all' && r.projectId !== filterProject) return false;
      if (filterVillage !== 'all' && r.village !== filterVillage) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterStage !== 'all' && !r.paymentStage.toLowerCase().includes(filterStage.toLowerCase())) return false;
      return true;
    });
  }, [filterProject, filterVillage, filterStatus, filterStage]);

  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-primary">payments</span>
          <div>
            <h2 className="font-bold text-base text-primary">District Compensation Monitoring &amp; DBT Ledger</h2>
            <p className="text-xs text-govSlate-500">
              Statutory solatium reconciliation, escrow accounts, PFMS direct benefit transfer velocity, and pending disbursal tracking.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
          ₹ {DISTRICT_FINANCIALS.disbursedCr} Cr Disbursed (81.6%)
        </span>
      </div>

      {/* District-Level Financial Summary (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Assessed */}
        <div className="p-4 rounded-xl border border-govSlate-200 bg-govSlate-50">
          <span className="text-[11px] font-bold uppercase text-govSlate-500">Assessed Compensation</span>
          <div className="text-2xl font-black text-primary font-tnum mt-1">
            ₹ {DISTRICT_FINANCIALS.assessedCr} <span className="text-sm font-normal text-govSlate-500">Cr</span>
          </div>
          <span className="text-[10px] text-govSlate-500 mt-1 block">Total Market + Solatium Valuations</span>
        </div>

        {/* Approved */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
          <span className="text-[11px] font-bold uppercase text-blue-800">Approved by CALA</span>
          <div className="text-2xl font-black text-blue-900 font-tnum mt-1">
            ₹ {DISTRICT_FINANCIALS.approvedCr} <span className="text-sm font-normal text-govSlate-500">Cr</span>
          </div>
          <span className="text-[10px] text-blue-700 mt-1 block">Sec 23 Statutory Awards Declared</span>
        </div>

        {/* Disbursed */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
          <span className="text-[11px] font-bold uppercase text-emerald-800">Disbursed (Direct DBT)</span>
          <div className="text-2xl font-black text-govEmerald font-tnum mt-1">
            ₹ {DISTRICT_FINANCIALS.disbursedCr} <span className="text-sm font-normal text-govSlate-500">Cr</span>
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block">Aadhaar PFMS Beneficiary Credits</span>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/40">
          <span className="text-[11px] font-bold uppercase text-orange-800">Pending Disbursal</span>
          <div className="text-2xl font-black text-orange-700 font-tnum mt-1">
            ₹ {DISTRICT_FINANCIALS.pendingCr} <span className="text-sm font-normal text-govSlate-500">Cr</span>
          </div>
          <span className="text-[10px] text-orange-700 mt-1 block">Held in Escrow (Disputes &amp; KYC)</span>
        </div>
      </div>

      {/* Financial Comparison Chart (Recharts) */}
      <div className="p-4 rounded-xl border border-govSlate-200 bg-white">
        <span className="text-xs font-bold text-primary block mb-2">
          Statutory Capital Distribution (Assessed vs Approved vs Disbursed vs Pending)
        </span>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 600 }} />
              <YAxis unit=" Cr" tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                formatter={(val) => [`₹ ${val} Crores`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-200 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        {/* Project */}
        <div className="flex flex-col min-w-[150px]">
          <span className="text-[10px] font-bold text-govSlate-500 uppercase">Project</span>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-white border border-govSlate-300 rounded px-2 py-1 font-semibold text-xs outline-none"
          >
            <option value="all">All Projects</option>
            {DISTRICT_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Village */}
        <div className="flex flex-col min-w-[120px]">
          <span className="text-[10px] font-bold text-govSlate-500 uppercase">Village</span>
          <select
            value={filterVillage}
            onChange={(e) => setFilterVillage(e.target.value)}
            className="bg-white border border-govSlate-300 rounded px-2 py-1 font-semibold text-xs outline-none"
          >
            <option value="all">All Villages</option>
            {DISTRICT_INFO.villages.filter((v) => v !== 'All').map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col min-w-[120px]">
          <span className="text-[10px] font-bold text-govSlate-500 uppercase">Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-govSlate-300 rounded px-2 py-1 font-semibold text-xs outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="disbursed">🟢 Disbursed</option>
            <option value="approved">🟡 Approved / Pending</option>
            <option value="pending">🔴 Pending</option>
            <option value="in_process">🟠 In Process</option>
            <option value="disputed">🔴 Disputed</option>
          </select>
        </div>

        {/* Payment Stage */}
        <div className="flex flex-col min-w-[140px]">
          <span className="text-[10px] font-bold text-govSlate-500 uppercase">Payment Stage</span>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="bg-white border border-govSlate-300 rounded px-2 py-1 font-semibold text-xs outline-none"
          >
            <option value="all">All Stages</option>
            <option value="dbt">DBT Direct Credit</option>
            <option value="mandate">PFMS Mandate</option>
            <option value="court">Court Dispute Hold</option>
            <option value="tranche">Tranche Cleared</option>
          </select>
        </div>

        <div className="ml-auto self-end">
          <button
            onClick={() => {
              setFilterProject('all');
              setFilterVillage('all');
              setFilterStatus('all');
              setFilterStage('all');
            }}
            className="text-xs text-govSlate-500 hover:text-primary underline font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Parcel Compensation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-govSlate-100 text-govSlate-700 uppercase font-mono text-[10px] border-b border-govSlate-200">
            <tr>
              <th className="p-3">Parcel</th>
              <th className="p-3">Affected Person</th>
              <th className="p-3">Assessed Amount</th>
              <th className="p-3">Approved Amount</th>
              <th className="p-3">Disbursed Amount</th>
              <th className="p-3">Payment Stage</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-govSlate-200">
            {filteredRecords.map((rec) => {
              const isDisbursed = rec.status === 'disbursed';
              const isPending = rec.status === 'pending';
              const isDisputed = rec.status === 'disputed';

              return (
                <tr key={rec.parcelId} className="hover:bg-govSlate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-primary">
                    {rec.parcelId}
                    <span className="block text-[10px] font-normal text-govSlate-500">{rec.surveyNumber} • {rec.village}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-govSlate-900">{rec.affectedPerson}</div>
                    <div className="text-[10px] text-govSlate-500 truncate max-w-xs">{rec.projectName}</div>
                  </td>
                  <td className="p-3 font-mono font-semibold text-govSlate-800">
                    ₹ {(rec.assessedAmount / 100000).toFixed(1)}L
                  </td>
                  <td className="p-3 font-mono font-semibold text-primary">
                    ₹ {(rec.approvedAmount / 100000).toFixed(1)}L
                  </td>
                  <td className="p-3 font-mono font-bold text-govEmerald">
                    ₹ {(rec.disbursedAmount / 100000).toFixed(1)}L
                  </td>
                  <td className="p-3 text-govSlate-700 text-[11px]">
                    <span className="font-medium">{rec.paymentStage}</span>
                    <span className="block text-[10px] text-govSlate-500">{rec.bank}</span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDisbursed ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      isPending || isDisputed ? 'bg-red-100 text-error border border-red-200' :
                      'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {isDisbursed ? '🟢 Disbursed' : isPending ? '🔴 Pending' : isDisputed ? '🔴 Contested' : '🟡 In Process'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onViewParcel && onViewParcel(rec.parcelId)}
                      className="px-2.5 py-1 rounded bg-govSlate-100 hover:bg-govSlate-200 text-primary font-semibold text-[11px]"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
