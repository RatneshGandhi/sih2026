import React from 'react';
import { POLICY_INSIGHTS } from '../../data/ministryData';

export default function PolicyInsights() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[26px]">lightbulb</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Policy-Level Analytics &amp; Strategic Insights
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-mono text-[10px] font-bold border border-amber-200">
              MINISTRY APEX LEVEL
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1 max-w-3xl">
            Macro-level systemic observations distilled from inter-state cadastral telemetry. Translating operational bottlenecks into actionable statutory policy interventions.
          </p>
        </div>

        <div className="text-xs font-mono text-govSlate-500 bg-govSlate-50 px-3 py-1.5 rounded-lg border border-govSlate-200 shrink-0">
          <span>Policy Interventions: <strong>4 Formulated</strong></span>
        </div>
      </div>

      {/* 4 Rich Policy Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {POLICY_INSIGHTS.map((insight) => (
          <div
            key={insight.id}
            className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Top Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-mono font-extrabold text-xs">
                    {insight.number}
                  </span>
                  <span className="text-[10px] font-mono uppercase font-bold text-govSlate-400 tracking-wider">
                    {insight.category}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-[10px] font-bold">
                  EVIDENCE-BACKED
                </span>
              </div>

              {/* Title & Headline */}
              <h3 className="font-extrabold text-base text-govSlate-900">
                💡 Insight {insight.number}: "{insight.title}"
              </h3>
              <p className="text-xs font-medium text-amber-800 mt-1">
                {insight.headline}
              </p>

              {/* Supporting Evidence Metric Blocks */}
              <div className="grid grid-cols-3 gap-2 my-4">
                {insight.supportingData.map((d, idx) => (
                  <div key={idx} className="bg-govSlate-50 p-2.5 rounded-xl border border-govSlate-100 text-center">
                    <span className="text-[10px] text-govSlate-500 block truncate">{d.label}</span>
                    <div className={`font-mono font-extrabold text-sm sm:text-base mt-0.5 ${d.color}`}>
                      {d.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Structural Sections: Evidence -> Impact -> Policy Action */}
              <div className="space-y-3 text-xs">
                {/* Evidence */}
                <div className="p-3 bg-govSlate-50 rounded-xl border border-govSlate-100">
                  <div className="flex items-center gap-1.5 font-bold text-govSlate-700 uppercase text-[10px] tracking-wider mb-0.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">analytics</span>
                    <span>Empirical Evidence</span>
                  </div>
                  <p className="text-govSlate-600 leading-relaxed">
                    {insight.evidence}
                  </p>
                </div>

                {/* Impact */}
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-1.5 font-bold text-red-800 uppercase text-[10px] tracking-wider mb-0.5">
                    <span className="material-symbols-outlined text-[14px] text-red-600">error</span>
                    <span>Systemic Impact</span>
                  </div>
                  <p className="text-red-900 leading-relaxed">
                    {insight.impact}
                  </p>
                </div>

                {/* Policy Action */}
                <div className="p-3.5 bg-linear-to-r from-primary/95 to-[#002B66] text-white rounded-xl shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-govEmerald uppercase text-[10px] tracking-widest mb-1">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    <span>Suggested Policy Action</span>
                  </div>
                  <p className="text-xs text-slate-100 font-medium leading-relaxed">
                    "{insight.policyAction}"
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-govSlate-100 flex items-center justify-between text-[11px] text-govSlate-400 font-mono">
              <span>Ref: {insight.id}</span>
              <span className="text-govEmerald font-semibold">Central Regulatory Advisory</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
