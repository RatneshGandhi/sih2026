import React from 'react';

export default function DistrictDocumentModal({ document, isOpen, onClose }) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-govEmerald">description</span>
            <div>
              <h3 className="font-bold text-sm tracking-tight">{document.title}</h3>
              <p className="text-[11px] text-govSlate-300 font-mono">
                {document.docType} • Ref: {document.parcelId || 'STATUTORY'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-govSlate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Security & Verification Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <span className="material-symbols-outlined text-[18px] text-emerald-700">verified</span>
            <span>{document.signStatus || 'NIC-CERT Certified Sovereign Document'}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
            RFCTLARR SEC-53
          </span>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-govSlate-50 text-govSlate-800">
          <div className="p-4 bg-white border border-govSlate-200 rounded-lg shadow-inner whitespace-pre-wrap">
            {document.contentSnippet || 'Standard statutory notice text.'}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-govSlate-600 bg-white p-3 rounded-lg border border-govSlate-200">
            <div>
              <span className="font-bold text-govSlate-800">Issuing Authority:</span>
              <p>{document.issuer || 'Office of CALA, Ratnagiri'}</p>
            </div>
            <div>
              <span className="font-bold text-govSlate-800">Date of Attestation:</span>
              <p>{document.date || '10 Sep 2026'}</p>
            </div>
            <div>
              <span className="font-bold text-govSlate-800">Digital Seal:</span>
              <p className="text-govEmerald font-semibold">Valid & Tamper-Evident</p>
            </div>
            <div>
              <span className="font-bold text-govSlate-800">Cadastral Reference:</span>
              <p>{document.surveyNumber || 'Survey 103, Shirgaon'}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-govSlate-200 px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] text-govSlate-500 font-sans">
            Official Government Record • District Magistrate Repository
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 text-govSlate-700 hover:bg-govSlate-100 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Document
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
