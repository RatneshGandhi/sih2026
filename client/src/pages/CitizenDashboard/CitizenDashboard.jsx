import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from './components/StatusBadge';
import StatCard from './components/StatCard';

export default function CitizenDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParcels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/citizen/parcels');
      setParcels(res.data.parcels || []);
    } catch (err) {
      console.error('Failed to fetch citizen parcels:', err);
      setError(err.response?.data?.error || 'Unable to load registered land parcels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  // Compute summary stats
  const totalHectares = parcels.reduce((sum, p) => sum + (parseFloat(p.area_hectares) || 0), 0).toFixed(4);
  const totalApproved = parcels.reduce((sum, p) => sum + (p.approved_amount || 0), 0);
  const totalDisbursed = parcels.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const totalPending = parcels.reduce((sum, p) => sum + (p.pending_amount || 0), 0);

  const formatCurrency = (val) => {
    if (!val || isNaN(val)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">
        {/* Welcome & Identity Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-container rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          {/* Subtle background crest accent */}
          <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[160px]">shield</span>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold w-fit">
                <span className="material-symbols-outlined text-[15px] text-govEmerald">verified</span>
                Verified Landowner / Khatedar Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 font-sans">
                Welcome, {user?.name || 'Landowner'}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl mt-0.5">
                Statutory dashboard for land acquisition notices, compensation awards, resettlement assistance, and objection tracking under the RFCTLARR Act 2013.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/citizen/map')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-govEmerald hover:bg-govEmeraldDark text-white text-xs font-bold transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">map</span>
                View on Cadastre Map
              </button>
              <button
                onClick={() => navigate('/citizen/objections')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all backdrop-blur-xs"
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                File Objection
              </button>
            </div>
          </div>
        </div>

        {/* Quick KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Registered Parcels"
            value={parcels.length}
            subtext="Verified in central cadastre"
            icon="landscape"
            color="blue"
          />
          <StatCard
            title="Total Land Holding"
            value={`${totalHectares} Ha`}
            subtext="Acquisition demarcated area"
            icon="square_foot"
            color="navy"
          />
          <StatCard
            title="Total Disbursed"
            value={formatCurrency(totalDisbursed)}
            subtext="Credited via PFMS DBT"
            icon="payments"
            color="emerald"
          />
          <StatCard
            title="Pending Solatium"
            value={formatCurrency(totalPending)}
            subtext={`Approved: ${formatCurrency(totalApproved)}`}
            icon="pending_actions"
            color="amber"
          />
        </div>

        {/* Parcels Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">format_list_bulleted</span>
              <h2 className="text-lg font-bold text-govSlate-900 font-sans">
                My Land Parcels ({parcels.length})
              </h2>
            </div>
            <button
              onClick={fetchParcels}
              className="text-xs font-semibold text-primary hover:text-govEmerald flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-govSlate-200/80 p-5 shadow-xs animate-pulse flex flex-col gap-3">
                  <div className="h-5 bg-govSlate-200 rounded w-1/3"></div>
                  <div className="h-8 bg-govSlate-100 rounded w-2/3"></div>
                  <div className="h-20 bg-govSlate-50 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-rose-600">error</span>
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={fetchParcels}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && parcels.length === 0 && (
            <div className="bg-white rounded-2xl border border-govSlate-200/80 p-12 text-center text-govSlate-600 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-5xl text-govSlate-400">landscape</span>
              <h3 className="text-base font-bold text-govSlate-900">No Land Parcels Linked</h3>
              <p className="text-xs text-govSlate-500 max-w-md">
                No land parcels are currently registered under your citizen identity in this statutory district registry.
              </p>
            </div>
          )}

          {/* Parcels Cards Grid */}
          {!loading && !error && parcels.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {parcels.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-govSlate-200/80 shadow-xs hover:shadow-md hover:border-govSlate-300 transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-govSlate-100 flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono text-govSlate-500 uppercase tracking-wider">
                        Survey / Gut Number
                      </span>
                      <h3 className="text-xl font-extrabold text-govSlate-900 font-sans tracking-tight">
                        {p.survey_number}
                      </h3>
                      <span className="text-xs text-govSlate-600 font-medium mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-govSlate-400">location_on</span>
                        {p.village || 'N/A'}, {p.district}, {p.state}
                      </span>
                    </div>

                    <StatusBadge status={p.status} type="parcel" />
                  </div>

                  {/* Card Body Key Metrics */}
                  <div className="p-5 flex flex-col gap-3.5 bg-surface-container-low/40">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-govSlate-200/60 flex flex-col">
                        <span className="text-[10px] text-govSlate-500 uppercase font-semibold">Total Area</span>
                        <span className="text-sm font-bold text-govSlate-900 font-mono tnum">
                          {p.area_hectares} Ha
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-govSlate-200/60 flex flex-col">
                        <span className="text-[10px] text-govSlate-500 uppercase font-semibold">Land Type</span>
                        <span className="text-sm font-bold text-govSlate-900 capitalize truncate">
                          {p.land_type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="bg-white p-3 rounded-xl border border-govSlate-200/60 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-govSlate-600">Compensation:</span>
                        <StatusBadge status={p.computed_compensation_status} type="compensation" />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-govSlate-100">
                        <span className="text-govSlate-500">Approved:</span>
                        <span className="font-bold text-govSlate-900 font-mono tnum">
                          {formatCurrency(p.approved_amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-govSlate-500">Disbursed:</span>
                        <span className="font-bold text-govEmerald font-mono tnum">
                          {formatCurrency(p.paid_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Associated Project */}
                    <div className="text-[11px] font-medium text-govSlate-600 flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[15px] text-primary">folder</span>
                      <span className="truncate">{p.project_name}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 bg-white border-t border-govSlate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/citizen/parcels/${p.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Inspect Details
                    </button>
                    <button
                      onClick={() => navigate('/citizen/map')}
                      title="Locate on Map"
                      className="p-2 rounded-xl border border-govSlate-200 hover:bg-surface-container text-govSlate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">map</span>
                    </button>
                    <button
                      onClick={() => navigate(`/citizen/compensation`)}
                      title="Compensation Ledger"
                      className="p-2 rounded-xl border border-govSlate-200 hover:bg-surface-container text-govSlate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
