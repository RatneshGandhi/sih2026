import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatusBadge from './components/StatusBadge';
import ProgressBar from './components/ProgressBar';
import StatCard from './components/StatCard';

export default function CompensationTracker() {
  const [ledgers, setLedgers] = useState([]);
  const [selectedParcelId, setSelectedParcelId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompensation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/citizen/compensation');
      setLedgers(res.data.compensation || []);
    } catch (err) {
      console.error('Failed to fetch citizen compensation:', err);
      setError(err.response?.data?.error || 'Failed to retrieve compensation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompensation();
  }, []);

  const formatCurrency = (val) => {
    if (!val || isNaN(val)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Aggregates
  const totalAssessed = ledgers.reduce((s, l) => s + (l.assessed_amount || 0), 0);
  const totalApproved = ledgers.reduce((s, l) => s + (l.approved_amount || 0), 0);
  const totalDisbursed = ledgers.reduce((s, l) => s + (l.paid_amount || 0), 0);
  const totalPending = ledgers.reduce((s, l) => s + (l.pending_amount || 0), 0);

  const filtered = selectedParcelId === 'all'
    ? ledgers
    : ledgers.filter(l => String(l.parcel_id) === String(selectedParcelId));

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-govSlate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[26px]">account_balance_wallet</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-govSlate-900 font-sans tracking-tight">
                Statutory Compensation Tracker
              </h1>
            </div>
            <p className="text-xs text-govSlate-500 mt-1">
              Direct Benefit Transfer (DBT) solatium settlement &amp; escrow reconciliation under Section 31 of RFCTLARR 2013.
            </p>
          </div>

          {/* Parcel Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-govSlate-600">Filter Parcel:</span>
            <select
              value={selectedParcelId}
              onChange={(e) => setSelectedParcelId(e.target.value)}
              className="text-xs font-semibold bg-surface-container-low border border-govSlate-200 rounded-xl px-3 py-2 text-govSlate-800 outline-none focus:border-primary"
            >
              <option value="all">All Linked Parcels ({ledgers.length})</option>
              {ledgers.map(l => (
                <option key={l.id} value={l.parcel_id}>
                  Survey {l.survey_number} ({l.village || 'N/A'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Assessed"
            value={formatCurrency(totalAssessed)}
            subtext="Baseline solatium assessment"
            icon="calculate"
            color="navy"
          />
          <StatCard
            title="Total Approved"
            value={formatCurrency(totalApproved)}
            subtext="CALA statutory award"
            icon="verified"
            color="blue"
          />
          <StatCard
            title="Disbursed (Paid)"
            value={formatCurrency(totalDisbursed)}
            subtext="Credited to bank account"
            icon="payments"
            color="emerald"
          />
          <StatCard
            title="Pending Disbursement"
            value={formatCurrency(totalPending)}
            subtext="Awaiting final treasury release"
            icon="pending"
            color="amber"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-white border border-govSlate-200 p-6 animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl">error</span>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Compensation Cards List */}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-govSlate-200 p-12 text-center text-govSlate-500">
            No compensation ledger found matching the criteria.
          </div>
        )}

        {!loading && !error && filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-6 flex flex-col gap-5 hover:border-govSlate-300 transition-all"
          >
            {/* Header: Survey & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-govSlate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">landscape</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-govSlate-900 font-sans">
                      Survey No: {item.survey_number}
                    </h3>
                    <span className="text-xs font-mono bg-surface-container px-2 py-0.5 rounded text-govSlate-700">
                      {item.area_hectares} Ha
                    </span>
                  </div>
                  <span className="text-xs text-govSlate-500 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>
                    {item.village || 'N/A'} • Project: <b>{item.project_name}</b>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-govSlate-500 font-medium">Award Status:</span>
                <StatusBadge status={item.status} type="compensation" />
              </div>
            </div>

            {/* Exactly Formatted Numbers per Prompt Specification:
                Assessed:   ₹65,00,000 (compensation.assessed_amount)
                Approved:   ₹65,00,000 (compensation.approved_amount)
                Disbursed:  ₹40,00,000 (compensation.paid_amount)
                Pending:    ₹25,00,000 (computed: approved_amount - paid_amount)
                Status:     🟡 Partially Paid
            */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface-container-low/50 p-4 rounded-xl border border-govSlate-200/70">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-govSlate-500 uppercase">Assessed</span>
                <span className="text-base font-extrabold text-govSlate-800 font-mono tnum mt-0.5">
                  {formatCurrency(item.assessed_amount)}
                </span>
                <span className="text-[10px] text-govSlate-400">Baseline Rate</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-govSlate-500 uppercase">Approved</span>
                <span className="text-base font-extrabold text-primary font-mono tnum mt-0.5">
                  {formatCurrency(item.approved_amount)}
                </span>
                <span className="text-[10px] text-govSlate-400">CALA Order</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-govEmerald uppercase">Disbursed</span>
                <span className="text-base font-extrabold text-govEmerald font-mono tnum mt-0.5">
                  {formatCurrency(item.paid_amount)}
                </span>
                <span className="text-[10px] text-govSlate-400">PFMS Credited</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-govAmber uppercase">Pending</span>
                <span className="text-base font-extrabold text-govAmber font-mono tnum mt-0.5">
                  {formatCurrency(item.pending_amount)}
                </span>
                <span className="text-[10px] text-govSlate-400">Balance Escrow</span>
              </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              value={item.paid_amount}
              max={item.approved_amount || 1}
              label="Disbursement Completion Rate"
              color={item.paid_amount >= item.approved_amount ? 'emerald' : 'amber'}
            />

            {/* Banking & Treasury Audit Trail Details */}
            <div className="pt-3 border-t border-govSlate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-govSlate-600">
                <span className="material-symbols-outlined text-[16px] text-govSlate-400">account_balance</span>
                <span>Bank A/C: <b>{item.bank_account_masked || 'SBIN000••••'}</b></span>
              </div>
              <div className="flex items-center gap-2 text-govSlate-600">
                <span className="material-symbols-outlined text-[16px] text-govSlate-400">fingerprint</span>
                <span>UTR: <b className="font-mono">{item.utr_number || 'Awaiting Tranche'}</b></span>
              </div>
              <div className="flex items-center gap-2 text-govSlate-600">
                <span className="material-symbols-outlined text-[16px] text-govSlate-400">event</span>
                <span>Disbursed: <b>{item.disbursed_at ? new Date(item.disbursed_at).toLocaleDateString() : 'In Process'}</b></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
