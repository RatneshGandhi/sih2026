import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const STAGE_COLORS = {
  proposal_submitted: '#94A3B8',
  document_verification: '#38BDF8',
  district_scrutiny: '#F2A93B',
  state_approval: '#8B5CF6',
  award_declared: '#A78BFA',
  compensation_disbursed: '#34D399',
  possession_taken: '#0E9F6E'
};

const STAGE_LABELS = {
  proposal_submitted: 'Proposal Submitted',
  document_verification: 'Doc Verification',
  district_scrutiny: 'District Scrutiny',
  state_approval: 'State Approval',
  award_declared: 'Award Declared',
  compensation_disbursed: 'Compensation Disbursed',
  possession_taken: 'Possession Taken'
};

export default function StateGovernmentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/state/overview');
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load state overview:', err);
      if (err.response?.status === 403) {
        setError(err.response?.data?.error || 'Access Denied: State Government authorization required.');
      } else {
        setError('Failed to load State Government overview metrics.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.post(`/state/alerts/${alertId}/acknowledge`, {
        notes: 'Acknowledged from Executive Overview Desk'
      });
      loadDashboard();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      alert('Could not acknowledge alert: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            Aggregating State Infrastructure Cadastre ({user?.state || 'Maharashtra'})...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <span className="material-symbols-outlined text-red-600 text-3xl">gpp_bad</span>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 text-base">State Access Restricted</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={loadDashboard}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const stageDist = data?.stage_distribution || [];
  const districtPerf = data?.district_performance || [];
  const pendingApprovals = data?.pending_approvals || [];
  const priorityAlerts = data?.priority_alerts || [];
  const stateName = data?.state || user?.state || 'Maharashtra';

  const stagePieData = stageDist.map(s => ({
    name: STAGE_LABELS[s.stage] || s.stage,
    value: s.count,
    stageKey: s.stage
  })).filter(s => s.value > 0);

  const districtChartData = districtPerf.map(d => ({
    name: d.district,
    'Acquired (Ha)': Number(d.acquired_ha) || 0,
    'Pending (Ha)': Math.max(0, (Number(d.proposed_ha) || 0) - (Number(d.acquired_ha) || 0)),
    'Progress %': d.progress_pct || 0,
    score: d.score || 0
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-purple-800/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <span className="material-symbols-outlined text-[160px]">account_balance</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-600/80 text-purple-100 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-400/30">
                Mantralaya Apex Portal
              </span>
              <span className="bg-emerald-600/60 text-emerald-200 text-[11px] font-mono px-2 py-0.5 rounded border border-emerald-400/30">
                Authorized: {stateName}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              State Land Acquisition &amp; Infrastructure Desk
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Statutory executive monitoring under RFCTLARR Act 2013. Real-time multi-district tracking, cabinet approvals, and bottleneck intervention.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboard}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all"
              title="Refresh Live Data"
            >
              <span className={`material-symbols-outlined text-[18px] ${refreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>{refreshing ? 'Refreshing...' : 'Live Sync'}</span>
            </button>
            <button
              onClick={() => navigate('/state/approvals')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/40 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>Approvals Queue ({kpis.pending_state_approvals_count || 0})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flagged Bottleneck Notice (e.g. Ratnagiri Corridor Alert) */}
      {data?.flagged_bottleneck && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-2xl">crisis_alert</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
                    Cabinet Priority Flag
                  </span>
                  <span className="text-xs font-bold text-amber-950">
                    District Bottleneck Identified
                  </span>
                </div>
                <h3 className="font-extrabold text-amber-950 text-base mt-0.5">
                  {data.flagged_bottleneck.title}
                </h3>
                <p className="text-xs text-amber-800 mt-1 max-w-3xl leading-relaxed">
                  {data.flagged_bottleneck.description}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-[11px] font-medium text-amber-900">
                  <span>District: <strong>{data.flagged_bottleneck.district}</strong></span>
                  <span>Impact: <strong>{data.flagged_bottleneck.pending_pct_of_state}% of State Pending Land</strong></span>
                  <span>Delay: <strong className="text-red-700">{data.flagged_bottleneck.delay_days} Days Overdue</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/state/interventions')}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-all self-start sm:self-center"
            >
              <span>Review Resource Intervention</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Level KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Projects */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">State Projects</span>
              <span className="material-symbols-outlined text-purple-600 text-2xl">account_tree</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-tnum">
                {kpis.total_projects || 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">Across {kpis.districts_active || 0} Districts</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Est. Budget</span>
            <span className="font-extrabold text-slate-900 font-mono">
              ₹{(kpis.total_budget_cr || 0).toLocaleString('en-IN')} Cr
            </span>
          </div>
        </div>

        {/* KPI 2: Land Acquired */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Land Acquisition</span>
              <span className="material-symbols-outlined text-emerald-600 text-2xl">landscape</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700 font-tnum">
                {(kpis.land_acquired_ha || 0).toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-500">
                / {(kpis.total_land_proposed_ha || 0).toFixed(1)} Ha
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">Completion</span>
              <span className="font-bold text-emerald-700">{kpis.land_acquisition_pct || 0}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, kpis.land_acquisition_pct || 0)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 3: Compensation Disbursed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">DBT Compensation</span>
              <span className="material-symbols-outlined text-indigo-600 text-2xl">account_balance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-900 font-tnum">
                ₹{(kpis.compensation_paid_cr || 0).toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-500">
                / ₹{(kpis.compensation_assessed_cr || 0).toFixed(1)} Cr
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">Disbursed Ratio</span>
              <span className="font-bold text-indigo-700">{kpis.compensation_paid_pct || 0}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, kpis.compensation_paid_pct || 0)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Approvals & Interventions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">State Clearances</span>
              <span className="material-symbols-outlined text-purple-600 text-2xl">fact_check</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-700 font-tnum">
                {kpis.pending_state_approvals_count || 0}
              </span>
              <span className="text-xs font-medium text-slate-500">Awaiting State Seal</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Critical Alerts</span>
            <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
              (kpis.active_alerts_count || 0) > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {kpis.active_alerts_count || 0} Active
            </span>
          </div>
        </div>
      </div>

      {/* Visual Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Acquisition Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">District-wise Acquisition Progress</h3>
              <p className="text-xs text-slate-500">Acquired vs Pending Land across key collectorates</p>
            </div>
            <button
              onClick={() => navigate('/state/districts')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>Full Matrix</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  formatter={(value, name) => [`${value} Ha`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="Acquired (Ha)" fill="#0E9F6E" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Pending (Ha)" fill="#F2A93B" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-600 rounded-sm"></span>
              <span>Acquired Land (Ha)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-sm"></span>
              <span>Pending Land (Ha)</span>
            </div>
          </div>
        </div>

        {/* Project Lifecycle Stage Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Lifecycle Pipeline</h3>
              <p className="text-xs text-slate-500">Projects by RFCTLARR statutory stage</p>
            </div>
            <button
              onClick={() => navigate('/state/projects')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {stagePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stagePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stagePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stageKey] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No project data available</span>
            )}
          </div>

          <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
            {stagePieData.map(s => (
              <div key={s.stageKey} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STAGE_COLORS[s.stageKey] || '#94A3B8' }}
                  ></span>
                  <span className="text-slate-700 truncate max-w-[140px]">{s.name}</span>
                </div>
                <span className="font-bold font-mono text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Operational Queues: Pending Approvals & Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending State Approvals Queue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 text-xl">fact_check</span>
              <h3 className="font-bold text-slate-900 text-sm">State Approval Queue</h3>
              <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {pendingApprovals.length} Pending
              </span>
            </div>
            <button
              onClick={() => navigate('/state/approvals')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>Manage Inbox</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-emerald-600 text-3xl mb-1">check_circle</span>
              <p className="text-xs font-semibold text-slate-700">No approvals pending state clearance.</p>
              <p className="text-[11px] text-slate-400">All district dossiers are cleared.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(app => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {app.project_code}
                      </span>
                      <span className="text-[11px] font-semibold text-purple-700">
                        {app.district}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">
                      {app.project_title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Submitted: {new Date(app.submitted_at).toLocaleDateString('en-IN')}</span>
                      <span>•</span>
                      <span>Pending: <strong>{app.days_pending || 0} Days</strong></span>
                      <span>•</span>
                      <span>Budget: ₹{(app.estimated_budget_cr || 0).toLocaleString('en-IN')} Cr</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/state/approvals?focus=${app.id}`)}
                    className="shrink-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold self-start sm:self-center flex items-center gap-1"
                  >
                    <span>Scrutinize</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Statutory Alerts & Escalations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-xl">notifications_active</span>
              <h3 className="font-bold text-slate-900 text-sm">Statutory Escalations</h3>
              <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                {priorityAlerts.length} Active
              </span>
            </div>
            <button
              onClick={() => navigate('/state/alerts')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {priorityAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-emerald-600 text-3xl mb-1">verified</span>
              <p className="text-xs font-semibold text-slate-700">Zero unhandled critical escalations.</p>
              <p className="text-[11px] text-slate-400">All collectorate notices are normal.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {priorityAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 bg-rose-50/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        alert.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {alert.district || 'State-wide'}
                      </span>
                      {alert.project_code && (
                        <span className="font-mono text-[10px] text-slate-500">
                          [{alert.project_code}]
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                      {alert.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold self-start sm:self-center"
                    title="Mark Acknowledged"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* District Decision-Support Rankings Preview Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">District Performance Matrix (RFCTLARR Compliance)</h3>
            <p className="text-xs text-slate-500">
              Composite decision-support index (0–100) reflecting acquisition speed, compensation completion, and dispute resolution.
            </p>
          </div>
          <button
            onClick={() => navigate('/state/districts')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Analysis</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Projects</th>
                <th className="py-2.5 px-3">Land Progress</th>
                <th className="py-2.5 px-3">Compensation Disbursed</th>
                <th className="py-2.5 px-3">Decision Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districtPerf.map(d => {
                const score = d.score || 0;
                let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                let label = 'Satisfactory';
                if (score < 60) {
                  badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                  label = 'Critical Lag';
                } else if (score < 75) {
                  badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                  label = 'Needs Follow-up';
                }

                return (
                  <tr key={d.district} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{d.district}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{d.projects_count}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{d.progress_pct}%</span>
                        <span className="text-slate-400 text-[11px]">({Number(d.acquired_ha).toFixed(1)} / {Number(d.proposed_ha).toFixed(1)} Ha)</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      ₹{Number(d.compensation_paid_cr).toFixed(1)} Cr ({d.compensation_pct}%)
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-sm text-slate-900">{score}</span>
                        <span className="text-[10px] text-slate-400">/ 100</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${badgeClass}`}>
                        {label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/state/districts?district=${d.district}`)}
                        className="text-purple-600 hover:text-purple-800 font-semibold text-xs"
                      >
                        Inspect
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
  );
}
