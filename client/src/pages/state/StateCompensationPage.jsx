import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function StateCompensationPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ovRes, distRes] = await Promise.all([
        api.get('/state/overview'),
        api.get('/state/districts')
      ]);
      setOverview(ovRes.data);
      setDistricts(distRes.data.districts || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load state compensation data:', err);
      setError('Unable to load state compensation metrics from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
        <span className="text-xs text-slate-500 font-medium">Reconciling State Treasury &amp; DBT Accounts...</span>
      </div>
    );
  }

  const kpis = overview?.kpis || {};

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Direct Benefit Transfer &amp; R&amp;R
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            State Compensation &amp; Rehabilitation Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time reconciliation of Section 26 valuations, statutory solatium, and PFMS DBT disbursements.
          </p>
        </div>

        <button
          onClick={() => navigate('/state/reports')}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">summarize</span>
          <span>Download Statement</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Assessed Compensation</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              ₹{(kpis.compensation_assessed_cr || 0).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">Cr</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Section 26 statutory market valuation</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Disbursed via DBT</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-emerald-700 font-mono">
              ₹{(kpis.compensation_paid_cr || 0).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-emerald-600">Cr ({kpis.compensation_paid_pct || 0}%)</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Directly credited to Aadhaar bank accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Pending in Treasury</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-amber-700 font-mono">
              ₹{(kpis.compensation_pending_cr || 0).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-amber-600">Cr</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting legal clearance or dispute closure</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">R&amp;R Resettlement Ratio</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-indigo-900 font-mono">
              {kpis.rnr_completed_count || 0}
            </span>
            <span className="text-xs text-slate-500">/ {kpis.total_claims || 0} Claims</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Second Schedule entitlements satisfied</p>
        </div>
      </div>

      {/* District-wise Compensation Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">District Collectorate Disbursement Ledger</h3>
            <p className="text-xs text-slate-500">Breakdown of assessed, disbursed, and pending amounts by district</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Total Assessed</th>
                <th className="py-2.5 px-3">Disbursed (DBT)</th>
                <th className="py-2.5 px-3">Disbursed %</th>
                <th className="py-2.5 px-3">R&amp;R Resettled</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districts.map(d => (
                <tr key={d.district} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{d.district}</td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-800">
                    ₹{Number(d.compensation_assessed_cr || 0).toFixed(1)} Cr
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                    ₹{Number(d.compensation_paid_cr || 0).toFixed(1)} Cr
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{d.compensation_pct || 0}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${Math.min(100, d.compensation_pct || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {d.rnr_completed_count || 0} / {d.total_claims || 0}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/state/projects?district=${d.district}`)}
                      className="text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      View Projects
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
