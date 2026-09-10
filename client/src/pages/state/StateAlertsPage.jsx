import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function StateAlertsPage() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/state/alerts', { params });
      setAlerts(res.data.alerts || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load state alerts:', err);
      setError('Unable to load statutory alerts from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  const handleAcknowledge = async (alertId) => {
    try {
      await api.post(`/state/alerts/${alertId}/acknowledge`, {
        notes: 'Acknowledged by State Revenue Officer via Web Portal'
      });
      loadAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      alert('Could not acknowledge alert: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Statutory Notifications
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            State Government Statutory Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated compliance warnings, collectorate escalations, and timeline delay notifications.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="info">Info</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="active">Active Alerts</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="all">All Statuses</option>
          </select>

          <button
            onClick={loadAlerts}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-500">Retrieving active alerts...</span>
        </div>
      ) : error ? (
        <div className="p-5 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs">
          {error}
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <span className="material-symbols-outlined text-emerald-600 text-5xl mb-2">verified</span>
          <h3 className="font-bold text-slate-800 text-sm">No alerts matching filter criteria</h3>
          <p className="text-xs text-slate-400 mt-1">All district notifications are acknowledged.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(a => {
            const isCritical = a.severity === 'critical';
            const isAcknowledged = a.status === 'acknowledged';

            return (
              <div
                key={a.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isAcknowledged
                    ? 'bg-slate-50/70 border-slate-200 opacity-70'
                    : isCritical
                    ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isCritical ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {isCritical ? 'warning' : 'notifications'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        isCritical ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {a.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{a.district || 'State-wide'}</span>
                      {a.project_code && (
                        <span className="font-mono text-[10px] text-slate-500">[{a.project_code}]</span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {a.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {a.description}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Triggered: {new Date(a.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {!isAcknowledged && (
                  <button
                    onClick={() => handleAcknowledge(a.id)}
                    className="shrink-0 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold self-start md:self-center"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
