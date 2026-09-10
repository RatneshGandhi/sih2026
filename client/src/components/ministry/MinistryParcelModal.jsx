import React from 'react';
import { PARCEL_P103_READONLY } from '../../data/ministryData';

export default function MinistryParcelModal({ parcel = PARCEL_P103_READONLY, onClose }) {
  if (!parcel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-govSlate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-govSlate-50 border-b border-govSlate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[22px] text-govEmerald">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-primary">
                  Cadastral Dossier: Parcel {parcel.id}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  READ-ONLY CENTRAL CADASTRE
                </span>
              </div>
              <p className="text-xs text-govSlate-500">
                Survey #{parcel.surveyNumber} • Khasra #{parcel.khasraNumber} • {parcel.village}, {parcel.district}, {parcel.state}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-govSlate-200 flex items-center justify-center text-govSlate-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Read-Only Notice */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-900">
            <span className="material-symbols-outlined text-[18px] text-blue-600">lock</span>
            <span>
              <strong>Central Ministry Oversight Mode:</strong> In accordance with RFCTLARR statutory bounds, Ministry users have view-only access. Operational modifications are restricted to District CALA authority.
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
            NO WRITE PERMISSION
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-govSlate-700">
          {/* Top Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-govSlate-50 p-3 rounded-xl border border-govSlate-200">
              <span className="text-[10px] font-bold uppercase text-govSlate-500 tracking-wider">Project Corridor</span>
              <div className="font-bold text-sm text-primary mt-0.5">{parcel.projectName}</div>
              <span className="text-[10px] text-govSlate-500 font-mono">ID: {parcel.projectId}</span>
            </div>
            <div className="bg-govSlate-50 p-3 rounded-xl border border-govSlate-200">
              <span className="text-[10px] font-bold uppercase text-govSlate-500 tracking-wider">Acquisition Extent</span>
              <div className="font-bold text-sm text-primary mt-0.5">{parcel.areaHa} Ha</div>
              <span className="text-[10px] text-govSlate-500">{parcel.landType}</span>
            </div>
            <div className="bg-govSlate-50 p-3 rounded-xl border border-govSlate-200">
              <span className="text-[10px] font-bold uppercase text-govSlate-500 tracking-wider">Statutory Status</span>
              <div className="mt-0.5">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                  {parcel.statusLabel || parcel.status}
                </span>
              </div>
              <span className="text-[10px] text-red-600 font-mono mt-1 block">Civil Suit 44/2025</span>
            </div>
            <div className="bg-govSlate-50 p-3 rounded-xl border border-govSlate-200">
              <span className="text-[10px] font-bold uppercase text-govSlate-500 tracking-wider">Primary Rights Holder</span>
              <div className="font-bold text-sm text-primary mt-0.5">{parcel.rightsHolder}</div>
              <span className="text-[10px] text-govSlate-500">Co-Owners: {(parcel.coOwners || []).length} Recorded</span>
            </div>
          </div>

          {/* 5-Pillar Verification Grid */}
          <div className="bg-white rounded-xl border border-govSlate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">fact_check</span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                  5-Pillar Digital Cadastral Verification Audit
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                CASE 5: Legal / Revenue Review
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>1. RoR (7/12)</span>
                </div>
                <div className="text-[10px] text-emerald-800 font-mono mt-1">{parcel.verification?.ror?.docRef || 'ROR-RTN-7819'}</div>
                <div className="text-[9px] text-govSlate-500 mt-0.5">Verified on {parcel.verification?.ror?.date}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>2. SRO Registry</span>
                </div>
                <div className="text-[10px] text-emerald-800 font-mono mt-1">{parcel.verification?.registration?.docRef || 'SRO-RTN-4421'}</div>
                <div className="text-[9px] text-govSlate-500 mt-0.5">Verified on {parcel.verification?.registration?.date}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-1 text-amber-800 font-semibold text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">pending</span>
                  <span>3. Mutation Register</span>
                </div>
                <div className="text-[10px] text-amber-900 font-mono mt-1">Pending Review</div>
                <div className="text-[9px] text-amber-800 mt-0.5">Contested by legal heirs</div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>4. Spatial Cadastre</span>
                </div>
                <div className="text-[10px] text-emerald-800 font-mono mt-1">{parcel.verification?.cadastralMap?.docRef || 'CAD-SHIR-103'}</div>
                <div className="text-[9px] text-govSlate-500 mt-0.5">Geo-boundary matched</div>
              </div>

              <div className="p-2.5 rounded-lg bg-red-50/70 border border-red-200">
                <div className="flex items-center gap-1 text-red-700 font-semibold text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">gavel</span>
                  <span>5. Dispute Check</span>
                </div>
                <div className="text-[10px] text-red-800 font-mono mt-1">Court Stay Active</div>
                <div className="text-[9px] text-red-700 mt-0.5">Civil Suit 44/2025</div>
              </div>
            </div>
          </div>

          {/* Compensation & Escrow Section */}
          <div className="bg-white rounded-xl border border-govSlate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">account_balance</span>
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                  Statutory Compensation &amp; Escrow Account Status
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                FROZEN IN REFERENCE ESCROW
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-govSlate-50 rounded-lg">
                <span className="text-[10px] text-govSlate-500">Base Land Value</span>
                <div className="font-bold text-sm text-govSlate-900 mt-0.5">₹ 65,00,000</div>
              </div>
              <div className="p-2.5 bg-govSlate-50 rounded-lg">
                <span className="text-[10px] text-govSlate-500">100% Solatium (Sec 30)</span>
                <div className="font-bold text-sm text-govSlate-900 mt-0.5">₹ 65,00,000</div>
              </div>
              <div className="p-2.5 bg-govSlate-50 rounded-lg">
                <span className="text-[10px] text-govSlate-500">12% Interest (Sec 30(3))</span>
                <div className="font-bold text-sm text-govSlate-900 mt-0.5">₹ 7,80,000</div>
              </div>
              <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-semibold">Total Statutory Award</span>
                <div className="font-extrabold text-sm text-emerald-900 mt-0.5">₹ 1,37,80,000</div>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0">info</span>
              <span>
                <strong>Disbursement Status:</strong> ₹0 disbursed directly to landowner. Funds deposited in State Bank of India reference escrow pending High Court partition decree under Section 64 reference.
              </span>
            </div>
          </div>

          {/* R&R and Possession Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-govSlate-200">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-primary mb-2">
                <span className="material-symbols-outlined text-[16px]">home_work</span>
                <span>R&amp;R Resettlement Package</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-govSlate-500">Family ID:</span><span className="font-mono font-semibold text-primary">{parcel.rr?.familyId}</span></div>
                <div className="flex justify-between"><span className="text-govSlate-500">Package Type:</span><span className="font-semibold">{parcel.rr?.package}</span></div>
                <div className="flex justify-between"><span className="text-govSlate-500">Allotted Site:</span><span className="font-semibold text-govEmerald">{parcel.rr?.allottedPlot}</span></div>
                <div className="flex justify-between"><span className="text-govSlate-500">Pending Reason:</span><span className="text-amber-800 font-medium">{parcel.rr?.delayReason}</span></div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-govSlate-200">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-primary mb-2">
                <span className="material-symbols-outlined text-[16px]">agriculture</span>
                <span>Section 38 Possession Status</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-govSlate-500">Physical Possession:</span><span className="font-bold text-red-600">Pending / Stayed</span></div>
                <div className="flex justify-between"><span className="text-govSlate-500">Notice Issued:</span><span className="font-semibold">{parcel.possession?.noticeIssued ? 'Yes (Sec 38 Notice)' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-govSlate-500">Tentative Handover:</span><span className="font-mono font-semibold">{parcel.possession?.handoverDate}</span></div>
                <p className="text-[10px] text-govSlate-600 mt-1 leading-normal italic border-t border-govSlate-100 pt-1.5">
                  "{parcel.possession?.remarks}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-govSlate-50 border-t border-govSlate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-govSlate-500">
            <span className="material-symbols-outlined text-[16px] text-govEmerald">verified</span>
            <span>Central Cadastre Record Hash: <span className="font-mono text-[10px]">#0x4F9B...88A2</span></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
