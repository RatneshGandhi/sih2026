import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { STATUS_CONFIG, PRIORITY_CONFIG } from './FieldOfficerDashboard';

export default function AssignedParcelsPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter and Search states initialized from URL params if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'assigned_date');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    async function fetchAssignedParcels() {
      try {
        setLoading(true);
        const params = {
          sort_by: sortBy,
          sort_order: sortOrder
        };
        if (search) params.search = search;
        if (status !== 'all') params.status = status;
        if (priority !== 'all') params.priority = priority;

        const res = await api.get('/field/parcels', { params });
        setParcels(res.data.parcels || []);
      } catch (err) {
        console.error('Failed to fetch assigned parcels:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignedParcels();
  }, [search, status, priority, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const getActionLabel = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Start Verification', icon: 'play_arrow', variant: 'bg-primary text-white hover:bg-primary/90' };
      case 'in_progress':
        return { label: 'Continue Survey', icon: 'edit_location', variant: 'bg-blue-600 text-white hover:bg-blue-700' };
      case 'submitted_for_review':
        return { label: 'View Submitted', icon: 'visibility', variant: 'bg-slate-700 text-white hover:bg-slate-800' };
      case 'disputed':
        return { label: 'Review Dispute', icon: 'report_problem', variant: 'bg-red-700 text-white hover:bg-red-800' };
      case 'verified':
      default:
        return { label: 'View Details', icon: 'visibility', variant: 'bg-emerald-700 text-white hover:bg-emerald-800' };
    }
  };

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Header Banner */}
      <div className="w-full bg-white rounded-xl p-space-md border border-govSlate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[26px] text-govEmerald">checklist</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-primary tracking-tight font-sans">
              Assigned Land Parcels
            </h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Demarcation roster and ground inspection pipeline allocated by Competent Authority Land Acquisition (CALA)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/field/map')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs border border-govSlate-200 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            <span>Switch to GIS Cadastre Map</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs p-space-md flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-govSlate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Parcel ID, Survey No, Village, Project..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-lg border border-govSlate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all font-sans"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-govSlate-400 hover:text-govSlate-600"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </form>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-lg border border-govSlate-200 focus:outline-none focus:ring-1 focus:ring-primary text-govSlate-700 font-medium"
            >
              <option value="all">All Verification Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted_for_review">Submitted for Review</option>
              <option value="verified">Verified</option>
              <option value="disputed">Disputed / Flagged</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-lg border border-govSlate-200 focus:outline-none focus:ring-1 focus:ring-primary text-govSlate-700 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-lg border border-govSlate-200 focus:outline-none focus:ring-1 focus:ring-primary text-govSlate-700 font-medium"
            >
              <option value="assigned_date">Sort by Assigned Date</option>
              <option value="due_date">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
              <option value="area_hectares">Sort by Cadastral Area</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              title={sortOrder === 'ASC' ? 'Ascending' : 'Descending'}
              className="p-2 rounded-lg bg-slate-50 border border-govSlate-200 text-govSlate-600 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-[18px]">
                {sortOrder === 'ASC' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(status !== 'all' || priority !== 'all' || search) && (
          <div className="flex items-center gap-2 pt-2 border-t border-govSlate-100 flex-wrap">
            <span className="text-[11px] font-bold text-govSlate-500 uppercase tracking-wider">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-red-600">×</button>
              </span>
            )}
            {status !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Status: {status}
                <button onClick={() => setStatus('all')} className="hover:text-red-600">×</button>
              </span>
            )}
            {priority !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Priority: {priority}
                <button onClick={() => setPriority('all')} className="hover:text-red-600">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearch(''); setStatus('all'); setPriority('all'); }}
              className="text-[11px] text-red-600 hover:underline font-semibold ml-2"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Parcels Content */}
      {loading ? (
        <div className="p-12 flex justify-center items-center bg-white rounded-xl border border-govSlate-200">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-govSlate-500 font-medium">Filtering allocated parcels...</span>
          </div>
        </div>
      ) : parcels.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-govSlate-200 text-center flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[48px] text-govSlate-300">search_off</span>
          <h3 className="font-bold text-sm text-primary font-sans">No Assigned Parcels Match Query</h3>
          <p className="text-xs text-govSlate-500 max-w-sm">
            Try adjusting your search keywords, status filters, or priority selections.
          </p>
          <button
            onClick={() => { setSearch(''); setStatus('all'); setPriority('all'); }}
            className="mt-2 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {parcels.map((parcel) => {
            const statusConf = STATUS_CONFIG[parcel.verification_status] || STATUS_CONFIG.pending;
            const prioConf = PRIORITY_CONFIG[parcel.priority] || PRIORITY_CONFIG.medium;
            const action = getActionLabel(parcel.verification_status);
            const assignedFormatted = new Date(parcel.assigned_date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            });
            const dueFormatted = parcel.due_date ? new Date(parcel.due_date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            }) : 'No deadline';

            return (
              <div
                key={parcel.id}
                className="bg-white rounded-xl border border-govSlate-200 shadow-xs hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header Strip */}
                <div className="p-4 border-b border-govSlate-100 flex items-start justify-between gap-2 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-primary">#{parcel.id}</span>
                      <span className="font-sans text-xs font-bold text-govSlate-700">{parcel.survey_number}</span>
                    </div>
                    <div className="text-[11px] font-medium text-govSlate-500 mt-0.5 line-clamp-1" title={parcel.project_name}>
                      {parcel.project_name}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${prioConf.badge}`}>
                      {prioConf.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConf.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}></span>
                      <span>{statusConf.label}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body Attributes */}
                <div className="p-4 flex flex-col gap-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-lg border border-govSlate-100">
                      <span className="text-govSlate-400 block font-semibold">Official Area</span>
                      <span className="font-mono font-bold text-govSlate-800 text-xs">{parcel.area_hectares} Ha</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-govSlate-100">
                      <span className="text-govSlate-400 block font-semibold">Classification</span>
                      <span className="capitalize font-semibold text-govSlate-800 text-xs">{parcel.land_type?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-govSlate-600">
                    <span className="material-symbols-outlined text-[16px] text-govSlate-400">location_on</span>
                    <span className="truncate">{parcel.village}, {parcel.district}, {parcel.state}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-govSlate-600">
                    <span className="material-symbols-outlined text-[16px] text-govSlate-400">person</span>
                    <span className="truncate">Owner: <strong>{parcel.owner_name}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-govSlate-500 border-t border-govSlate-100 pt-2 mt-1">
                    <div>Assigned: <strong>{assignedFormatted}</strong></div>
                    <div className="text-right">Due: <strong className={parcel.priority === 'urgent' ? 'text-rose-600' : ''}>{dueFormatted}</strong></div>
                  </div>

                  {parcel.open_issues_count > 0 && (
                    <div className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-red-200">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <span>{parcel.open_issues_count} Flagged Issue(s) Pending Resolution</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-slate-50 border-t border-govSlate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/field/map?parcel_id=${parcel.id}`)}
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 text-govSlate-700 border border-govSlate-200 text-xs font-semibold flex items-center gap-1 shadow-xs"
                    title="Locate boundary on GIS map"
                  >
                    <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                    <span className="hidden sm:inline">Map</span>
                  </button>

                  <button
                    onClick={() => navigate(`/field/parcels/${parcel.id}`)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs ${action.variant}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
