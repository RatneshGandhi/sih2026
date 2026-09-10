import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function StateRiskAnalysisPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRisk = async () => {
    try {
      setLoading(true);
      const res = await api.get('/state/risk-analysis');
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load state risk analysis:', err);
      setError('Unable to aggregate risk analysis metrics from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisk();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
        <span className="text-xs text-slate-500 font-medium">Synthesizing Litigation &amp; Environmental Risks...</span>
      </div>
    );
  }

  const summary = data?.risk_summary || {};
  const highRiskProjects = data?.high_risk_projects || [];
  const districtRisks = data?.district_risks || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Legal &amp; Environmental Risk Matrix
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            State Infrastructure Risk Assessment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify high-risk projects vulnerable to judicial stays, valuation litigation, or environmental objections.
          </p>
        </div>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">High-Risk Undertakings</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-700 font-mono">
              {summary.high_risk_count || 0}
            </span>
            <span className="text-xs text-slate-500">of {summary.total_projects || 0} Projects</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires heightened executive monitoring</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Disputed Parcels</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-700 font-mono">
              {summary.total_disputed_parcels || 0}
            </span>
            <span className="text-xs text-slate-500">Parcels</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Valuation, ownership, or boundary contests</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Overdue Projects</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-red-700 font-mono">
              {summary.delayed_projects_count || 0}
            </span>
            <span className="text-xs text-slate-500">Projects</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Past statutory milestone dates</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Pending Escrow</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-indigo-900 font-mono">
              ₹{(summary.pending_compensation_cr || 0).toFixed(1)} Cr
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending DBT release to owners</p>
        </div>
      </div>

      {/* High-Risk Projects Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Critical Risk Project Watchlist</h3>
            <p className="text-xs text-slate-500">Projects ranked by legal, environmental, and timeline severity</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Timeline</th>
                <th className="py-2.5 px-3">Disputed Parcels</th>
                <th className="py-2.5 px-3">Pending Land</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highRiskProjects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{proj.title}</div>
                    <div className="font-mono text-[10px] text-slate-500">{proj.project_code}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{proj.district}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                      {proj.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-3 capitalize">
                    <span className={`font-semibold ${proj.timeline_status === 'delayed' ? 'text-red-700' : 'text-slate-700'}`}>
                      {proj.timeline_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-700">
                    {proj.disputed_parcels || 0}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800">
                    {Number(proj.pending_ha || 0).toFixed(1)} Ha
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/state/projects/${proj.id}`)}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold"
                    >
                      Inspect
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
