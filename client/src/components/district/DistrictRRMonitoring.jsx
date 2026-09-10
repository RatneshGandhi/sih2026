import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DISTRICT_RR_KPIS, DISTRICT_RR_FAMILIES } from '../../data/districtData';

export default function DistrictRRMonitoring({ onViewParcel }) {
  const [families, setFamilies] = useState(DISTRICT_RR_FAMILIES);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [statusUpdateFamily, setStatusUpdateFamily] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const pieData = [
    { name: 'Completed', value: DISTRICT_RR_KPIS.rrCompletedPct, color: '#0E9F6E' },
    { name: 'Pending', value: DISTRICT_RR_KPIS.rrPendingPct, color: '#F2A93B' }
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveStatus = (familyId, newStatus, newDelayReason) => {
    setFamilies((prev) =>
      prev.map((f) => {
        if (f.id === familyId) {
          return {
            ...f,
            status: newStatus,
            statusLabel: newStatus === 'completed' ? 'Completed' : newStatus === 'in_progress' ? 'In Progress' : 'Pending',
            reasonForDelay: newDelayReason || f.reasonForDelay
          };
        }
        return f;
      })
    );
    showToast(`R&R Status for ${familyId} updated.`);
    setStatusUpdateFamily(null);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-5">
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
          <span className="material-symbols-outlined text-[22px] text-primary">home_work</span>
          <div>
            <h2 className="font-bold text-base text-primary">Rehabilitation &amp; Resettlement (R&amp;R Monitoring)</h2>
            <p className="text-xs text-govSlate-500">
              Statutory oversight under Sections 31-38 of RFCTLARR Act, 2013 for displaced families, model housing, and annuities.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
          {DISTRICT_RR_KPIS.rrCompletedPct}% R&amp;R Statutory Target Met
        </span>
      </div>

      {/* KPI Cards + Pie Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* 4 Cards (Col 1-8) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-govSlate-200 bg-govSlate-50">
            <span className="text-[10px] font-bold uppercase text-govSlate-500">Affected Families</span>
            <div className="text-2xl font-black text-primary font-tnum mt-1">
              {DISTRICT_RR_KPIS.totalAffectedFamilies.toLocaleString()}
            </div>
            <span className="text-[10px] text-govSlate-500">PAFs Identified</span>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40">
            <span className="text-[10px] font-bold uppercase text-amber-800">Displaced Families</span>
            <div className="text-2xl font-black text-amber-900 font-tnum mt-1">
              {DISTRICT_RR_KPIS.displacedFamilies.toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-700">PDFs Resettlement Base</span>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <span className="text-[10px] font-bold uppercase text-emerald-800">R&amp;R Completed</span>
            <div className="text-2xl font-black text-govEmerald font-tnum mt-1">
              {DISTRICT_RR_KPIS.rrCompletedPct}%
            </div>
            <span className="text-[10px] text-emerald-700">{DISTRICT_RR_KPIS.housingAllotted} Units Allotted</span>
          </div>

          <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/40">
            <span className="text-[10px] font-bold uppercase text-orange-800">R&amp;R Pending</span>
            <div className="text-2xl font-black text-orange-700 font-tnum mt-1">
              {DISTRICT_RR_KPIS.rrPendingPct}%
            </div>
            <span className="text-[10px] text-orange-700">Under Resolution</span>
          </div>
        </div>

        {/* Progress Donut Chart (Col 9-12) */}
        <div className="lg:col-span-4 bg-govSlate-50 p-3 rounded-xl border border-govSlate-200 flex items-center justify-between">
          <div className="h-[100px] w-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-govSlate-800">Resettlement Ratio</span>
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-govEmerald"></span> Completed: {DISTRICT_RR_KPIS.rrCompletedPct}%
            </span>
            <span className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-govAmber"></span> Pending: {DISTRICT_RR_KPIS.rrPendingPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Displaced Families Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-govSlate-100 text-govSlate-700 uppercase font-mono text-[10px] border-b border-govSlate-200">
            <tr>
              <th className="p-3">Family ID</th>
              <th className="p-3">Head of Family</th>
              <th className="p-3">Parcel &amp; Project</th>
              <th className="p-3">R&amp;R Package</th>
              <th className="p-3">Allotted Plot / Grant</th>
              <th className="p-3">Status</th>
              <th className="p-3">Reason for Delay</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-govSlate-200">
            {families.map((fam) => {
              const isCompleted = fam.status === 'completed';
              const isPending = fam.status === 'pending';

              return (
                <tr key={fam.id} className="hover:bg-govSlate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-primary">{fam.id}</td>
                  <td className="p-3">
                    <div className="font-bold text-govSlate-900">{fam.headOfFamily}</div>
                    <div className="text-[10px] text-govSlate-500">{fam.members} Family Members</div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-primary">{fam.parcelId}</span>
                    <span className="block text-[10px] text-govSlate-500 truncate max-w-xs">{fam.projectName}</span>
                  </td>
                  <td className="p-3 text-govSlate-800 font-medium max-w-xs">{fam.rrPackage}</td>
                  <td className="p-3 font-mono text-govSlate-700 text-[11px]">{fam.allocatedSite}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      isPending ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {isCompleted ? '🟢 Completed' : isPending ? '🟡 Pending' : '🔵 In Progress'}
                    </span>
                  </td>
                  <td className="p-3 text-govSlate-600 text-[11px] max-w-xs">
                    {fam.reasonForDelay}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedFamily(fam)}
                        className="px-2 py-1 rounded bg-govSlate-100 hover:bg-govSlate-200 text-govSlate-800 font-semibold text-[11px]"
                      >
                        View Family
                      </button>
                      <button
                        onClick={() => setStatusUpdateFamily(fam)}
                        className="px-2.5 py-1 rounded bg-primary hover:bg-primary-container text-white font-bold text-[11px]"
                      >
                        Update Status
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Family Modal */}
      {selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-lg w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-200">
              <h3 className="font-bold text-sm text-primary">R&amp;R Family Dossier: {selectedFamily.id}</h3>
              <button onClick={() => setSelectedFamily(null)} className="text-govSlate-400 hover:text-govSlate-800">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-govSlate-800">
              <div className="p-3 bg-govSlate-50 rounded-lg border border-govSlate-200 space-y-1">
                <p><strong>Head of Family:</strong> {selectedFamily.headOfFamily}</p>
                <p><strong>Total Members:</strong> {selectedFamily.members} (Adults &amp; Dependents)</p>
                <p><strong>Affected Plot:</strong> {selectedFamily.parcelId} • {selectedFamily.projectName}</p>
                <p><strong>Allocated Site:</strong> {selectedFamily.allocatedSite}</p>
                <p><strong>Statutory Grant:</strong> ₹ {(selectedFamily.grantAmount / 100000).toFixed(2)} Lakhs</p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-govSlate-200">
                <span className="text-[10px] font-bold text-govSlate-500 uppercase block">R&amp;R Entitlement Package:</span>
                <p className="font-semibold text-primary mt-0.5">{selectedFamily.rrPackage}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950">
                <span className="text-[10px] font-bold uppercase block">Delay Factor:</span>
                <p className="mt-0.5">{selectedFamily.reasonForDelay}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-govSlate-200">
              <button
                onClick={() => {
                  setSelectedFamily(null);
                  if (onViewParcel) onViewParcel(selectedFamily.parcelId);
                }}
                className="px-3 py-1.5 rounded-lg border border-govSlate-300 text-xs font-semibold hover:bg-govSlate-100"
              >
                Inspect Parcel
              </button>
              <button
                onClick={() => setSelectedFamily(null)}
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusUpdateFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-md w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-200">
              <h3 className="font-bold text-sm text-primary">Update R&amp;R Status: {statusUpdateFamily.id}</h3>
              <button onClick={() => setStatusUpdateFamily(null)} className="text-govSlate-400 hover:text-govSlate-800">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-bold text-govSlate-800 mb-1">New R&amp;R Status:</label>
                <select
                  id="rrStatusSelect"
                  defaultValue={statusUpdateFamily.status}
                  className="w-full bg-govSlate-50 border border-govSlate-300 rounded p-2 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="completed">🟢 Completed (Site Handed Over)</option>
                  <option value="in_progress">🔵 In Progress (Civil Construction / Allocation)</option>
                  <option value="pending">🟡 Pending (Documentation / Consensus)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-govSlate-800 mb-1">Reason / Notes on Delay:</label>
                <textarea
                  id="rrDelayNotes"
                  rows={3}
                  defaultValue={statusUpdateFamily.reasonForDelay}
                  className="w-full bg-govSlate-50 border border-govSlate-300 rounded p-2 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-govSlate-200">
              <button
                onClick={() => setStatusUpdateFamily(null)}
                className="px-3 py-1.5 rounded-lg border border-govSlate-300 text-xs font-semibold hover:bg-govSlate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const s = document.getElementById('rrStatusSelect')?.value;
                  const n = document.getElementById('rrDelayNotes')?.value;
                  handleSaveStatus(statusUpdateFamily.id, s, n);
                }}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold"
              >
                Save R&amp;R Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
