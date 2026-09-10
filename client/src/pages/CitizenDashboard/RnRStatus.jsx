import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatusBadge from './components/StatusBadge';
import ProgressBar from './components/ProgressBar';

export default function RnRStatus() {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRnR = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/citizen/compensation');
      setLedgers(res.data.compensation || []);
    } catch (err) {
      console.error('Failed to fetch R&R status:', err);
      setError(err.response?.data?.error || 'Failed to retrieve R&R assistance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRnR();
  }, []);

  // Filter only parcels where R&R is applicable per prompt rule:
  // "Only show this section if the parcel's compensation row has rnr_status != 'not_applicable' (skip it for citizens whose land isn't triggering displacement)."
  const rnrParcels = ledgers.filter(l => l.rnr_applicable !== false && l.rnr_status !== 'not_applicable');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <span className="text-govEmerald text-lg font-bold">✅</span>;
      case 'in_progress':
        return <span className="text-govAmber text-lg font-bold">🟡</span>;
      case 'not_started':
      default:
        return <span className="text-rose-600 text-lg font-bold">❌</span>;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-govSlate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[26px]">family_restroom</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-govSlate-900 font-sans tracking-tight">
                Rehabilitation &amp; Resettlement (R&amp;R) Status
              </h1>
            </div>
            <p className="text-xs text-govSlate-500 mt-1">
              Statutory social welfare entitlements governed by Schedule II &amp; III of RFCTLARR Act 2013 for displaced and affected families.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl border border-govSlate-200 text-xs text-govSlate-700 font-semibold">
            <span className="material-symbols-outlined text-govEmerald text-[18px]">verified_user</span>
            <span>Statutory Schedule-II Certified</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-white border border-govSlate-200 p-6 animate-pulse"></div>
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

        {/* Empty State / Not Applicable */}
        {!loading && !error && rnrParcels.length === 0 && (
          <div className="bg-white rounded-2xl border border-govSlate-200 p-12 text-center text-govSlate-600 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-5xl text-govSlate-400">home</span>
            <h3 className="text-base font-bold text-govSlate-900">R&amp;R Entitlements Not Applicable</h3>
            <p className="text-xs text-govSlate-500 max-w-md">
              Your registered land parcels have not triggered statutory displacement or rehabilitation provisions under Section 16/31.
            </p>
          </div>
        )}

        {/* R&R Parcel Cards */}
        {!loading && !error && rnrParcels.map((parcel) => (
          <div
            key={parcel.id}
            className="bg-white rounded-2xl border border-govSlate-200/90 shadow-xs p-6 sm:p-7 flex flex-col gap-6 hover:border-govSlate-300 transition-all"
          >
            {/* Header with Parcel identity and Overall % */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-govSlate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/30 border border-secondary/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[26px]">home_work</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-govSlate-900 font-sans">
                      Survey No: {parcel.survey_number}
                    </h3>
                    <span className="text-xs font-mono bg-surface-container px-2 py-0.5 rounded text-govSlate-700">
                      {parcel.area_hectares} Ha
                    </span>
                  </div>
                  <span className="text-xs text-govSlate-500 mt-0.5 block">
                    Village: <b>{parcel.village || 'N/A'}</b> • Affected Families: <b>{parcel.families_affected || 1}</b>
                  </span>
                </div>
              </div>

              {/* Overall Score Badge */}
              <div className="flex items-center gap-2.5 bg-surface-container-low px-4 py-2 rounded-xl border border-govSlate-200">
                <span className="text-xs font-semibold text-govSlate-600">Overall Progress:</span>
                <span className="text-lg font-extrabold text-govSlate-900 font-mono tnum">
                  {parcel.rnr_overall_pct}%
                </span>
              </div>
            </div>

            {/* Exactly Formatted Assistance Rows per Prompt Specification:
                Housing assistance     ✅
                Livelihood assistance   🟡
                Resettlement            ❌
                Overall: 65%
            */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Housing Assistance Card */}
              <div className="p-4 rounded-xl border border-govSlate-200/80 bg-surface-container-low/40 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-govSlate-500 uppercase tracking-wider">Assistance 1</span>
                    <h4 className="text-sm font-bold text-govSlate-900 mt-0.5">Housing Assistance</h4>
                    <p className="text-[11px] text-govSlate-500 mt-1">Constructed pucca dwelling or ₹1.5 Lakh grant in lieu</p>
                  </div>
                  <div className="text-2xl" title={parcel.housing_status}>
                    {getStatusIcon(parcel.housing_status)}
                  </div>
                </div>

                <div className="pt-2 border-t border-govSlate-200/60 flex items-center justify-between">
                  <span className="text-xs text-govSlate-500">Status:</span>
                  <StatusBadge status={parcel.housing_status} type="rnr" />
                </div>
              </div>

              {/* Livelihood Assistance Card */}
              <div className="p-4 rounded-xl border border-govSlate-200/80 bg-surface-container-low/40 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-govSlate-500 uppercase tracking-wider">Assistance 2</span>
                    <h4 className="text-sm font-bold text-govSlate-900 mt-0.5">Livelihood Assistance</h4>
                    <p className="text-[11px] text-govSlate-500 mt-1">One-time resettlement allowance &amp; annuity entitlement</p>
                  </div>
                  <div className="text-2xl" title={parcel.livelihood_status}>
                    {getStatusIcon(parcel.livelihood_status)}
                  </div>
                </div>

                <div className="pt-2 border-t border-govSlate-200/60 flex items-center justify-between">
                  <span className="text-xs text-govSlate-500">Status:</span>
                  <StatusBadge status={parcel.livelihood_status} type="rnr" />
                </div>
              </div>

              {/* Resettlement Plot Card */}
              <div className="p-4 rounded-xl border border-govSlate-200/80 bg-surface-container-low/40 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-govSlate-500 uppercase tracking-wider">Assistance 3</span>
                    <h4 className="text-sm font-bold text-govSlate-900 mt-0.5">Resettlement Plot</h4>
                    <p className="text-[11px] text-govSlate-500 mt-1">Allotment of alternate residential plot in designated resettlement enclave</p>
                  </div>
                  <div className="text-2xl" title={parcel.resettlement_status}>
                    {getStatusIcon(parcel.resettlement_status)}
                  </div>
                </div>

                <div className="pt-2 border-t border-govSlate-200/60 flex items-center justify-between">
                  <span className="text-xs text-govSlate-500">Status:</span>
                  <StatusBadge status={parcel.resettlement_status} type="rnr" />
                </div>
              </div>
            </div>

            {/* Overall Weighted Progress Bar */}
            <div className="p-4 rounded-xl bg-white border border-govSlate-200/70">
              <ProgressBar
                value={parcel.rnr_overall_pct}
                max={100}
                label="Overall R&R Statutory Compliance Index"
                sublabel="Calculated as: Completed (100%), In Progress (50%), Not Started (0%) averaged across all three statutory assistances."
                color="emerald"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
