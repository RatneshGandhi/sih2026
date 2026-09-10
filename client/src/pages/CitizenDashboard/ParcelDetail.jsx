import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from './components/StatusBadge';
import ProgressBar from './components/ProgressBar';

export default function ParcelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    const fetchParcelDetail = async () => {
      setLoading(true);
      setError(null);
      setIsForbidden(false);
      try {
        const res = await api.get(`/citizen/parcels/${id}`);
        setParcel(res.data.parcel);
      } catch (err) {
        console.error('Failed to load parcel details:', err);
        if (err.response?.status === 403) {
          setIsForbidden(true);
          setError(err.response?.data?.error || 'Access forbidden: You do not have statutory ownership rights to inspect this land parcel.');
        } else {
          setError(err.response?.data?.error || 'Failed to retrieve statutory parcel dossier.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchParcelDetail();
    }
  }, [id]);

  const formatCurrency = (val) => {
    if (!val || isNaN(val)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/citizen')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-govSlate-600 hover:text-govSlate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to My Land Parcels
          </button>

          {parcel && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/citizen/objections', { state: { prefillParcelId: parcel.id } })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-govSlate-200 hover:bg-surface-container text-govSlate-800 text-xs font-bold transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] text-govAmber">gavel</span>
                File Statutory Objection
              </button>
              <button
                onClick={() => navigate('/citizen/compensation')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                View Compensation Ledger
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl border border-govSlate-200 p-8 shadow-xs animate-pulse flex flex-col gap-6">
            <div className="h-8 bg-govSlate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-govSlate-100 rounded"></div>
              <div className="h-20 bg-govSlate-100 rounded"></div>
            </div>
          </div>
        )}

        {/* 403 Forbidden State (Security Check Verification) */}
        {!loading && isForbidden && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-8 text-center text-rose-900 flex flex-col items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-rose-950 font-sans">Statutory Access Restricted (HTTP 403)</h2>
              <p className="text-xs text-rose-800 max-w-lg mt-1 leading-relaxed">
                {error}
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded bg-rose-200/60 font-mono text-[11px] font-bold text-rose-900">
                Audit Violation ID: SEC-403-{id}-{Date.now().toString().slice(-6)}
              </div>
            </div>
            <button
              onClick={() => navigate('/citizen')}
              className="mt-2 px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition-colors"
            >
              Return to Safe Workspace
            </button>
          </div>
        )}

        {/* Generic Error */}
        {!loading && !isForbidden && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl">error</span>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Main Dossier Content */}
        {!loading && !error && parcel && (
          <div className="flex flex-col gap-6">
            {/* Dossier Header Card */}
            <div className="bg-white rounded-2xl border border-govSlate-200 shadow-xs p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-govSlate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase text-govSlate-400">Official Cadastral Record</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container font-semibold text-primary">
                      ID: #{parcel.id}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-govSlate-900 font-sans mt-1">
                    Survey No. {parcel.survey_number}
                  </h1>
                </div>

                <StatusBadge status={parcel.status} type="parcel" />
              </div>

              {/* Statutory Key-Value Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-govSlate-200/60 flex flex-col">
                  <span className="text-[11px] font-semibold text-govSlate-500 uppercase">Recorded Land Holder</span>
                  <span className="text-sm font-bold text-govSlate-900 mt-0.5">{parcel.owner_name}</span>
                  <span className="text-[10px] font-mono text-govSlate-400 mt-0.5">{parcel.aadhaar_masked || 'Aadhaar Verified'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-govSlate-200/60 flex flex-col">
                  <span className="text-[11px] font-semibold text-govSlate-500 uppercase">Total Area (Demarcated)</span>
                  <span className="text-sm font-bold text-govSlate-900 font-mono tnum mt-0.5">{parcel.area_hectares} Hectares</span>
                  <span className="text-[10px] text-govSlate-500 mt-0.5">Approx. {(parcel.area_hectares * 2.47105).toFixed(2)} Acres</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-govSlate-200/60 flex flex-col">
                  <span className="text-[11px] font-semibold text-govSlate-500 uppercase">Village & Jurisdiction</span>
                  <span className="text-sm font-bold text-govSlate-900 mt-0.5">{parcel.village || 'N/A'}</span>
                  <span className="text-[10px] text-govSlate-500 mt-0.5">{parcel.district}, {parcel.state}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-govSlate-200/60 flex flex-col">
                  <span className="text-[11px] font-semibold text-govSlate-500 uppercase">Classification</span>
                  <span className="text-sm font-bold text-govSlate-900 capitalize mt-0.5">{parcel.land_type?.replace('_', ' ')}</span>
                  <span className="text-[10px] text-govSlate-500 mt-0.5">Title Unencumbered</span>
                </div>
              </div>
            </div>

            {/* Acquisition Project Association */}
            <div className="bg-white rounded-2xl border border-govSlate-200 shadow-xs p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-govSlate-100">
                <span className="material-symbols-outlined text-primary text-[22px]">corporate_fare</span>
                <h3 className="text-base font-bold text-govSlate-900 font-sans">Acquisition Project Association</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2 flex flex-col gap-1">
                  <span className="text-govSlate-500 font-medium">Project Name:</span>
                  <span className="text-sm font-extrabold text-govSlate-900">{parcel.project_name}</span>
                  <span className="text-govSlate-500 mt-1">
                    Requesting Body: <b>{parcel.requesting_body || 'Government of India Authority'}</b>
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-surface-container-low rounded-xl border border-govSlate-200/60">
                  <span className="text-govSlate-500">Project Code:</span>
                  <span className="font-mono font-bold text-primary">{parcel.project_code}</span>
                  <span className="text-govSlate-500 mt-1">Lifecycle Stage:</span>
                  <span className="font-semibold text-govSlate-800 capitalize">{parcel.project_status?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Compensation & R&R Snapshot for this Parcel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Compensation Summary Card */}
              <div className="bg-white rounded-2xl border border-govSlate-200 shadow-xs p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-govEmerald text-[20px]">payments</span>
                      <h4 className="text-sm font-bold text-govSlate-900">Compensation Ledger</h4>
                    </div>
                    <StatusBadge status={parcel.computed_compensation_status} type="compensation" />
                  </div>

                  <div className="flex flex-col gap-2.5 mt-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-govSlate-100">
                      <span className="text-govSlate-500">Assessed Solatium:</span>
                      <span className="font-bold text-govSlate-900 font-mono tnum">{formatCurrency(parcel.assessed_amount)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-govSlate-100">
                      <span className="text-govSlate-500">CALA Approved Amount:</span>
                      <span className="font-bold text-govSlate-900 font-mono tnum">{formatCurrency(parcel.approved_amount)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-govSlate-100">
                      <span className="text-govSlate-500">Disbursed (PFMS DBT):</span>
                      <span className="font-bold text-govEmerald font-mono tnum">{formatCurrency(parcel.paid_amount)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-govSlate-500 font-semibold">Pending Balance:</span>
                      <span className="font-bold text-govAmber font-mono tnum">{formatCurrency(parcel.pending_amount)}</span>
                    </div>
                  </div>
                </div>

                <ProgressBar
                  value={parcel.paid_amount}
                  max={parcel.approved_amount || 1}
                  label="Disbursement Completion"
                  color={parcel.paid_amount >= parcel.approved_amount ? 'emerald' : 'amber'}
                />
              </div>

              {/* R&R Assistance Card */}
              <div className="bg-white rounded-2xl border border-govSlate-200 shadow-xs p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">family_restroom</span>
                      <h4 className="text-sm font-bold text-govSlate-900">R&R Assistance Progress</h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">
                      Overall: {parcel.rnr_overall_pct}%
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-3 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-govSlate-100">
                      <span className="text-govSlate-600">Housing Assistance:</span>
                      <StatusBadge status={parcel.housing_status} type="rnr" />
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-govSlate-100">
                      <span className="text-govSlate-600">Livelihood Assistance:</span>
                      <StatusBadge status={parcel.livelihood_status} type="rnr" />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-govSlate-600">Resettlement Plot:</span>
                      <StatusBadge status={parcel.resettlement_status} type="rnr" />
                    </div>
                  </div>
                </div>

                <ProgressBar
                  value={parcel.rnr_overall_pct}
                  max={100}
                  label="Resettlement Overall Score"
                  color="emerald"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
