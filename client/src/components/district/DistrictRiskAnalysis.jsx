import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { DISTRICT_PROJECTS } from '../../data/districtData';

export default function DistrictRiskAnalysis({ onTriggerAction }) {
  const [selectedProjectId, setSelectedProjectId] = useState('PRJ-001');

  const project = DISTRICT_PROJECTS.find((p) => p.id === selectedProjectId) || DISTRICT_PROJECTS[0];

  const chartData = project.riskBreakdown || [];

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border-2 border-red-200 shadow-sm flex flex-col gap-5">
      {/* Top Banner & Differentiator Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-govSlate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-error font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              KEY STATUTORY DIFFERENTIATOR
            </span>
            <span className="text-xs font-mono text-govSlate-500">
              AI &amp; RULE-BASED BOTTLENECK ENGINE
            </span>
          </div>
          <h2 className="text-xl font-black text-primary tracking-tight">
            Project Risk &amp; Bottleneck Analysis
          </h2>
          <p className="text-xs text-govSlate-600 mt-0.5">
            Holistic cross-pillar risk modeling from verified cadastral land records, court encumbrances, and DBT escrow velocity.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-govSlate-700 whitespace-nowrap">Select Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-govSlate-50 border border-govSlate-300 text-govSlate-900 text-xs rounded-lg px-3 py-2 font-semibold focus:ring-2 focus:ring-primary outline-none"
          >
            {DISTRICT_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.riskLevel} - {p.riskScore}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Decision Flow Pipeline Badge */}
      <div className="bg-gradient-to-r from-primary to-govNavy text-white p-3.5 rounded-xl shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 font-bold text-govEmerald">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>CALA DECISION PIPELINE:</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 font-mono font-bold text-[11px] flex-wrap">
          <span className="bg-white/10 px-2.5 py-1 rounded text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-govEmerald"></span> VERIFIED DATA
          </span>
          <span className="text-govSlate-400">→</span>
          <span className="bg-white/10 px-2.5 py-1 rounded text-blue-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> ANALYSIS
          </span>
          <span className="text-govSlate-400">→</span>
          <span className="bg-white/10 px-2.5 py-1 rounded text-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-govAmber"></span> BOTTLENECK
          </span>
          <span className="text-govSlate-400">→</span>
          <span className="bg-govEmerald text-govNavy font-extrabold px-3 py-1 rounded shadow-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">bolt</span> RECOMMENDED ACTION
          </span>
        </div>
      </div>

      {/* Main Grid: Left Risk Score + Bottleneck KPIs | Right: Chart & Root Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 Cols): Risk Score & Critical Metrics */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Risk Score Card */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            project.riskScore >= 75 ? 'bg-red-50/50 border-red-300' :
            project.riskScore >= 45 ? 'bg-amber-50/50 border-amber-300' :
            'bg-emerald-50/50 border-emerald-300'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-govSlate-600 uppercase tracking-wider">
                  STATUTORY RISK RATING
                </span>
                <h3 className="text-base font-extrabold text-primary mt-0.5">{project.name}</h3>
                <p className="text-xs font-mono text-govSlate-500">Project Code: {project.code}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono tracking-wider ${
                project.riskScore >= 75 ? 'bg-error text-white' :
                project.riskScore >= 45 ? 'bg-amber-600 text-white' :
                'bg-govEmerald text-white'
              }`}>
                {project.riskLevel} RISK
              </span>
            </div>

            <div className="my-4 flex items-baseline gap-2">
              <span className={`text-4xl font-black font-mono font-tnum ${
                project.riskScore >= 75 ? 'text-error' :
                project.riskScore >= 45 ? 'text-amber-700' :
                'text-govEmerald'
              }`}>
                {project.riskScore}
              </span>
              <span className="text-lg font-bold text-govSlate-400">/ 100</span>
              <span className="text-xs text-govSlate-600 ml-2">
                Predicted Corridor Delay: <strong className="text-govSlate-900">{project.predictedDelay}</strong>
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-govSlate-200">
              <span className="text-[11px] font-bold text-govSlate-500 uppercase tracking-wider">
                Primary Statutoty Bottleneck:
              </span>
              <div className="text-sm font-extrabold text-error mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">block</span>
                {project.mainBottleneck}
              </div>
            </div>
          </div>

          {/* 4 Bottleneck Factor Stat Badges */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-white border border-red-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-govSlate-500">Affected Parcels</span>
              <div className="text-xl font-black text-error font-tnum mt-0.5">
                {project.disputedParcels}
              </div>
              <span className="text-[10px] text-govSlate-600">Active Title Disputes</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-orange-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-govSlate-500">Compensation Pending</span>
              <div className="text-xl font-black text-orange-700 font-tnum mt-0.5">
                {project.compPending}
              </div>
              <span className="text-[10px] text-govSlate-600">Disbursement Cases</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-govSlate-500">Verification Pending</span>
              <div className="text-xl font-black text-amber-800 font-tnum mt-0.5">
                {project.verifPending}
              </div>
              <span className="text-[10px] text-govSlate-600">7/12 &amp; Ferfar Entries</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-govSlate-500">R&amp;R Pending</span>
              <div className="text-xl font-black text-blue-700 font-tnum mt-0.5">
                {project.rrPending}
              </div>
              <span className="text-[10px] text-govSlate-600">Displaced Families</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Risk Factor Breakdown Chart + Why High Risk? */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Risk Breakdown Chart */}
          <div className="bg-white p-4 rounded-xl border border-govSlate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-govSlate-100">
              <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">bar_chart</span>
                Risk Factor Contribution Breakdown (%)
              </span>
              <span className="text-[11px] font-mono text-govSlate-500 font-semibold">
                Corridor Vulnerability Index
              </span>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 50]} unit="%" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Risk Weight']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Root-Cause Analysis: Why is this project high risk? */}
          <div className="bg-white p-4 rounded-xl border border-govSlate-200 shadow-xs">
            <span className="font-bold text-xs text-primary flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[18px] text-error">troubleshoot</span>
              Why is this project high risk?
            </span>
            <div className="space-y-1.5">
              {project.whyHighRisk.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-govSlate-800 bg-govSlate-50 p-2 rounded-lg border border-govSlate-100">
                  <span className="font-mono font-bold text-error min-w-[18px]">{idx + 1}.</span>
                  <span className="leading-snug">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Action Card (The Crown Jewel) */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">recommend</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                STATUTORY CALA MANDATE
              </span>
              <span className="text-xs font-extrabold text-amber-950">Recommended District Action</span>
            </div>
            <p className="text-sm font-bold text-govSlate-950 mt-1 leading-snug">
              &ldquo;{project.recommendedAction}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onTriggerAction && onTriggerAction('verification', project)}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-govEmerald">gavel</span>
            <span>Execute Action</span>
          </button>
        </div>
      </div>
    </div>
  );
}
