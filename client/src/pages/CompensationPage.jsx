import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export default function CompensationPage() {
  const [compensationList, setCompensationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [rnrFilter, setRnrFilter] = useState('');

  // Inline / Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    payment_status: 'pending',
    rnr_status: 'not_started',
    paid_amount: ''
  });
  const [updating, setUpdating] = useState(false);

  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  const isOfficial = ['district_official', 'state_official', 'ministry_official'].includes(user?.role);

  useEffect(() => {
    loadCompensation();
  }, [paymentFilter, rnrFilter, searchTerm]);

  async function loadCompensation() {
    try {
      setLoading(true);
      const params = {};
      if (paymentFilter) params.payment_status = paymentFilter;
      if (rnrFilter) params.rnr_status = rnrFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/compensation', { params });
      setCompensationList(res.data.compensation || []);
    } catch (err) {
      console.error('Failed to load compensation:', err);
      showToast('Failed to retrieve compensation ledger.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenEdit = (rec) => {
    setSelectedRecord(rec);
    setEditForm({
      payment_status: rec.payment_status,
      rnr_status: rec.rnr_status,
      paid_amount: rec.paid_amount
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setUpdating(true);
    try {
      const res = await api.patch(`/compensation/${selectedRecord.compensation_id}`, editForm);
      showToast('Compensation & R&R status updated in official ledger!', 'success');
      setEditModalOpen(false);
      loadCompensation();
    } catch (err) {
      console.error('Failed to update record:', err);
      showToast(err.response?.data?.error || 'Failed to update status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Top KPIs computed dynamically
  const totalAssessed = compensationList.reduce((acc, c) => acc + parseFloat(c.assessed_amount || 0), 0);
  const totalPaid = compensationList.reduce((acc, c) => acc + parseFloat(c.paid_amount || 0), 0);
  const totalFamilies = compensationList.reduce((acc, c) => acc + parseInt(c.families_affected || 1, 10), 0);
  const pctPaid = totalAssessed > 0 ? ((totalPaid / totalAssessed) * 100).toFixed(1) : 0;

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div>
          <h1 className="text-xl font-extrabold text-primary tracking-tight font-sans">
            Compensation &amp; Rehabilitation (R&amp;R) Tracking Ledger
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Section 26-30 RFCTLARR Solatium Disbursals, Direct Benefit Transfers (PFMS), and Resettlement Entitlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="h-9 px-3.5 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-govSlate-200"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
        <div className="p-space-md rounded-2xl bg-white border border-govSlate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-outline font-bold">Total Solatium Assessed</span>
            <div className="text-2xl font-extrabold text-primary font-mono mt-0.5">
              ₹ {(totalAssessed / 1e7).toFixed(2)} <span className="text-xs font-normal">Cr</span>
            </div>
            <span className="text-[11px] text-govSlate-500">{compensationList.length} Notified Plots</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
        </div>

        <div className="p-space-md rounded-2xl bg-white border border-govSlate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-outline font-bold">DBT Disbursed (PFMS)</span>
            <div className="text-2xl font-extrabold text-secondary font-mono mt-0.5">
              ₹ {(totalPaid / 1e7).toFixed(2)} <span className="text-xs font-normal">Cr ({pctPaid}%)</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">Credited to Beneficiary Accounts</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
        </div>

        <div className="p-space-md rounded-2xl bg-white border border-govSlate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-outline font-bold">Affected Families (PAFs)</span>
            <div className="text-2xl font-extrabold text-primary font-mono mt-0.5">
              {totalFamilies} <span className="text-xs font-normal">Families</span>
            </div>
            <span className="text-[11px] text-govSlate-500">Rehabilitation &amp; Annuity Tracked</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">holiday_village</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-space-md shadow-xs flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Survey No, Owner, Project, UTR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface outline-none cursor-pointer"
          >
            <option value="">All Payment Statuses</option>
            <option value="paid">Paid (PFMS Remitted)</option>
            <option value="processing">Processing with Bank</option>
            <option value="pending">Pending Inquiry / Award</option>
          </select>

          <select
            value={rnrFilter}
            onChange={(e) => setRnrFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface outline-none cursor-pointer"
          >
            <option value="">All R&amp;R Stages</option>
            <option value="completed">Completed (Plot + Grants)</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-mono text-[10px] uppercase border-b border-govSlate-200">
              <tr>
                <th className="py-3 px-3.5">Survey Plot</th>
                <th className="py-3 px-3.5">Registered Khatedar</th>
                <th className="py-3 px-3.5">Corridor / Location</th>
                <th className="py-3 px-3.5">Assessed Outlay</th>
                <th className="py-3 px-3.5">Disbursed (Paid)</th>
                <th className="py-3 px-3.5">Payment Status</th>
                <th className="py-3 px-3.5">R&amp;R Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="font-mono text-xs">Accessing PFMS disbursement scrolls...</span>
                    </div>
                  </td>
                </tr>
              ) : compensationList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-on-surface-variant">
                    No compensation records matching the filters.
                  </td>
                </tr>
              ) : (
                compensationList.map((rec) => (
                  <tr key={rec.compensation_id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-primary whitespace-nowrap">
                      {rec.survey_number}
                      <span className="text-[10px] text-outline block font-normal">{rec.area_hectares} Ha</span>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-govSlate-900">{rec.owner_name}</div>
                      <div className="text-[10px] font-mono text-outline">A/C: {rec.bank_account_masked || 'State Bank of India'}</div>
                    </td>
                    <td className="py-3 px-3.5 max-w-xs truncate">
                      <div className="font-medium text-govSlate-800 truncate">{rec.project_name}</div>
                      <div className="text-[10px] text-outline">{rec.district}, {rec.state}</div>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold whitespace-nowrap">
                      ₹ {(parseFloat(rec.assessed_amount) / 1e5).toFixed(2)} Lakhs
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-secondary whitespace-nowrap">
                      ₹ {(parseFloat(rec.paid_amount) / 1e5).toFixed(2)} Lakhs
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        rec.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        rec.payment_status === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {rec.payment_status}
                      </span>
                      {rec.utr_number && (
                        <div className="text-[9px] font-mono text-outline mt-0.5">UTR: {rec.utr_number}</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                        rec.rnr_status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        rec.rnr_status === 'in_progress' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rec.rnr_status?.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-outline font-mono mt-0.5">
                        {rec.families_affected} PAF(s)
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {isOfficial ? (
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="px-2.5 py-1 rounded bg-surface-container hover:bg-primary hover:text-white text-primary font-semibold text-xs transition-colors shadow-2xs"
                        >
                          Update Status
                        </button>
                      ) : (
                        <span className="text-outline text-[11px]">View Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Inline Status & Payment Update */}
      {editModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-govSlate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-primary">Update Solatium &amp; R&amp;R Ledger</h3>
                  <span className="font-mono text-[10px] text-outline">Survey {selectedRecord.survey_number} • {selectedRecord.owner_name}</span>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="my-3 p-3 bg-surface-container-low rounded-xl border border-govSlate-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-outline">Assessed Statutory Award:</span>
                <span className="font-bold font-mono text-primary">₹ {selectedRecord.assessed_amount}</span>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Payment Status (PFMS Remittance) *
                </label>
                <select
                  value={editForm.payment_status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setEditForm({
                      ...editForm,
                      payment_status: newStatus,
                      paid_amount: newStatus === 'paid' ? selectedRecord.assessed_amount : editForm.paid_amount
                    });
                  }}
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs cursor-pointer"
                >
                  <option value="pending">Pending Inquiry</option>
                  <option value="processing">Processing with Bank</option>
                  <option value="paid">Paid (Full DBT Settled)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Disbursed Amount (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={editForm.paid_amount}
                  onChange={(e) => setEditForm({ ...editForm, paid_amount: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Rehabilitation &amp; Resettlement (R&amp;R) Status *
                </label>
                <select
                  value={editForm.rnr_status}
                  onChange={(e) => setEditForm({ ...editForm, rnr_status: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs cursor-pointer"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress (Homestead Construction)</option>
                  <option value="completed">Completed (Possession Granted)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-govSlate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {updating ? 'Recording...' : 'Save & Sync Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
