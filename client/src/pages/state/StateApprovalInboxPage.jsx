import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const STATUS_BADGES = {
  pending: { label: 'Pending Clearance', badge: 'bg-purple-100 text-purple-800 border-purple-300 font-bold' },
  approved: { label: 'Gazette Approved', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold' },
  returned_for_correction: { label: 'Returned to District', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  rejected: { label: 'Rejected', badge: 'bg-rose-100 text-rose-800 border-rose-300' },
  clarification_requested: { label: 'Clarification Sought', badge: 'bg-sky-100 text-sky-800 border-sky-300' }
};

export default function StateApprovalInboxPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState(null);

  // Action modal
  const [actionType, setActionType] = useState(null); // 'approve' | 'return_for_correction' | 'reject' | 'clarification'
  const [comments, setComments] = useState('');
  const [gazetteRef, setGazetteRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/state/approvals', { params });
      const list = res.data.approvals || [];
      setApprovals(list);

      if (focusId) {
        const found = list.find(a => String(a.id) === String(focusId));
        if (found) setSelectedApproval(found);
      } else if (list.length > 0 && !selectedApproval) {
        setSelectedApproval(list[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load state approvals:', err);
      setError('Unable to load approval queue records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [statusFilter]);

  const handleAction = async () => {
    if (!actionType || !selectedApproval) return;
    if (!comments.trim() && actionType !== 'approve') {
      alert('Statutory directives/remarks are mandatory for this action.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/state/approvals/${selectedApproval.id}/action`, {
        action: actionType,
        comments,
        gazette_reference: gazetteRef || undefined
      });

      alert(`Statutory action successfully committed: ${actionType.replace('_', ' ').toUpperCase()}`);
      setActionType(null);
      setComments('');
      setGazetteRef('');
      loadApprovals();
    } catch (err) {
      console.error('Failed to execute action:', err);
      alert('Action error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Cabinet Clearances &amp; Gazette Desk
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            State Government Approval Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory review of land acquisition dossiers submitted by District Collectors under Section 19 &amp; Section 23.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['all', 'pending', 'approved', 'returned_for_correction'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Approvals */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
              <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs text-slate-500">Loading state approvals...</span>
            </div>
          ) : error ? (
            <div className="p-5 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs">
              {error}
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
              <span className="material-symbols-outlined text-slate-300 text-5xl mb-2">inbox</span>
              <p className="text-xs font-bold text-slate-700">No approval dossiers in this queue</p>
              <p className="text-[11px] text-slate-400 mt-0.5">All collectorate submissions are processed.</p>
            </div>
          ) : (
            approvals.map(app => {
              const isSelected = selectedApproval?.id === app.id;
              const badge = STATUS_BADGES[app.approval_status] || STATUS_BADGES.pending;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApproval(app)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-50/40 border-purple-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {app.project_code}
                      </span>
                      <span className="text-xs font-bold text-purple-800">{app.district}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${badge.badge}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                    {app.project_title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                    <span>Submitted: {new Date(app.submitted_at).toLocaleDateString('en-IN')}</span>
                    <span className="font-semibold text-slate-700">
                      ₹{Number(app.estimated_budget_cr).toLocaleString('en-IN')} Cr
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Dossier Detail & Action Desk */}
        <div className="lg:col-span-7">
          {selectedApproval ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {selectedApproval.project_code}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {selectedApproval.district} Collectorate
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                    {selectedApproval.project_title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Agency: <span className="font-semibold text-slate-700">{selectedApproval.implementing_agency || 'State Dept'}</span>
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/state/projects/${selectedApproval.project_id}`)}
                  className="shrink-0 text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 self-start"
                >
                  <span>Full Project Dossier</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              </div>

              {/* Status and Submission Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Submission Date</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {new Date(selectedApproval.submitted_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Days in Queue</span>
                  <span className="font-extrabold text-purple-700 mt-0.5 block font-mono">
                    {selectedApproval.days_pending || 0} Days
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Required Area</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {Number(selectedApproval.total_land_required_hectares || 0).toFixed(1)} Ha
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Estimated Budget</span>
                  <span className="font-bold text-slate-900 font-mono mt-0.5 block">
                    ₹{Number(selectedApproval.estimated_budget_cr).toLocaleString('en-IN')} Cr
                  </span>
                </div>
              </div>

              {/* District Scrutiny Notes */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600 font-semibold">
                  <span>District Collector Scrutiny Remarks</span>
                  <span className="font-mono text-[10px] text-slate-400">Section 15 Clear</span>
                </div>
                <p className="text-slate-800 leading-relaxed italic">
                  "{selectedApproval.decision_notes || 'All statutory preliminary notices and public SIA hearings concluded without unresolved stay orders. Submitted for State Cabinet clearance.'}"
                </p>
              </div>

              {/* State Action Execution Desk */}
              <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-700 text-xl">gavel</span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      State Sovereign Clearance Desk
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                    RFCTLARR 2013
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => { setActionType('approve'); setGazetteRef(`MH-GOV-GZ-${new Date().getFullYear()}-${selectedApproval.id}`); }}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">verified</span>
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => setActionType('return_for_correction')}
                    className="p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">replay</span>
                    <span>Return</span>
                  </button>

                  <button
                    onClick={() => setActionType('clarification')}
                    className="p-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">help</span>
                    <span>Clarification</span>
                  </button>

                  <button
                    onClick={() => setActionType('reject')}
                    className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">cancel</span>
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
              <p className="text-xs font-semibold">Select an approval dossier to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionType && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base capitalize">
                {actionType.replace('_', ' ')}: {selectedApproval.project_code}
              </h3>
              <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {actionType === 'approve' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gazette Declaration Notification Reference
                </label>
                <input
                  type="text"
                  value={gazetteRef}
                  onChange={(e) => setGazetteRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Remarks / Directives {actionType !== 'approve' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter official executive comments..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleAction}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                {submitting ? 'Executing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
