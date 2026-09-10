import React, { useState } from 'react';
import { NATIONAL_REPORTS, NATIONAL_KPIS, MINISTRY_INFO } from '../../data/ministryData';

export default function NationalReports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  const handleGenerate = (report) => {
    setGeneratingId(report.id);
    setTimeout(() => {
      setGeneratingId(null);
      setSelectedReport(report);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-govSlate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-govSlate-50 border-b border-govSlate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">description</span>
                <span className="font-bold text-sm text-primary">
                  Official Dossier Preview: {selectedReport.code}
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-lg hover:bg-govSlate-200 flex items-center justify-center text-govSlate-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Document Body (Printable Official Style) */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-govSlate-800 font-sans">
              {/* Official Emblazonment */}
              <div className="text-center pb-4 border-b-2 border-primary/40">
                <div className="text-[11px] font-bold uppercase tracking-widest text-govSlate-500">
                  GOVERNMENT OF INDIA • MINISTRY OF RURAL DEVELOPMENT
                </div>
                <h2 className="text-lg font-extrabold text-primary uppercase tracking-tight mt-1">
                  {selectedReport.title}
                </h2>
                <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-govSlate-500 mt-1">
                  <span>Dossier: {selectedReport.code}</span>
                  <span>•</span>
                  <span>Date: {selectedReport.date}</span>
                  <span>•</span>
                  <span>Scope: {selectedReport.scope}</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-1">
                  1. Executive Cadastral Summary
                </h4>
                <p className="text-govSlate-700 leading-relaxed">
                  This statutory oversight dossier consolidates national land acquisition velocity across {NATIONAL_KPIS.totalProjects} major corridors under the RFCTLARR Act, 2013. The aggregate national acquisition stands at {NATIONAL_KPIS.acquisitionProgressPct}% ({NATIONAL_KPIS.landAcquiredHa.toLocaleString()} Ha of {NATIONAL_KPIS.landProposedHa.toLocaleString()} Ha proposed). Total direct benefit transfer (DBT) solatium released amounts to ₹{NATIONAL_KPIS.compensationDisbursedCr.toLocaleString()} Cr.
                </p>
              </div>

              {/* Key Highlights Table */}
              <div className="bg-govSlate-50 rounded-xl p-4 border border-govSlate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-3">
                  2. Sovereign Key Performance Indicators
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-govSlate-200">
                    <span className="text-[10px] text-govSlate-500 block">Total Corridors</span>
                    <strong className="text-base font-mono text-primary">{NATIONAL_KPIS.totalProjects}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-govSlate-200">
                    <span className="text-[10px] text-govSlate-500 block">Acquisition Progress</span>
                    <strong className="text-base font-mono text-govEmerald">{NATIONAL_KPIS.acquisitionProgressPct}%</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-govSlate-200">
                    <span className="text-[10px] text-govSlate-500 block">DBT Disbursed</span>
                    <strong className="text-base font-mono text-primary">₹{NATIONAL_KPIS.compensationDisbursedCr} Cr</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-govSlate-200">
                    <span className="text-[10px] text-govSlate-500 block">At-Risk Corridors</span>
                    <strong className="text-base font-mono text-red-600">{NATIONAL_KPIS.highRiskProjectsCount}</strong>
                  </div>
                </div>
              </div>

              {/* Regulatory Directives */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-1">
                  3. Central Policy Directives
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-govSlate-700 leading-relaxed">
                  <li>Direct District Collectors to prioritize fast-track reconciliation for the 18 corridors forecasted to miss statutory deadlines.</li>
                  <li>Mandate automated escrow-to-DBT release for approved Section 23 awards pending past 60 days.</li>
                  <li>Enforce 5-pillar digital cadastral verification before issuing Section 11 preliminary notifications.</li>
                </ul>
              </div>

              {/* Digital Certification Stamp */}
              <div className="pt-4 border-t border-govSlate-200 flex items-center justify-between text-[11px] text-govSlate-500 font-mono">
                <div>
                  Certified by: {MINISTRY_INFO.official}<br />
                  {MINISTRY_INFO.ministry}
                </div>
                <div className="text-right">
                  NIC-CERT Hash: SHA256:7B88A4E1...<br />
                  {MINISTRY_INFO.dataClassification}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3 bg-govSlate-50 border-t border-govSlate-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Official Brief</span>
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 border border-govSlate-200 hover:bg-govSlate-100 text-govSlate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">description</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Cadastral Reports &amp; Dossiers
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-white font-mono text-[10px] font-bold">
              OFFICIAL CENTRAL ARCHIVE
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Automated generation of statutory compliance briefs, state performance audits, and high-risk corridor dossiers for cabinet-level decision support.
          </p>
        </div>

        <div className="text-xs font-mono text-govSlate-500 bg-govSlate-50 px-3 py-1.5 rounded-lg border border-govSlate-200">
          <span>Available Reports: <strong>{NATIONAL_REPORTS.length} Standard Briefs</strong></span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NATIONAL_REPORTS.map((rep) => (
          <div
            key={rep.id}
            className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-govSlate-100 mb-2">
                <span className="font-mono text-[10px] font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                  {rep.code}
                </span>
                <span className="text-[10px] font-mono text-govSlate-400">
                  {rep.date}
                </span>
              </div>

              <h3 className="font-bold text-sm text-govSlate-900 mt-1">
                {rep.title}
              </h3>
              <p className="text-xs text-govSlate-500 mt-1">
                Scope: <strong>{rep.scope}</strong>
              </p>

              <div className="flex items-center gap-2 text-[11px] text-govSlate-400 font-mono mt-3">
                <span>{rep.format}</span>
                <span>•</span>
                <span>{rep.pages} Pages</span>
              </div>
            </div>

            <button
              onClick={() => handleGenerate(rep)}
              disabled={generatingId === rep.id}
              className="mt-4 w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {generatingId === rep.id ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Compiling Dossier...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Generate &amp; Inspect Dossier</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
