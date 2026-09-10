import React from 'react';
import { NATIONAL_KPIS, STATES_DATA } from '../../data/ministryData';

export default function NationalCompensation() {
  const kpi = NATIONAL_KPIS;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">account_balance_wallet</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Compensation &amp; DBT Monitoring
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-200">
              PFMS ESCROW AUDIT
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Central financial tracking of statutory awards, solatium multipliers, and Direct Benefit Transfer (DBT) disbursements to project affected landowners.
          </p>
        </div>

        {/* Read-Only Statutory Restriction Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-xs text-blue-900 max-w-md">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-[16px] text-blue-700">lock</span>
            <span>Central Ministry Permission: READ &amp; ANALYZE ONLY</span>
          </div>
          <p className="text-[11px] text-blue-800 mt-0.5">
            Ministry can view financial flows across states. Sole statutory authority to approve awards or disburse compensation rests with the District CALA under Section 30.
          </p>
        </div>
      </div>

      {/* 4 Large Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-govSlate-500 block">
            1. Total Assessed Compensation
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-govSlate-900 mt-1">
            ₹{kpi.compensationAssessedCr.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Cr</span>
          </div>
          <p className="text-[11px] text-govSlate-500 mt-1">
            Includes market value + 100% Solatium (Sec 30)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-govSlate-500 block">
            2. Statutorily Approved
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-primary mt-1">
            ₹{kpi.compensationApprovedCr.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Cr</span>
          </div>
          <p className="text-[11px] text-govSlate-500 mt-1">
            Sanctioned under Section 23 CALA awards
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            3. Disbursed via PFMS / DBT
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-govEmerald mt-1">
            ₹{kpi.compensationDisbursedCr.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Cr</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1">
            91.5% of assessed funds transferred
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
            4. Pending Disbursement
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-red-600 mt-1">
            ₹{kpi.compensationPendingCr.toLocaleString()} <span className="text-xs font-normal text-govSlate-500">Cr</span>
          </div>
          <p className="text-[11px] text-red-700 font-medium mt-1">
            Awaiting bank verification &amp; escrow release
          </p>
        </div>
      </div>

      {/* State-by-State Financial Ledger */}
      <div className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-govSlate-50 border-b border-govSlate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
              State-Level Compensation &amp; Solatium Ledger
            </h3>
          </div>
          <span className="text-[11px] font-mono text-govSlate-500">
            Values in ₹ Crores (Cr)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-govSlate-100 text-govSlate-600 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">State</th>
                <th className="p-3">Assessed</th>
                <th className="p-3">Approved</th>
                <th className="p-3">Disbursed (DBT)</th>
                <th className="p-3">Pending</th>
                <th className="p-3">Disbursement Velocity</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {STATES_DATA.map((st) => {
                const pct = ((st.compensationDisbursedCr / st.compensationAssessedCr) * 100).toFixed(1);
                const isLagging = st.compensationPendingCr >= 150;
                return (
                  <tr key={st.code} className="hover:bg-govSlate-50/70 transition-colors">
                    <td className="p-3 font-bold text-primary text-sm flex items-center gap-2">
                      <span>{st.name}</span>
                      <span className="px-1.5 py-0.2 bg-govSlate-100 text-govSlate-600 font-mono text-[10px] rounded">
                        {st.code}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold">₹{st.compensationAssessedCr} Cr</td>
                    <td className="p-3 font-mono">₹{st.compensationApprovedCr} Cr</td>
                    <td className="p-3 font-mono font-bold text-govEmerald">₹{st.compensationDisbursedCr} Cr</td>
                    <td className="p-3 font-mono font-extrabold text-red-600">
                      ₹{st.compensationPendingCr} Cr
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs">{pct}%</span>
                        <div className="w-20 bg-govSlate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-govEmerald h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isLagging
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isLagging ? 'Attention Required' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
