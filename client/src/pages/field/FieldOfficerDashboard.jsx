import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500', color: '#F2A93B' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-600', color: '#3B82F6' },
  verified: { label: 'Verified', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600', color: '#0E9F6E' },
  submitted_for_review: { label: 'Submitted for Review', bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-500', color: '#64748B' },
  disputed: { label: 'Disputed / Flagged', bg: 'bg-red-50 text-red-800 border-red-200', dot: 'bg-red-600', color: '#BA1A1A' }
};

export const PRIORITY_CONFIG = {
  urgent: { label: 'URGENT', badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' },
  high: { label: 'HIGH', badge: 'bg-orange-100 text-orange-800 border-orange-300 font-semibold' },
  medium: { label: 'MEDIUM', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  low: { label: 'LOW', badge: 'bg-slate-100 text-slate-600 border-slate-200' }
};

export default function FieldOfficerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        const res = await api.get('/field/overview');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load field officer overview:', err);
        setError('Unable to load field operational metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-on-surface-variant font-semibold">
            Synchronizing Field Survey Assignments...
          </span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const recentParcels = data?.recent_parcels || [];
  const urgentTasks = data?.urgent_tasks || [];
  const recentIssues = data?.recent_issues || [];

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Top Field Operations Header Strip */}
      <div className="w-full bg-white rounded-xl p-space-md border border-govSlate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[28px]">explore</span>
          </div>
          <div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-bold text-xl text-primary tracking-tight font-sans">
                Field Operations &amp; Verification Hub
              </h1>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                OFFICER: {user?.name || 'FIELD REVENUE INSPECTOR'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Statutory on-ground GPS boundary demarcation, physical asset inventory &amp; socio-economic survey under RFCTLARR Act 2013
            </p>
          </div>
        </div>

        {/* Quick Nav Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/field/map')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs border border-govSlate-200 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">map</span>
            <span>Assigned GIS Map</span>
          </button>
          <button
            onClick={() => navigate('/field/parcels')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">checklist</span>
            <span>View All Parcels ({kpis.total_assigned})</span>
          </button>
        </div>
      </div>

      {/* Overdue / High Priority Alert Banner if any */}
      {kpis.overdue_count > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-600 text-[24px]">warning</span>
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                Statutory Notice: {kpis.overdue_count} Field Verification Task(s) Past Gazette Deadline
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Section 11/19 declaration milestones require immediate submission of ground demarcation reports.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/field/parcels?priority=urgent')}
            className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-all shrink-0"
          >
            View Urgent Tasks
          </button>
        </div>
      )}

      {/* Summary KPI Cards - FIELD OPERATIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Total Assigned */}
        <div
          onClick={() => navigate('/field/parcels')}
          className="bg-white p-space-md rounded-xl border border-govSlate-200 shadow-xs hover:border-primary/40 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-govSlate-600 uppercase tracking-wider">Assigned Parcels</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-primary font-mono font-tnum">
              {kpis.total_assigned}
            </div>
            <div className="text-[11px] text-govSlate-500 mt-1 flex items-center gap-1 font-sans">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Across allocated state corridors</span>
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        <div
          onClick={() => navigate('/field/parcels?status=pending')}
          className="bg-white p-space-md rounded-xl border border-govSlate-200 shadow-xs hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-govSlate-600 uppercase tracking-wider">Pending Verification</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 font-mono font-tnum">
              {kpis.pending_count}
            </div>
            <div className="text-[11px] text-govSlate-500 mt-1 flex items-center gap-1 font-sans">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Awaiting on-site survey inspection</span>
            </div>
          </div>
        </div>

        {/* Completed / Submitted */}
        <div
          onClick={() => navigate('/field/parcels?status=submitted_for_review')}
          className="bg-white p-space-md rounded-xl border border-govSlate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-govSlate-600 uppercase tracking-wider">Completed / Submitted</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 font-mono font-tnum">
              {kpis.completed_count}
            </div>
            <div className="text-[11px] text-govSlate-500 mt-1 flex items-center gap-1 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Submitted for District Scrutiny</span>
            </div>
          </div>
        </div>

        {/* Disputed / Flagged */}
        <div
          onClick={() => navigate('/field/parcels?status=disputed')}
          className="bg-white p-space-md rounded-xl border border-govSlate-200 shadow-xs hover:border-red-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-govSlate-600 uppercase tracking-wider">Disputed / Flagged</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">flag</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-600 font-mono font-tnum">
              {kpis.disputed_count}
            </div>
            <div className="text-[11px] text-govSlate-500 mt-1 flex items-center gap-1 font-sans">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Boundary or ownership discrepancies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Assigned Parcels & Urgent Due Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Left 2 Cols: Assigned Parcels Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-govSlate-200 shadow-xs p-space-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-govSlate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
                <h3 className="font-bold text-sm text-primary font-sans">
                  Recent Assigned Land Parcels
                </h3>
              </div>
              <button
                onClick={() => navigate('/field/parcels')}
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                <span>View Full Register</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-govSlate-200 text-govSlate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Parcel ID &amp; Survey</th>
                    <th className="py-2.5 px-3">Project / Location</th>
                    <th className="py-2.5 px-3">Area (Ha)</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govSlate-100">
                  {recentParcels.map((parcel) => {
                    const statusConf = STATUS_CONFIG[parcel.verification_status] || STATUS_CONFIG.pending;
                    const prioConf = PRIORITY_CONFIG[parcel.priority] || PRIORITY_CONFIG.medium;
                    return (
                      <tr key={parcel.parcel_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-primary">#{parcel.parcel_id}</div>
                          <div className="text-govSlate-600 font-semibold">{parcel.survey_number}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-govSlate-800 line-clamp-1 max-w-[220px]" title={parcel.project_name}>
                            {parcel.project_name}
                          </div>
                          <div className="text-[11px] text-govSlate-500">
                            {parcel.village}, {parcel.district}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-govSlate-700">
                          {parcel.area_hectares} Ha
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${prioConf.badge}`}>
                            {prioConf.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusConf.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}></span>
                            <span>{statusConf.label}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => navigate(`/field/parcels/${parcel.parcel_id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-white hover:bg-primary/90 text-xs font-semibold shadow-xs"
                          >
                            <span>{parcel.verification_status === 'pending' ? 'Start' : 'Open'}</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Statutory Deadlines & Flagged Discrepancies */}
        <div className="flex flex-col gap-space-md">
          {/* Urgent / Overdue Tasks */}
          <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs p-space-md">
            <div className="flex items-center justify-between border-b border-govSlate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-govAmber text-[20px]">timer</span>
                <h3 className="font-bold text-sm text-primary font-sans">
                  Upcoming &amp; Overdue Tasks
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                {urgentTasks.length} Queued
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {urgentTasks.map((task) => (
                <div
                  key={task.parcel_id}
                  onClick={() => navigate(`/field/parcels/${task.parcel_id}`)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    task.urgency === 'overdue'
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                      : 'bg-slate-50 border-govSlate-200 hover:border-primary/40'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-primary">{task.survey_number}</span>
                      {task.urgency === 'overdue' ? (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-rose-600 text-white rounded">
                          OVERDUE
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-amber-500 text-white rounded">
                          DUE SOON
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-govSlate-600 line-clamp-1">{task.project_name}</span>
                    <span className="text-[10px] text-govSlate-400">Village: {task.village}</span>
                  </div>
                  <span className="material-symbols-outlined text-govSlate-400 text-[18px]">chevron_right</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Flagged Discrepancies */}
          <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs p-space-md">
            <div className="flex items-center justify-between border-b border-govSlate-100 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-error text-[20px]">report_problem</span>
                <h3 className="font-bold text-sm text-primary font-sans">
                  Active Discrepancies
                </h3>
              </div>
              <button
                onClick={() => navigate('/field/issues')}
                className="text-[11px] font-semibold text-secondary hover:underline"
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {recentIssues.length === 0 ? (
                <p className="text-xs text-govSlate-400 italic py-2">No active discrepancies flagged.</p>
              ) : (
                recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => navigate('/field/issues')}
                    className="p-2 rounded-lg bg-red-50/50 border border-red-200 hover:border-red-400 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-red-900 line-clamp-1">{issue.title}</span>
                      <span className="font-mono text-[9px] px-1.5 py-0.2 uppercase font-bold rounded bg-red-200 text-red-800">
                        {issue.priority}
                      </span>
                    </div>
                    <p className="text-[10px] text-red-700 line-clamp-2 mt-0.5">{issue.description}</p>
                    <div className="flex items-center justify-between text-[9px] text-govSlate-500 mt-1">
                      <span>Survey: {issue.survey_number}</span>
                      <span className="capitalize font-medium text-govSlate-600">Status: {issue.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
