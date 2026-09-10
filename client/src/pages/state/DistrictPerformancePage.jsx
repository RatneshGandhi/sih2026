import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function DistrictPerformancePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDistrictFilter = searchParams.get('district') || '';

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'progress' | 'budget' | 'disputes'
  const [searchQuery, setSearchQuery] = useState(initialDistrictFilter);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/state/districts');
      setDistricts(res.data.districts || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load district performance:', err);
      setError('Unable to aggregate district performance metrics from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  const filteredDistricts = districts.filter(d =>
    d.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDistricts = [...filteredDistricts].sort((a, b) => {
    if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'progress') return (b.progress_pct || 0) - (a.progress_pct || 0);
    if (sortBy === 'budget') return (b.total_budget_cr || 0) - (a.total_budget_cr || 0);
    if (sortBy === 'disputes') return (b.disputed_parcels || 0) - (a.disputed_parcels || 0);
    return 0;
  });

  const topDistrict = districts.length > 0
    ? [...districts].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
    : null;

  const lowestDistrict = districts.length > 0
    ? [...districts].sort((a, b) => (a.score || 0) - (b.score || 0))[0]
    : null;

  const avgScore = districts.length > 0
    ? (districts.reduce((acc, d) => acc + (d.score || 0), 0) / districts.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Collectorate Benchmarking
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            District Performance &amp; Decision-Support Scoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective decision-support ranking across active collectorates under RFCTLARR 2013 monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/state/interventions')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
            <span>Intervention Planner</span>
          </button>
        </div>
      </div>

      {/* Decision-support heuristic disclosure note */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 flex items-start gap-3">
        <span className="material-symbols-outlined text-purple-700 text-xl shrink-0 mt-0.5">info</span>
        <div>
          <span className="font-bold">Decision-Support Scoring Index Heuristic: </span>
          <span>
            Scores (0–100) are synthesized from Acquisition Progress (35%), Compensation Disbursement (25%), R&amp;R Resettlement (20%), Timeline Adherence (10%), and Dispute Containment (10%). Designed as executive decision support for resource allocation.
          </span>
        </div>
      </div>

      {/* Benchmark Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Top Performing Collectorate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{topDistrict?.district || 'N/A'}</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">{topDistrict?.score || 0} / 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {topDistrict?.progress_pct || 0}% land acquired with ₹{Number(topDistrict?.compensation_paid_cr || 0).toFixed(1)} Cr disbursed
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">State Average Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-purple-800 font-tnum">{avgScore}</span>
            <span className="text-xs text-slate-500">/ 100 benchmark</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {districts.length} active project collectorates
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Critical Bottleneck District</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-rose-700">{lowestDistrict?.district || 'N/A'}</span>
            <span className="font-mono font-bold text-rose-700 text-sm">{lowestDistrict?.score || 0} / 100</span>
          </div>
          <p className="text-[11px] text-rose-600 mt-1 font-medium">
            Requires cabinet resource intervention ({lowestDistrict?.disputed_parcels || 0} disputed parcels)
          </p>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district name..."
            className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-purple-500"
          >
            <option value="score">Decision Score (Highest)</option>
            <option value="progress">Acquisition Progress %</option>
            <option value="budget">Estimated Budget</option>
            <option value="disputes">Disputed Parcels</option>
          </select>
        </div>
      </div>

      {/* District Cards Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-500 font-medium">Calculating district performance indices...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedDistricts.map(d => {
            const score = d.score || 0;
            const progress = d.progress_pct || 0;
            const compPct = d.compensation_pct || 0;

            let scoreBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            let statusText = 'Optimal Progress';
            if (score < 60) {
              scoreBadge = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
              statusText = 'Critical Lag - Action Required';
            } else if (score < 75) {
              scoreBadge = 'bg-amber-100 text-amber-800 border-amber-300';
              statusText = 'Moderate Progress';
            }

            return (
              <div
                key={d.district}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {d.district} District
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${scoreBadge}`}>
                        {score} / 100
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 block mb-3">
                    {statusText}
                  </span>

                  {/* Metrics Mini-Grid */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Active Projects</span>
                      <span className="font-extrabold text-slate-900 mt-0.5 block">{d.projects_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Budget</span>
                      <span className="font-extrabold text-slate-900 font-mono mt-0.5 block">
                        ₹{Number(d.total_budget_cr).toLocaleString('en-IN')} Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pending Clearances</span>
                      <span className="font-bold text-purple-700 mt-0.5 block">{d.pending_approvals_count} in queue</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Disputed Parcels</span>
                      <span className={`font-bold mt-0.5 block ${d.disputed_parcels > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {d.disputed_parcels} Flagged
                      </span>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600">Land Acquired</span>
                        <span className="font-bold text-slate-900">
                          {Number(d.acquired_ha).toFixed(1)} / {Number(d.proposed_ha).toFixed(1)} Ha ({progress}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600">DBT Compensation</span>
                        <span className="font-bold text-slate-900">
                          ₹{Number(d.compensation_paid_cr).toFixed(1)} Cr ({compPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${Math.min(100, compPct)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/state/projects?district=${d.district}`)}
                    className="text-purple-600 hover:text-purple-700 text-xs font-bold flex items-center gap-1"
                  >
                    <span>View Projects</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>

                  {score < 75 && (
                    <button
                      onClick={() => navigate(`/state/interventions?district=${d.district}`)}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-bold"
                    >
                      Intervene
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
