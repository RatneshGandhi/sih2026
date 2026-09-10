import React, { useState } from 'react';
import { WHY_PROJECT_AT_RISK, PREDICTIVE_DELAY_PROJECTS } from '../../data/ministryData';

export default function ProjectRiskDeepDive({ initialProject, onNavigateTab }) {
  const [selectedProjectCode, setSelectedProjectCode] = useState(
    initialProject?.id || 'PRJ-001'
  );

  const isDefaultMumbaiGoa = selectedProjectCode === 'PRJ-001';
  const activeDetail = isDefaultMumbaiGoa
    ? WHY_PROJECT_AT_RISK
    : {
        projectCode: selectedProjectCode,
        projectName: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.name || 'Corridor Alignment',
        state: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.state || 'All-India',
        district: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.district || 'Focus District',
        riskScore: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.riskScore || 80,
        riskDenominator: 100,
        riskLevel: 'HIGH RISK',
        riskBadge: 'error',
        factors: [
          { factor: 'Ownership Disputes', percentage: 32, count: 'Title conflicts & legal references', color: '#BA1A1A', description: 'Pending partition disputes in Tehsil revenue court' },
          { factor: 'Compensation Delay', percentage: 30, count: 'Solatium disbursement backlog', color: '#F2A93B', description: 'DBT validation failed for joint accounts' },
          { factor: 'Verification Issues', percentage: 22, count: 'Pending 5-pillar cadastral checks', color: '#3B82F6', description: 'Survey number sub-division pending in Land Records' },
          { factor: 'R&R Delay', percentage: 10, count: 'Housing amenities pending', color: '#8B5CF6', description: 'Resettlement site layout clearance under review' },
          { factor: 'Other Factors', percentage: 6, count: 'Statutory clearances', color: '#64748B', description: 'Forest/Utility shifting NOCs' }
        ],
        verifiedBreakdown: {
          totalParcels: 280,
          disputedParcels: 21,
          compensationPendingCases: 19,
          verificationPendingCases: 14,
          rrPendingCases: 7,
          possessionPendingPct: 35
        },
        timelinePrediction: {
          scheduledCompletion: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.expectedCompletion || 'Dec 2026',
          predictedCompletion: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.predictedCompletion || 'Feb 2027',
          slippage: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.delayFormatted || '+2 months',
          confidenceScore: '89% (Rule Engine Confidence)'
        },
        recommendedAction: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.recommendedAction || 'Review districts with prolonged compensation processing and identify administrative bottlenecks.',
        systemLogicPath: [
          { step: '1. VERIFIED DATA', detail: `Integrated revenue, cadastral GIS, and PFMS accounts for ${selectedProjectCode}.` },
          { step: '2. ANALYSIS', detail: 'Cross-checked objection registry vs statutory 12-month window.' },
          { step: '3. RISK SCORE', detail: `Calculated high composite vulnerability score.` },
          { step: '4. BOTTLENECK', detail: 'Dispute density and compensation escrow freeze detected as primary root causes.' },
          { step: '5. PREDICTION', detail: 'Timeline slippage forecasted based on historical stage resolution rates.' },
          { step: '6. RECOMMENDED ACTION', detail: PREDICTIVE_DELAY_PROJECTS.find((p) => p.id === selectedProjectCode)?.recommendedAction }
        ]
      };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header with Project Selector */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-red-600 text-[26px]">psychology</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              Root-Cause Explainability: "Why is this project at risk?"
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-mono text-[10px] font-bold border border-red-300">
              FACTOR BREAKDOWN
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1 max-w-2xl">
            NLAMS moves beyond black-box scores. Every risk rating is backed by granular cadastral evidence, bottleneck attribution, and statutory decision support.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-govSlate-500 whitespace-nowrap">Select Project:</span>
          <select
            value={selectedProjectCode}
            onChange={(e) => setSelectedProjectCode(e.target.value)}
            className="h-10 px-3 bg-govSlate-50 border border-govSlate-200 rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 max-w-xs"
          >
            {PREDICTIVE_DELAY_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.rank} {p.name} ({p.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Explainability Card */}
      <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-6 flex flex-col gap-6">
        {/* Project Profile Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-govSlate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                PROJECT: {activeDetail.projectCode}
              </span>
              <span className="text-xs text-govSlate-500 font-medium">
                {activeDetail.district}, {activeDetail.state}
              </span>
            </div>
            <h3 className="font-extrabold text-xl text-govSlate-900 mt-1">
              {activeDetail.projectName}
            </h3>
            <span className="text-xs text-govSlate-500 mt-0.5 block">
              Konkan Railway Corporation Limited (KRCL) / Implementing Agency
            </span>
          </div>

          <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-200">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-mono font-extrabold text-lg shadow-xs">
              {activeDetail.riskScore}
            </div>
            <div>
              <div className="font-mono text-[11px] font-bold text-red-900 uppercase tracking-wider">
                Risk Score: {activeDetail.riskScore} / {activeDetail.riskDenominator}
              </div>
              <span className="inline-flex items-center gap-1 font-extrabold text-sm text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                🔴 HIGH RISK
              </span>
            </div>
          </div>
        </div>

        {/* Explainability Core Breakdown ("Why?") */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-extrabold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-600">help</span>
              <span>Why is this project at high risk?</span>
            </h4>
            <span className="text-xs font-mono text-govSlate-500">
              Attribution of Risk Score {activeDetail.riskScore}/100
            </span>
          </div>

          {/* Factor percentage bar */}
          <div className="w-full h-4 rounded-full overflow-hidden flex shadow-xs border border-govSlate-200 mb-4">
            {activeDetail.factors.map((f, i) => (
              <div
                key={i}
                style={{ width: `${f.percentage}%`, backgroundColor: f.color }}
                title={`${f.factor}: ${f.percentage}%`}
                className="h-full transition-all hover:opacity-90"
              ></div>
            ))}
          </div>

          {/* Factor detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {activeDetail.factors.map((f, i) => (
              <div
                key={i}
                className="bg-govSlate-50 rounded-xl p-3.5 border border-govSlate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-govSlate-900 truncate">
                      {f.factor}
                    </span>
                    <span
                      className="font-mono font-extrabold text-sm"
                      style={{ color: f.color }}
                    >
                      {f.percentage}%
                    </span>
                  </div>
                  <div className="font-bold text-xs text-primary mt-1">
                    {f.count}
                  </div>
                  <p className="text-[11px] text-govSlate-500 mt-1 leading-snug">
                    {f.description}
                  </p>
                </div>
                <div
                  className="w-full h-1 rounded-full mt-3"
                  style={{ backgroundColor: f.color }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Metrics Grid */}
        <div className="bg-govSlate-50 rounded-xl p-4 border border-govSlate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-govSlate-500 block mb-2">
            Ground Cadastral Evidence
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-govSlate-200">
              <span className="text-govSlate-500 text-[11px]">Disputed Parcels</span>
              <div className="font-mono font-extrabold text-base text-red-600 mt-0.5">
                {activeDetail.verifiedBreakdown.disputedParcels} disputed
              </div>
              <span className="text-[10px] text-govSlate-400">Civil Reference 64</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-govSlate-200">
              <span className="text-govSlate-500 text-[11px]">Compensation Cases</span>
              <div className="font-mono font-extrabold text-base text-amber-600 mt-0.5">
                {activeDetail.verifiedBreakdown.compensationPendingCases} cases pending
              </div>
              <span className="text-[10px] text-govSlate-400">Escrow verification</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-govSlate-200">
              <span className="text-govSlate-500 text-[11px]">Verification Cases</span>
              <div className="font-mono font-extrabold text-base text-blue-600 mt-0.5">
                {activeDetail.verifiedBreakdown.verificationPendingCases} cases pending
              </div>
              <span className="text-[10px] text-govSlate-400">Mutation discrepancies</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-govSlate-200">
              <span className="text-govSlate-500 text-[11px]">R&amp;R Resettlement</span>
              <div className="font-mono font-extrabold text-base text-purple-600 mt-0.5">
                {activeDetail.verifiedBreakdown.rrPendingCases} cases pending
              </div>
              <span className="text-[10px] text-govSlate-400">Housing allotment</span>
            </div>
          </div>
        </div>

        {/* Timeline Delay Projection */}
        <div className="bg-linear-to-r from-red-50 via-amber-50 to-white p-4 rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-800 block">
              Timeline Prediction
            </span>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-govSlate-700">
                Expected: <strong>{activeDetail.timelinePrediction.scheduledCompletion}</strong>
              </span>
              <span className="text-govSlate-400">→</span>
              <span className="text-xs text-red-700 font-bold">
                Predicted: <strong>{activeDetail.timelinePrediction.predictedCompletion}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[11px] font-bold">
                Predicted Delay: {activeDetail.timelinePrediction.slippage}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-govSlate-500">
            {activeDetail.timelinePrediction.confidenceScore}
          </span>
        </div>

        {/* RECOMMENDED ACTION BANNER (Key Differentiator) */}
        <div className="bg-linear-to-r from-primary to-[#002B66] text-white p-5 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 text-govEmerald mb-1">
            <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest">
              RECOMMENDED INTERVENTION (DECISION SUPPORT)
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-extrabold text-white mt-1">
            "{activeDetail.recommendedAction}"
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Standard Operating Procedure: Convene CALA Special Revenue Bench to expedite title mutation reconciliation under Section 15(2), while releasing non-contested 80% solatium DBT to eligible co-sharers.
          </p>
        </div>

        {/* Full NLAMS Value-Chain Progression */}
        <div className="bg-govSlate-50 rounded-xl p-4 border border-govSlate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-govSlate-500 block mb-3">
            NLAMS Core Decision Logic Progression
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
            {activeDetail.systemLogicPath.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-govSlate-200 flex flex-col justify-between">
                <span className="font-mono text-[10px] font-bold text-primary block mb-1">
                  {item.step}
                </span>
                <p className="text-[11px] text-govSlate-600 leading-tight">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onNavigateTab && onNavigateTab('gis')}
            className="px-4 py-2 border border-govSlate-200 hover:bg-govSlate-50 rounded-xl text-xs font-semibold text-govSlate-700 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span>View in National GIS</span>
          </button>
          <button
            onClick={() => onNavigateTab && onNavigateTab('predictions')}
            className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Back to 18 Delayed Projects</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
