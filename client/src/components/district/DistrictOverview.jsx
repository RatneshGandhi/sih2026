import React from 'react';
import { DISTRICT_INFO, DISTRICT_KPIS } from '../../data/districtData';

export default function DistrictOverview({ kpis = DISTRICT_KPIS, info = DISTRICT_INFO }) {
  const pct = ((kpis.landAcquiredHa / kpis.landProposedHa) * 100).toFixed(1);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Sovereign District Header Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-govSlate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-xs border border-primary-container">
            <span className="material-symbols-outlined text-[28px] text-govEmerald">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-govSlate-500">
                STATE: {info.state} (READ-ONLY) • KONKAN DIVISION
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                CALA JURISDICTION ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight font-sans mt-0.5">
              RATNAGIRI DISTRICT
            </h1>
            <p className="text-xs text-govSlate-600 mt-0.5">
              {info.office} • {info.magistrateName}
            </p>
          </div>
        </div>

        {/* District Acquisition Progress Meter */}
        <div className="bg-govSlate-50 border border-govSlate-200/90 rounded-xl p-3 sm:p-4 min-w-[280px] lg:min-w-[340px] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-govEmerald">landscape</span>
              Land Acquisition Progress
            </span>
            <span className="text-xs font-extrabold font-mono text-govEmerald bg-emerald-100/80 px-2 py-0.5 rounded">
              {pct}%
            </span>
          </div>
          <div className="w-full bg-govSlate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-govEmerald h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-govSlate-600">
            <span>Acquired: <strong className="text-govSlate-900">{kpis.landAcquiredHa.toLocaleString()} Ha</strong></span>
            <span>Target: <strong className="text-govSlate-900">{kpis.landProposedHa.toLocaleString()} Ha</strong></span>
          </div>
        </div>
      </div>

      {/* 8 Required KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* KPI 1: Projects */}
        <div className="bg-white rounded-xl p-3 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-govSlate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Projects</span>
            <span className="material-symbols-outlined text-[18px] text-primary">folder_managed</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-primary font-tnum">{kpis.totalProjects}</div>
            <div className="text-[10px] text-govSlate-500 truncate">4 Key Corridors</div>
          </div>
          <span className="text-[10px] font-semibold text-govSlate-600 bg-govSlate-100 px-1.5 py-0.5 rounded w-fit">
            Active Projects
          </span>
        </div>

        {/* KPI 2: Land Proposed */}
        <div className="bg-white rounded-xl p-3 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-govSlate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Proposed</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">domain_add</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-govSlate-900 font-tnum">
              {kpis.landProposedHa.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Ha</span>
            </div>
            <div className="text-[10px] text-govSlate-500 truncate">Gazetted Notified</div>
          </div>
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
            Section 11 / 19
          </span>
        </div>

        {/* KPI 3: Land Acquired */}
        <div className="bg-white rounded-xl p-3 border border-emerald-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Acquired</span>
            <span className="material-symbols-outlined text-[18px] text-govEmerald">verified</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-govEmerald font-tnum">
              {kpis.landAcquiredHa.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Ha</span>
            </div>
            <div className="text-[10px] text-govSlate-500 truncate">Possession Affirmed</div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded w-fit">
            Section 38 Orders
          </span>
        </div>

        {/* KPI 4: Affected Families */}
        <div className="bg-white rounded-xl p-3 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-govSlate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Families</span>
            <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-primary font-tnum">
              {kpis.affectedFamilies.toLocaleString()}
            </div>
            <div className="text-[10px] text-govSlate-500 truncate">PAFs / PDFs Enrolled</div>
          </div>
          <span className="text-[10px] font-semibold text-govSlate-700 bg-govSlate-100 px-1.5 py-0.5 rounded w-fit">
            R&amp;R Census
          </span>
        </div>

        {/* KPI 5: Pending Verification */}
        <div className="bg-white rounded-xl p-3 border border-amber-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verification</span>
            <span className="material-symbols-outlined text-[18px] text-govAmber">fact_check</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-amber-900 font-tnum">{kpis.pendingVerification}</div>
            <div className="text-[10px] text-govSlate-500 truncate">7/12 &amp; Ferfar Pending</div>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded w-fit">
            Action Needed
          </span>
        </div>

        {/* KPI 6: Compensation Pending */}
        <div className="bg-white rounded-xl p-3 border border-orange-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow bg-orange-50/20">
          <div className="flex items-center justify-between text-orange-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Comp. Pending</span>
            <span className="material-symbols-outlined text-[18px] text-orange-600">payments</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-orange-700 font-tnum">{kpis.compensationPendingCases}</div>
            <div className="text-[10px] text-govSlate-500 truncate">₹17 Cr Escrow Buffer</div>
          </div>
          <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded w-fit">
            78 Cases
          </span>
        </div>

        {/* KPI 7: Disputes */}
        <div className="bg-white rounded-xl p-3 border border-red-200/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow bg-red-50/20">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disputes</span>
            <span className="material-symbols-outlined text-[18px] text-error">gavel</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-error font-tnum">{kpis.disputesCount}</div>
            <div className="text-[10px] text-govSlate-500 truncate">Tribunal / Civil Injunctions</div>
          </div>
          <span className="text-[10px] font-bold text-error bg-red-100 px-1.5 py-0.5 rounded w-fit">
            32 Active Suits
          </span>
        </div>

        {/* KPI 8: High Risk Projects */}
        <div className="bg-white rounded-xl p-3 border border-red-300 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow bg-red-50/40">
          <div className="flex items-center justify-between text-error">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk</span>
            <span className="material-symbols-outlined text-[18px] text-error">warning</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-black text-error font-tnum">{kpis.highRiskProjects}</div>
            <div className="text-[10px] text-govSlate-600 truncate">PRJ-001 &amp; PRJ-004</div>
          </div>
          <span className="text-[10px] font-extrabold text-white bg-error px-1.5 py-0.5 rounded w-fit">
            CALA Alert
          </span>
        </div>
      </div>
    </div>
  );
}
