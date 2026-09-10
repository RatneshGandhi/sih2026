import React, { useState } from 'react';
import { DISTRICT_PARCELS } from '../../data/districtData';

export default function DistrictVerification({ onViewDoc, onViewParcel }) {
  const [selectedCaseModal, setSelectedCaseModal] = useState(null);
  const [historyModalParcel, setHistoryModalParcel] = useState(null);
  const [actionSuccessToast, setActionSuccessToast] = useState(null);

  const handleSendVerification = (parcel, actionType) => {
    setSelectedCaseModal({ parcel, actionType });
  };

  const confirmVerificationAction = (remarks) => {
    setActionSuccessToast(`Statutory action recorded for ${selectedCaseModal.parcel.id}: "${remarks || 'Forwarded to Circle Officer'}"`);
    setSelectedCaseModal(null);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-4">
      {/* Toast Alert */}
      {actionSuccessToast && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-govEmerald">check_circle</span>
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-primary">fact_check</span>
          <div>
            <h2 className="font-bold text-base text-primary">Land Record Verification &amp; 5-Pillar Scrutiny</h2>
            <p className="text-xs text-govSlate-500">
              Cross-verification against RoR (7/12), Sub-Registrar Deeds, Ferfar Mutations, Cadastral Tippen, and Court Injunctions.
            </p>
          </div>
        </div>

        {/* Legal Exception Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-amber-700">security</span>
          <span>Digital Workflow Layer Only • Does Not Legally Determine Ownership</span>
        </div>
      </div>

      {/* 5 Exception Cases Guide Strip */}
      <div className="bg-govSlate-50 p-3 rounded-xl border border-govSlate-200 text-[11px] grid grid-cols-1 sm:grid-cols-5 gap-2">
        <div className="p-2 rounded bg-white border border-govSlate-200">
          <span className="font-bold text-govEmerald block">Case 1: Consistent</span>
          <span className="text-govSlate-600">🟢 Verified</span>
        </div>
        <div className="p-2 rounded bg-white border border-govSlate-200">
          <span className="font-bold text-govSlate-700 block">Case 2: Unavailable</span>
          <span className="text-govSlate-600">⚫ Manual Case Reqd</span>
        </div>
        <div className="p-2 rounded bg-white border border-govSlate-200">
          <span className="font-bold text-govAmber block">Case 3: Mutation Pending</span>
          <span className="text-govSlate-600">🟠 Revenue Verify</span>
        </div>
        <div className="p-2 rounded bg-white border border-govSlate-200">
          <span className="font-bold text-orange-700 block">Case 4: Deceased Owner</span>
          <span className="text-govSlate-600">🟠 Succession Review (No Auto Heir)</span>
        </div>
        <div className="p-2 rounded bg-white border border-govSlate-200">
          <span className="font-bold text-error block">Case 5: Multiple Claims</span>
          <span className="text-govSlate-600">🔴 Legal Review Required</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-govSlate-100 text-govSlate-700 uppercase font-mono text-[10px] border-b border-govSlate-200">
            <tr>
              <th className="p-3">Parcel / Survey</th>
              <th className="p-3">Rights Holder</th>
              <th className="p-3">RoR (7/12)</th>
              <th className="p-3">Registration</th>
              <th className="p-3">Mutation</th>
              <th className="p-3">Cadastral Map</th>
              <th className="p-3">Dispute Check</th>
              <th className="p-3">Overall Status</th>
              <th className="p-3 text-right">Statutory Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-govSlate-200">
            {DISTRICT_PARCELS.map((p) => {
              const v = p.verification;
              return (
                <tr key={p.id} className="hover:bg-govSlate-50/80 transition-colors">
                  {/* Parcel & Survey */}
                  <td className="p-3">
                    <div className="font-mono font-bold text-primary">{p.id}</div>
                    <div className="text-[11px] text-govSlate-600">{p.surveyNumber} ({p.village})</div>
                  </td>

                  {/* Rights Holder */}
                  <td className="p-3">
                    <div className="font-bold text-govSlate-900">{p.rightsHolder}</div>
                    <div className="text-[10px] text-govSlate-500 font-mono">{p.areaHa} Ha • {p.projectName}</div>
                  </td>

                  {/* RoR */}
                  <td className="p-3">
                    {v.ror.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-govEmerald font-semibold">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-govSlate-500 font-semibold">
                        <span className="material-symbols-outlined text-[15px]">cancel</span> Unavailable
                      </span>
                    )}
                  </td>

                  {/* Registration */}
                  <td className="p-3">
                    {v.registration.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-govEmerald font-semibold">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span> Verified
                      </span>
                    ) : (
                      <span className="text-govAmber font-semibold">Pending</span>
                    )}
                  </td>

                  {/* Mutation */}
                  <td className="p-3">
                    {v.mutation.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-govEmerald font-semibold">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span> Verified
                      </span>
                    ) : v.mutation.status === 'succession_pending' ? (
                      <span className="inline-flex items-center gap-1 text-orange-700 font-semibold" title={v.mutation.note}>
                        <span className="material-symbols-outlined text-[15px]">family_restroom</span> Succession
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-govAmber font-semibold" title={v.mutation.note}>
                        <span className="material-symbols-outlined text-[15px]">warning</span> Pending
                      </span>
                    )}
                  </td>

                  {/* Cadastral Map */}
                  <td className="p-3">
                    {v.cadastralMap.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-govEmerald font-semibold">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-error font-semibold">
                        <span className="material-symbols-outlined text-[15px]">error</span> Mismatch
                      </span>
                    )}
                  </td>

                  {/* Dispute Check */}
                  <td className="p-3">
                    {v.disputeCheck.status === 'conflict' ? (
                      <span className="inline-flex items-center gap-1 text-error font-extrabold" title={v.disputeCheck.note}>
                        <span className="material-symbols-outlined text-[15px]">gavel</span> Conflict
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-govEmerald font-semibold">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span> Clear
                      </span>
                    )}
                  </td>

                  {/* Overall Verification Status */}
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      v.overall.badge === 'error' ? 'bg-red-100 text-error border border-red-200' :
                      v.overall.badge === 'warning' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                      v.overall.badge === 'neutral' ? 'bg-govSlate-200 text-govSlate-800' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {v.overall.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewParcel && onViewParcel(p.id)}
                        className="px-2 py-1 rounded bg-govSlate-100 hover:bg-govSlate-200 text-govSlate-800 font-semibold text-[11px]"
                        title="View Complete Verification Records"
                      >
                        View Records
                      </button>

                      <button
                        onClick={() => handleSendVerification(p, v.overall.recommendedAction)}
                        className={`px-2.5 py-1 rounded font-bold text-[11px] text-white shadow-2xs ${
                          v.overall.badge === 'error' ? 'bg-error hover:bg-red-700' :
                          v.overall.badge === 'warning' ? 'bg-amber-700 hover:bg-amber-800' :
                          'bg-primary hover:bg-primary-container'
                        }`}
                      >
                        {v.overall.code === 'CASE_5' ? 'Legal Review' :
                         v.overall.code === 'CASE_4' ? 'Review Succession' :
                         v.overall.code === 'CASE_3' ? 'Revenue Verify' :
                         v.overall.code === 'CASE_2' ? 'Manual Case' :
                         'Send for Verification'}
                      </button>

                      <button
                        onClick={() => onViewDoc && onViewDoc(p.id)}
                        className="p-1 rounded text-govSlate-600 hover:text-govEmerald hover:bg-emerald-50"
                        title="View Statutory Documents"
                      >
                        <span className="material-symbols-outlined text-[18px]">description</span>
                      </button>

                      <button
                        onClick={() => setHistoryModalParcel(p)}
                        className="p-1 rounded text-govSlate-600 hover:text-primary hover:bg-govSlate-100"
                        title="View Scrutiny History"
                      >
                        <span className="material-symbols-outlined text-[18px]">history</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Send for Verification Action Modal */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-lg w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-200">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-govAmber">gavel</span>
                <span>Initiate Statutory Verification Requisition</span>
              </div>
              <button onClick={() => setSelectedCaseModal(null)} className="text-govSlate-400 hover:text-govSlate-800">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="text-xs space-y-2 text-govSlate-700">
              <div className="p-3 bg-govSlate-50 rounded-lg border border-govSlate-200">
                <p><strong>Parcel ID:</strong> {selectedCaseModal.parcel.id} (Survey {selectedCaseModal.parcel.surveyNumber})</p>
                <p><strong>Rights Holder:</strong> {selectedCaseModal.parcel.rightsHolder}</p>
                <p><strong>Trigger Code:</strong> {selectedCaseModal.parcel.verification.overall.code}</p>
                <p><strong>Current Status:</strong> {selectedCaseModal.parcel.verification.overall.status}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-900">
                <strong>Statutory Notice:</strong> This action dispatches a formal requisition to the Sub-Divisional Officer (SDO) or Tahsildar. System does not automatically assign title.
              </div>

              <label className="block font-bold text-govSlate-800 text-xs">CALA Officer Remarks / Instructions:</label>
              <textarea
                id="calaVerificationRemarks"
                rows={3}
                defaultValue={`Requisition for ${selectedCaseModal.actionType} under RFCTLARR Act guidelines. Verify physical village record extract and confirm pedigree.`}
                className="w-full bg-govSlate-50 border border-govSlate-300 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-govSlate-200">
              <button
                onClick={() => setSelectedCaseModal(null)}
                className="px-3 py-1.5 rounded-lg border border-govSlate-300 text-xs font-semibold hover:bg-govSlate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = document.getElementById('calaVerificationRemarks')?.value;
                  confirmVerificationAction(val);
                }}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-xs"
              >
                Submit Requisition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModalParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-md w-full p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-200">
              <h3 className="font-bold text-sm text-primary">Verification Audit History</h3>
              <button onClick={() => setHistoryModalParcel(null)} className="text-govSlate-400 hover:text-govSlate-800">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="border-l-2 border-primary pl-3">
                <span className="font-mono text-[10px] text-govSlate-500">12 Aug 2026, 11:20 AM</span>
                <p className="font-bold text-govSlate-900">7/12 Extract Ingested via e-Mahabhumi</p>
                <p className="text-govSlate-600 text-[11px]">RoR digital record matched. Ferfar entry 1841 flagged with Civil Suit injunction.</p>
              </div>
              <div className="border-l-2 border-govEmerald pl-3">
                <span className="font-mono text-[10px] text-govSlate-500">14 Aug 2026, 03:45 PM</span>
                <p className="font-bold text-govSlate-900">Registration Deed Cross-Checked</p>
                <p className="text-govSlate-600 text-[11px]">Sale deed 4421/2014 verified by SRO Ratnagiri.</p>
              </div>
              <div className="border-l-2 border-error pl-3">
                <span className="font-mono text-[10px] text-govSlate-500">20 Aug 2026, 09:30 AM</span>
                <p className="font-bold text-error">Objection Registered under Section 15</p>
                <p className="text-govSlate-600 text-[11px]">Co-owner filed boundary objection OB-103.</p>
              </div>
            </div>
            <div className="pt-2 border-t border-govSlate-200 text-right">
              <button
                onClick={() => setHistoryModalParcel(null)}
                className="px-4 py-1.5 rounded-lg bg-govSlate-100 hover:bg-govSlate-200 text-xs font-semibold"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
