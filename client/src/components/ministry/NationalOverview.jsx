import React from 'react';
import { NATIONAL_KPIS, MINISTRY_INFO } from '../../data/ministryData';

export default function NationalOverview({ onNavigateTab }) {
  const kpi = NATIONAL_KPIS;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner: National Sovereign Command Title */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[28px] text-govEmerald">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-xl sm:text-2xl text-primary tracking-tight font-sans">
                NATIONAL LAND ACQUISITION OVERVIEW
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                INDIA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                PM-GATISHAKTI INTEGRATED
              </span>
            </div>
            <p className="text-xs text-govSlate-600 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>{MINISTRY_INFO.ministry}</span>
              <span className="text-govSlate-300">•</span>
              <span className="font-mono text-[11px] text-primary font-semibold">RFCTLARR ACT, 2013 REGIME</span>
              <span className="text-govSlate-300">•</span>
              <span className="text-govSlate-500">Live National Oversight Cadastre</span>
            </p>
          </div>
        </div>

        {/* Prototype Transparency & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 self-start lg:self-auto">
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[11px] font-mono text-amber-900 font-semibold">
              SYNTHETIC SIH PROTOTYPE
            </span>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('gis')}
            className="h-9 px-3.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span>Open National GIS</span>
          </button>
        </div>
      </div>

      {/* Prominent National Acquisition Progress Bar */}
      <div className="bg-linear-to-r from-primary via-[#00224D] to-[#0A2647] rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-govEmerald uppercase">
              Consolidated Sovereign Metric
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mt-0.5">
              Land Acquisition Progress — All India
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Aggregate statutory transfer across all notified corridors and infrastructure assets.
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
              {kpi.acquisitionProgressPct}%
            </div>
            <div className="text-right text-xs font-mono text-slate-300">
              <span className="text-white font-bold">{kpi.landAcquiredHa.toLocaleString()} Ha</span> / {kpi.landProposedHa.toLocaleString()} Ha
            </div>
          </div>
        </div>

        {/* Multi-segment Progress bar */}
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/20">
          <div
            className="bg-linear-to-r from-govEmerald to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${kpi.acquisitionProgressPct}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] text-slate-300 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Acquired: <strong>{kpi.landAcquiredHa.toLocaleString()} Ha</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Pending: <strong>{(kpi.landProposedHa - kpi.landAcquiredHa).toLocaleString()} Ha</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Total Corridors: <strong>{kpi.totalProjects} Projects</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Tracked States: <strong>{kpi.totalStatesTracked} States</strong></span>
          </div>
        </div>
      </div>

      {/* 10 Sovereign KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Projects */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Total Projects</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">folder_open</span>
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary font-mono tracking-tight">
              {kpi.totalProjects}
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Across 12 States &amp; 148 Districts
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('comparison')}
            className="text-[11px] font-semibold text-primary hover:text-govEmerald flex items-center gap-0.5 pt-1 border-t border-govSlate-100"
          >
            <span>State Breakdown</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* KPI 2: Land Proposed */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Land Proposed</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">crop_square</span>
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-govSlate-900 font-mono tracking-tight">
              {kpi.landProposedHa.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Ha</span>
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Total Gazetted Acquisition Scope
            </div>
          </div>
          <div className="text-[10px] text-govSlate-400 font-mono pt-1 border-t border-govSlate-100">
            Section 11 Preliminary Notified
          </div>
        </div>

        {/* KPI 3: Land Acquired */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Land Acquired</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              {kpi.acquisitionProgressPct}%
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-govEmerald font-mono tracking-tight">
              {kpi.landAcquiredHa.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Ha</span>
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Section 19 Vesting Completed
            </div>
          </div>
          <div className="w-full bg-govSlate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-govEmerald h-full rounded-full" style={{ width: `${kpi.acquisitionProgressPct}%` }}></div>
          </div>
        </div>

        {/* KPI 4: Affected Families (PAFs) */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Affected Families</span>
            <span className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">groups</span>
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary font-mono tracking-tight">
              {kpi.affectedFamilies.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">PAFs</span>
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Survey &amp; SIA Census Matched
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('rr')}
            className="text-[11px] font-semibold text-primary hover:text-govEmerald flex items-center gap-0.5 pt-1 border-t border-govSlate-100"
          >
            <span>Inspect R&amp;R Census</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* KPI 5: Notifications */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Notifications</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">feed</span>
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-govSlate-900 font-mono tracking-tight">
              {kpi.notificationsCount}
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Section 11 Gazetted Notices
            </div>
          </div>
          <div className="text-[10px] text-govSlate-400 font-mono pt-1 border-t border-govSlate-100">
            88% Progressed to Sec 19
          </div>
        </div>

        {/* KPI 6: Awards Declared */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Awards Declared</span>
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">military_tech</span>
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary font-mono tracking-tight">
              {kpi.awardsDeclared}
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Section 23 Statutory Awards
            </div>
          </div>
          <div className="text-[10px] text-govSlate-400 font-mono pt-1 border-t border-govSlate-100">
            Avg Duration: 7.2 months
          </div>
        </div>

        {/* KPI 7: Compensation Disbursed */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Compensation Flow</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              91.5% DBT
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-govEmerald font-mono tracking-tight">
              ₹{kpi.compensationDisbursedCr.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Cr</span>
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Assessed: ₹{kpi.compensationAssessedCr.toLocaleString()} Cr
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('compensation')}
            className="text-[11px] font-semibold text-primary hover:text-govEmerald flex items-center gap-0.5 pt-1 border-t border-govSlate-100"
          >
            <span>Pending: ₹{kpi.compensationPendingCr} Cr</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* KPI 8: R&R Completed */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">R&amp;R Completed</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
              Sec 31-38
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary font-mono tracking-tight">
              {kpi.rrCompletedPct}%
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Pending Resettlement: {kpi.rrPendingPct}%
            </div>
          </div>
          <div className="w-full bg-govSlate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${kpi.rrCompletedPct}%` }}></div>
          </div>
        </div>

        {/* KPI 9: Possession Completed */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Possession Taken</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              Sec 38
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-govSlate-900 font-mono tracking-tight">
              {kpi.possessionCompletedPct}%
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              Handover Certified: 26,070 Ha
            </div>
          </div>
          <div className="w-full bg-govSlate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-govEmerald h-full rounded-full" style={{ width: `${kpi.possessionCompletedPct}%` }}></div>
          </div>
        </div>

        {/* KPI 10: Timeline Adherence */}
        <div className="bg-white rounded-xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-govSlate-500">Timeline Adherence</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-mono text-[10px] font-bold">
              {kpi.delayedPct}% Delayed
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary font-mono tracking-tight">
              {kpi.timelineAdherencePct}%
            </div>
            <div className="text-[11px] text-govSlate-500 mt-0.5">
              18 High-Risk Slipped Corridors
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('predictions')}
            className="text-[11px] font-semibold text-error hover:underline flex items-center gap-0.5 pt-1 border-t border-govSlate-100"
          >
            <span>Predictive Delay Engine</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Strategic Command Triad Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Triad 1: Predictive Delay Callout */}
        <div className="bg-linear-to-br from-red-50/70 to-white p-4 rounded-xl border border-red-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono text-[10px] font-bold">
                CRITICAL PREDICTIVE ALERT
              </span>
              <span className="material-symbols-outlined text-red-600 text-[20px]">psychology</span>
            </div>
            <h3 className="font-bold text-sm text-govSlate-900">
              18 Projects Likely to Miss Statutory Deadlines
            </h3>
            <p className="text-xs text-govSlate-600 mt-1">
              Automated rule-based delay engine detected critical bottlenecks in title disputes, solatium objections, and R&amp;R consensus.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('predictions')}
            className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold self-start flex items-center gap-1 transition-colors"
          >
            <span>Inspect 18 At-Risk Projects</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* Triad 2: 5-Tier GIS Drill-Down Callout */}
        <div className="bg-linear-to-br from-blue-50/70 to-white p-4 rounded-xl border border-blue-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                5-TIER CADASTRE DRILL-DOWN
              </span>
              <span className="material-symbols-outlined text-blue-600 text-[20px]">layers</span>
            </div>
            <h3 className="font-bold text-sm text-govSlate-900">
              India → State → District → Project → Parcel
            </h3>
            <p className="text-xs text-govSlate-600 mt-1">
              Seamless central oversight down to individual disputed plots (e.g. Maharashtra → Ratnagiri → Mumbai-Goa Railway → Parcel P103).
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('gis')}
            className="mt-3 px-3 py-1.5 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold self-start flex items-center gap-1 transition-colors"
          >
            <span>Launch GIS Drill-Down</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* Triad 3: Policy Insights Callout */}
        <div className="bg-linear-to-br from-amber-50/70 to-white p-4 rounded-xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">
                CENTRAL POLICY ENGINE
              </span>
              <span className="material-symbols-outlined text-amber-600 text-[20px]">lightbulb</span>
            </div>
            <h3 className="font-bold text-sm text-govSlate-900">
              Actionable Policy Decision Support
            </h3>
            <p className="text-xs text-govSlate-600 mt-1">
              Data-backed interventions: Dispute resolution timelines (19m vs 11m), DBT escrow streamlining, and parallel R&amp;R milestones.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('policy')}
            className="mt-3 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold self-start flex items-center gap-1 transition-colors"
          >
            <span>View Policy Insights</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
