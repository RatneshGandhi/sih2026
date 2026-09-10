import React, { useState } from 'react';
import { DISTRICT_AWARDS } from '../../data/districtData';

export default function DistrictAwardManagement({ onViewDoc, onViewParcel, onAwardDeclared }) {
  const [awards, setAwards] = useState(DISTRICT_AWARDS);
  const [reviewAwardItem, setReviewAwardItem] = useState(null);
  const [confirmDeclarationItem, setConfirmDeclarationItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmAward = () => {
    if (!confirmDeclarationItem) return;
    const targetId = confirmDeclarationItem.id;
    setAwards((prev) =>
      prev.map((a) => {
        if (a.id === targetId) {
          return {
            ...a,
            awardStatus: 'declared',
            awardStatusLabel: 'Award Declared',
            declarationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            formNotice: 'Statutory Form 11 / Sec 23 Gazette Dispatched'
          };
        }
        return a;
      })
    );

    showToast(`Statutory Award Declared under Section 23 for ${confirmDeclarationItem.affectedPerson} (Parcel ${confirmDeclarationItem.parcelId})`);
    if (onAwardDeclared) onAwardDeclared(confirmDeclarationItem);
    setConfirmDeclarationItem(null);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-govEmerald">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-primary">military_tech</span>
          <div>
            <h2 className="font-bold text-base text-primary">Statutory Award Declaration (RFCTLARR Section 23 &amp; 30)</h2>
            <p className="text-xs text-govSlate-500">
              Scrutiny and formal statutory award declaration by District Magistrate / CALA with 100% solatium and interest.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-[11px] font-semibold">
          Prototype Workflow • Does Not Legally Determine an Award Without Gazetted Seal
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-govSlate-100 text-govSlate-700 uppercase font-mono text-[10px] border-b border-govSlate-200">
            <tr>
              <th className="p-3">Award Code</th>
              <th className="p-3">Parcel &amp; Survey</th>
              <th className="p-3">Affected Person</th>
              <th className="p-3">Assessed Base</th>
              <th className="p-3">Total Solatium Award</th>
              <th className="p-3">Verification</th>
              <th className="p-3">Objection</th>
              <th className="p-3">Award Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-govSlate-200">
            {awards.map((item) => {
              const isPending = item.awardStatus === 'pending_declaration';
              return (
                <tr key={item.id} className="hover:bg-govSlate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-primary">{item.id}</td>
                  <td className="p-3">
                    <span className="font-bold text-govSlate-900">{item.parcelId}</span>
                    <span className="text-[11px] text-govSlate-500 block">({item.surveyNumber} • {item.areaHa} Ha)</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-govSlate-900">{item.affectedPerson}</div>
                    <div className="text-[10px] text-govSlate-500">{item.projectName}</div>
                  </td>
                  <td className="p-3 font-mono font-semibold text-govSlate-700">
                    ₹ {(item.baseLandValue / 100000).toFixed(2)} Lakhs
                  </td>
                  <td className="p-3 font-mono font-bold text-govEmerald">
                    ₹ {(item.totalAwardCompensation / 100000).toFixed(2)} Lakhs
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold text-[11px]">
                      <span className="material-symbols-outlined text-[15px] text-govEmerald">verified</span>
                      {item.verificationStatus}
                    </span>
                  </td>
                  <td className="p-3 text-govSlate-700 font-medium text-[11px]">
                    {item.objectionStatus}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      isPending ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {isPending ? '🟡 Pending Declaration' : '🟢 Award Declared'}
                    </span>
                    {!isPending && item.declarationDate && (
                      <span className="block text-[9px] text-govSlate-500 font-mono mt-0.5">{item.declarationDate}</span>
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewParcel && onViewParcel(item.parcelId)}
                        className="px-2 py-1 rounded bg-govSlate-100 hover:bg-govSlate-200 text-govSlate-800 font-semibold text-[11px]"
                        title="Inspect Parcel Dossier"
                      >
                        Dossier
                      </button>

                      <button
                        onClick={() => setReviewAwardItem(item)}
                        className="px-2.5 py-1 rounded bg-govSlate-100 hover:bg-govSlate-200 text-govSlate-800 font-semibold text-[11px]"
                      >
                        Review Award
                      </button>

                      <button
                        onClick={() => onViewDoc && onViewDoc(item.parcelId)}
                        className="p-1 rounded text-govSlate-500 hover:text-govEmerald"
                        title="View Statutory Documents"
                      >
                        <span className="material-symbols-outlined text-[18px]">description</span>
                      </button>

                      {isPending ? (
                        <button
                          onClick={() => setConfirmDeclarationItem(item)}
                          className="px-3 py-1 rounded bg-govEmerald hover:bg-govEmeraldDark text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">done_all</span>
                          <span>DECLARE AWARD</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-govEmerald font-bold px-2 py-1 bg-emerald-50 rounded">
                          ✓ Finalized
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Review Award Breakdown Modal */}
      {reviewAwardItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-lg w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-200">
              <div>
                <span className="font-mono text-xs font-bold text-govSlate-500">{reviewAwardItem.id}</span>
                <h3 className="font-bold text-sm text-primary">Statutory Valuation Breakdown (Sec 26 to 30)</h3>
              </div>
              <button onClick={() => setReviewAwardItem(null)} className="text-govSlate-400 hover:text-govSlate-800">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-govSlate-800">
              <div className="bg-govSlate-50 p-3 rounded-lg border border-govSlate-200">
                <p><strong>Parcel:</strong> {reviewAwardItem.parcelId} (Survey {reviewAwardItem.surveyNumber})</p>
                <p><strong>Affected Person:</strong> {reviewAwardItem.affectedPerson}</p>
                <p><strong>Area:</strong> {reviewAwardItem.areaHa} Hectares</p>
                <p><strong>Project:</strong> {reviewAwardItem.projectName}</p>
              </div>

              <div className="border border-govSlate-200 rounded-lg divide-y divide-govSlate-100 text-[11px]">
                <div className="p-2.5 flex justify-between">
                  <span className="text-govSlate-600">1. Assessed Market Value (Sec 26):</span>
                  <span className="font-mono font-bold">₹ {(reviewAwardItem.baseLandValue / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="p-2.5 flex justify-between bg-emerald-50/50">
                  <span className="text-emerald-900 font-medium">2. Solatium @ 100% (Sec 30(1)):</span>
                  <span className="font-mono font-bold text-govEmerald">+ ₹ {(reviewAwardItem.solatium100Pct / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="p-2.5 flex justify-between bg-blue-50/50">
                  <span className="text-blue-900 font-medium">3. Additional Interest @ 12% p.a. (Sec 30(3)):</span>
                  <span className="font-mono font-bold text-blue-700">+ ₹ {(reviewAwardItem.interest12Pct / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="p-2.5 flex justify-between bg-govSlate-100 font-bold text-xs">
                  <span className="text-primary">TOTAL STATUTORY AWARD (Sec 23):</span>
                  <span className="font-mono text-primary">₹ {(reviewAwardItem.totalAwardCompensation / 100000).toFixed(2)} Lakhs</span>
                </div>
              </div>

              <p className="text-[10px] text-govSlate-500 font-mono">
                Valuation certified by: {reviewAwardItem.valuationOfficer} • Gazette: {reviewAwardItem.gazetteRef}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-govSlate-200">
              <button
                onClick={() => setReviewAwardItem(null)}
                className="px-4 py-1.5 rounded-lg bg-govSlate-100 hover:bg-govSlate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Required by Prompt) */}
      {confirmDeclarationItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-primary max-w-lg w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-200">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-govEmerald">verified</span>
                <span>Confirm Statutory Award Declaration</span>
              </div>
              <button onClick={() => setConfirmDeclarationItem(null)} className="text-govSlate-400 hover:text-govSlate-800">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Confirmation details required by prompt */}
            <div className="p-4 bg-govSlate-50 rounded-xl border border-govSlate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-govSlate-200 pb-1.5">
                <span className="text-govSlate-600 font-semibold">Parcel:</span>
                <span className="font-bold text-primary">{confirmDeclarationItem.parcelId} (Survey {confirmDeclarationItem.surveyNumber})</span>
              </div>
              <div className="flex justify-between border-b border-govSlate-200 pb-1.5">
                <span className="text-govSlate-600 font-semibold">Affected Person:</span>
                <span className="font-bold text-govSlate-900">{confirmDeclarationItem.affectedPerson}</span>
              </div>
              <div className="flex justify-between border-b border-govSlate-200 pb-1.5">
                <span className="text-govSlate-600 font-semibold">Statutory Compensation:</span>
                <span className="font-mono font-extrabold text-govEmerald">
                  ₹ {(confirmDeclarationItem.totalAwardCompensation / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div className="flex justify-between border-b border-govSlate-200 pb-1.5">
                <span className="text-govSlate-600 font-semibold">Verification Status:</span>
                <span className="font-bold text-emerald-800">✅ {confirmDeclarationItem.verificationStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-govSlate-600 font-semibold">Objection Status:</span>
                <span className="font-bold text-govSlate-800">{confirmDeclarationItem.objectionStatus}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-900 font-medium">
              By confirming, you authorize dispatch of Section 23 Award notice and initiate DBT escrow transfer to the beneficiary.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-govSlate-200">
              <button
                onClick={() => setConfirmDeclarationItem(null)}
                className="px-4 py-1.5 rounded-lg border border-govSlate-300 text-xs font-semibold hover:bg-govSlate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAward}
                className="px-4 py-1.5 rounded-lg bg-govEmerald hover:bg-govEmeraldDark text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Confirm Award Declaration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
