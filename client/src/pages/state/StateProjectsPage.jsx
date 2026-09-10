import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const STAGE_LABELS = {
  proposal_submitted: '1. Proposal Submitted',
  document_verification: '2. Doc Verification',
  district_scrutiny: '3. District Scrutiny',
  state_approval: '4. State Approval',
  award_declared: '5. Award Declared',
  compensation_disbursed: '6. Compensation Disbursed',
  possession_taken: '7. Possession Taken'
};

const STAGE_COLORS = {
  proposal_submitted: 'bg-slate-100 text-slate-700 border-slate-300',
  document_verification: 'bg-sky-100 text-sky-800 border-sky-300',
  district_scrutiny: 'bg-amber-100 text-amber-800 border-amber-300',
  state_approval: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
  award_declared: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  compensation_disbursed: 'bg-teal-100 text-teal-800 border-teal-300',
  possession_taken: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
};

const RISK_CONFIG = {
  low: { label: 'Low Risk', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium Risk', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High Risk', badge: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold' },
  critical: { label: 'CRITICAL RISK', badge: 'bg-red-100 text-red-800 border-red-400 font-bold' }
};

export default function StateProjectsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [timelineFilter, setTimelineFilter] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (districtFilter) params.district = districtFilter;
      if (stageFilter) params.stage = stageFilter;
      if (riskFilter) params.risk = riskFilter;
      if (timelineFilter) params.timeline = timelineFilter;
      if (search) params.search = search;

      const res = await api.get('/state/projects', { params });
      setProjects(res.data.projects || []);
      setDistricts(res.data.districts || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load state projects:', err);
      setError('Could not retrieve state project records from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [districtFilter, stageFilter, riskFilter, timelineFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProjects();
  };

  const handleClearFilters = () => {
    setSearch('');
    setDistrictFilter('');
    setStageFilter('');
    setRiskFilter('');
    setTimelineFilter('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              State Project Portfolio
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Infrastructure &amp; Acquisition Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor progress across all district collectors, land acquisition milestones, and state gazette awards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/state/approvals')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            <span>Cabinet Clearances</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, project code (e.g. MH-PUN-001), or agency..."
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setTimeout(loadProjects, 50); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Search
          </button>
        </form>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 pt-1">
          {/* District filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-purple-500"
          >
            <option value="">All Districts ({districts.length})</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Stage filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-purple-500"
          >
            <option value="">All Lifecycle Stages</option>
            {Object.entries(STAGE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {/* Risk filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-purple-500"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          {/* Timeline filter */}
          <select
            value={timelineFilter}
            onChange={(e) => setTimelineFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-none focus:border-purple-500"
          >
            <option value="">All Timeline Statuses</option>
            <option value="delayed">Delayed / Overdue</option>
            <option value="on_track">On Track</option>
            <option value="ahead">Ahead of Schedule</option>
          </select>

          {/* Clear Button */}
          <button
            onClick={handleClearFilters}
            className="col-span-2 sm:col-span-4 lg:col-span-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Projects Listing */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-500 font-medium">Filtering state projects...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">folder_off</span>
          <h3 className="font-bold text-slate-800 text-sm">No matching projects found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search query.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const riskInfo = RISK_CONFIG[proj.risk_level] || RISK_CONFIG.low;
            const progress = Number(proj.progress_pct) || 0;
            const isDelayed = proj.timeline_status === 'delayed';

            return (
              <div
                key={proj.id}
                onClick={() => navigate(`/state/projects/${proj.id}`)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {proj.project_code}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {proj.district}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskInfo.badge}`}>
                      {riskInfo.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-purple-700 transition-colors leading-snug">
                    {proj.title}
                  </h3>

                  {/* Agency */}
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">apartment</span>
                    <span className="truncate">{proj.implementing_agency || 'State Dept'}</span>
                  </p>

                  {/* Stage badge */}
                  <div className="mt-3">
                    <span className={`inline-block text-[11px] px-2.5 py-1 rounded-lg border font-medium ${STAGE_COLORS[proj.status] || 'bg-slate-100 text-slate-700'}`}>
                      {STAGE_LABELS[proj.status] || proj.status}
                    </span>
                  </div>

                  {/* Land & Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Acquired Land</span>
                      <span className="font-bold text-slate-900">
                        {(Number(proj.acquired_ha) || 0).toFixed(1)} / {(Number(proj.total_ha) || 0).toFixed(1)} Ha ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progress >= 80 ? 'bg-emerald-600' : progress >= 50 ? 'bg-amber-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isDelayed ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    <span className={`font-semibold capitalize text-[11px] ${isDelayed ? 'text-red-700' : 'text-slate-600'}`}>
                      {proj.timeline_status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-purple-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>View Dossier</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
