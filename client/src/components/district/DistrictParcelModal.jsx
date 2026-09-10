import React from 'react';

export default function DistrictParcelModal({ parcel, isOpen, onClose, onViewDoc, onOpenAction }) {
  if (!isOpen || !parcel) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'acquired':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-govEmerald', label: 'Acquired' };
      case 'disputed':
        return { bg: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-error', label: 'Disputed' };
      case 'compensation_pending':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-govAmber', label: 'Compensation Pending' };
      case 'verification_pending':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-600', label: 'Verification Pending' };
      case 'under_process':
      default:
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-govAmber', label: 'Under Process' };
    }
  };

  const badge = getStatusBadge(parcel.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-govEmerald">
              <span className="material-symbols-outlined text-[24px]">pin_drop</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Parcel Dossier: {parcel.id}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                  {parcel.statusLabel || badge.label}
                </span>
              </div>
              <p className="text-xs text-govSlate-300">
                Survey No: {parcel.surveyNumber} • {parcel.village} Village, {parcel.taluka} Taluka
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-govSlate-50">
          {/* Quick Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-govSlate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-govSlate-500">Project</span>
              <p className="font-semibold text-primary mt-0.5 truncate">{parcel.projectName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-govSlate-500">Area (Ha)</span>
              <p className="font-bold font-mono text-sm text-govSlate-900 mt-0.5">{parcel.areaHa} Ha</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-govSlate-500">Land Type</span>
              <p className="font-medium text-govSlate-800 mt-0.5">{parcel.landType}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-govSlate-500">Rights Holder</span>
              <p className="font-bold text-govSlate-900 mt-0.5">{parcel.rightsHolder}</p>
            </div>
          </div>

          {/* 5-Pillar Land Record Verification Status */}
          <div className="bg-white p-4 rounded-xl border border-govSlate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-govSlate-100">
              <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-govEmerald">verified</span>
                5-Pillar Land Record Scrutiny
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                parcel.verification.overall.badge === 'error' ? 'bg-red-100 text-red-800' :
                parcel.verification.overall.badge === 'warning' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {parcel.verification.overall.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-govSlate-50 border border-govSlate-200">
                <span className="text-govSlate-500 font-bold block text-[10px]">1. RoR (7/12)</span>
                <span className="font-bold text-govEmerald flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
                </span>
              </div>
              <div className="p-2 rounded-lg bg-govSlate-50 border border-govSlate-200">
                <span className="text-govSlate-500 font-bold block text-[10px]">2. Registration</span>
                <span className="font-bold text-govEmerald flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
                </span>
              </div>
              <div className="p-2 rounded-lg bg-govSlate-50 border border-govSlate-200">
                <span className="text-govSlate-500 font-bold block text-[10px]">3. Mutation</span>
                <span className={`font-bold flex items-center gap-0.5 mt-0.5 ${
                  parcel.verification.mutation.status === 'verified' ? 'text-govEmerald' : 'text-govAmber'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {parcel.verification.mutation.status === 'verified' ? 'check_circle' : 'warning'}
                  </span>
                  {parcel.verification.mutation.label || 'Pending'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-govSlate-50 border border-govSlate-200">
                <span className="text-govSlate-500 font-bold block text-[10px]">4. Cadastral Map</span>
                <span className="font-bold text-govEmerald flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
                </span>
              </div>
              <div className="p-2 rounded-lg bg-govSlate-50 border border-govSlate-200">
                <span className="text-govSlate-500 font-bold block text-[10px]">5. Dispute Check</span>
                <span className={`font-bold flex items-center gap-0.5 mt-0.5 ${
                  parcel.verification.disputeCheck.status === 'conflict' ? 'text-error' : 'text-govEmerald'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {parcel.verification.disputeCheck.status === 'conflict' ? 'flag' : 'check_circle'}
                  </span>
                  {parcel.verification.disputeCheck.label || 'Clear'}
                </span>
              </div>
            </div>

            {parcel.verification.overall.recommendedAction && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-700">gavel</span>
                <span><strong>Statutory Action:</strong> {parcel.verification.overall.recommendedAction}</span>
              </div>
            )}
          </div>

          {/* Compensation & R&R Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Compensation Card */}
            <div className="bg-white p-3.5 rounded-xl border border-govSlate-200 shadow-xs">
              <span className="font-bold text-xs text-primary flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[16px] text-govEmerald">account_balance</span>
                Compensation Assessment
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-govSlate-600">Assessed Value:</span>
                  <span className="font-mono font-bold">₹ {(parcel.compensation.assessedAmount / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-govSlate-600">100% Solatium (Sec 30):</span>
                  <span className="font-mono font-bold text-govEmerald">+ ₹ {(parcel.compensation.solatiumAmount / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between border-t border-govSlate-100 pt-1">
                  <span className="font-bold text-govSlate-800">Total Statutory Award:</span>
                  <span className="font-mono font-extrabold text-primary">₹ {(parcel.compensation.totalCompensation / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-govSlate-600">Payment Status:</span>
                  <span className="font-bold text-govAmber">{parcel.compensation.paymentStage}</span>
                </div>
              </div>
            </div>

            {/* R&R Snapshot Card */}
            <div className="bg-white p-3.5 rounded-xl border border-govSlate-200 shadow-xs">
              <span className="font-bold text-xs text-primary flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[16px] text-govAmber">home_work</span>
                Rehabilitation & Resettlement (R&R)
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-govSlate-600">R&R Applicability:</span>
                  <span className="font-bold text-primary">{parcel.rr.required ? 'Required (RFCTLARR Sec 31)' : 'Not Applicable'}</span>
                </div>
                {parcel.rr.required && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-govSlate-600">Family ID:</span>
                      <span className="font-mono font-bold">{parcel.rr.familyId} ({parcel.rr.members} members)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-govSlate-600">Package:</span>
                      <span className="font-medium text-govSlate-800 truncate max-w-[150px]">{parcel.rr.package}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-govSlate-600">Delay Reason:</span>
                      <span className="text-amber-800 font-semibold truncate max-w-[150px]">{parcel.rr.delayReason}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-govSlate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDoc && onViewDoc(parcel.id)}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 hover:bg-govSlate-100 text-govSlate-800 text-xs font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] text-govEmerald">description</span>
              View 7/12 &amp; Deeds
            </button>
            <button
              onClick={() => onOpenAction && onOpenAction('verification', parcel)}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 hover:bg-govSlate-100 text-govSlate-800 text-xs font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] text-govAmber">gavel</span>
              Revenue Verification
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
