import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function StateProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Approval modal / action states
  const [actionModal, setActionModal] = useState(null); // 'approve' | 'return_for_correction' | 'reject' | 'clarification'
  const [actionComments, setActionComments] = useState('');
  const [gazetteRef, setGazetteRef] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const loadDossier = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/state/projects/${id}`);
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load project dossier:', err);
      if (err.response?.status === 403) {
        setError(err.response?.data?.error || 'Access Denied: You cannot view projects outside your authorized state jurisdiction.');
      } else if (err.response?.status === 404) {
        setError('Project dossier not found in state registry.');
      } else {
        setError('Unable to load project dossier from database.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDossier();
  }, [id]);

  const handleExecuteAction = async () => {
    if (!actionModal) return;
    if (!actionComments.trim() && actionModal !== 'approve') {
      alert('Statutory remarks are required for this action.');
      return;
    }

    try {
      setActionSubmitting(true);
      const approvalRecord = data?.state_approval;
      const approvalId = approvalRecord?.id || id;

      await api.post(`/state/approvals/${approvalId}/action`, {
        action: actionModal,
        comments: actionComments,
        gazette_reference: gazetteRef || undefined
      });

      alert(`Action successfully recorded: ${actionModal.replace('_', ' ').toUpperCase()}`);
      setActionModal(null);
      setActionComments('');
      setGazetteRef('');
      loadDossier();
    } catch (err) {
      console.error('Failed to execute state approval action:', err);
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            Decrypting State Project Dossier...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
          <span className="material-symbols-outlined text-red-600 text-5xl">gpp_maybe</span>
          <h2 className="text-lg font-bold text-red-900">Access Restricted</h2>
          <p className="text-xs text-red-700">{error}</p>
          <button
            onClick={() => navigate('/state/projects')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Return to State Projects
          </button>
        </div>
      </div>
    );
  }

  const project = data?.project || {};
  const parcels = data?.parcels || [];
  const milestones = data?.milestones || [];
  const comp = data?.compensation_summary || {};
  const isStateApprovalStage = project.status === 'state_approval';

  return (
    <div className="space-y-6 pb-16">
      {/* Top breadcrumb & back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/state/projects')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to State Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            {project.project_code}
          </span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {project.district}, {project.state}
          </span>
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-md border font-semibold ${STAGE_COLORS[project.status] || 'bg-slate-100 text-slate-700'}`}>
                {STAGE_LABELS[project.status] || project.status}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md border font-bold capitalize ${
                project.risk_level === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                project.risk_level === 'high' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                {project.risk_level} Risk
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Gazette: {project.gazette_notification_no || 'Pending'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {project.description || 'Statutory infrastructure land acquisition undertaking under RFCTLARR 2013.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block">Implementing Agency</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{project.implementing_agency}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Budget</span>
                <span className="font-extrabold text-slate-900 font-mono mt-0.5 block">
                  ₹{Number(project.estimated_budget_cr).toLocaleString('en-IN')} Cr
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Land Area</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {Number(project.total_land_required_hectares || 0).toFixed(1)} Ha
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Acquired Area</span>
                <span className="font-extrabold text-emerald-700 mt-0.5 block">
                  {Number(project.acquired_ha || 0).toFixed(1)} Ha ({project.progress_pct || 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Clearances Action Banner (Displayed if pending state approval) */}
      {isStateApprovalStage && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-purple-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-purple-500/80 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Cabinet Clearances Action Required
                </span>
                <span className="text-xs text-purple-200">Stage 4: State Sovereign Approval</span>
              </div>
              <h3 className="text-lg font-bold">
                Project Awaiting State Government Seal &amp; Gazette Declaration
              </h3>
              <p className="text-xs text-purple-200 max-w-2xl">
                The District Magistrate has completed Section 11 &amp; Section 15 hearings. Exercise statutory authority under RFCTLARR 2013:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => { setActionModal('approve'); setGazetteRef(`MH-GOV-GZ-${new Date().getFullYear()}-${project.id}`); }}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Grant State Approval</span>
              </button>

              <button
                onClick={() => setActionModal('return_for_correction')}
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                <span>Return for Scrutiny</span>
              </button>

              <button
                onClick={() => setActionModal('clarification')}
                className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">help</span>
                <span>Seek Clarification</span>
              </button>

              <button
                onClick={() => setActionModal('reject')}
                className="px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Reject Proposal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestones & Statutory Sections */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">RFCTLARR 2013 Statutory Milestones</h3>
            <p className="text-xs text-slate-500">Legal milestones from preliminary notification to possession</p>
          </div>
          <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
            {milestones.filter(m => m.status === 'completed').length} / {milestones.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {milestones.map((m, idx) => {
            const isCompleted = m.status === 'completed';
            const isInProgress = m.status === 'in_progress';
            const isDelayed = m.status === 'delayed';

            return (
              <div
                key={m.id || idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isCompleted ? 'bg-emerald-50/50 border-emerald-200' :
                  isInProgress ? 'bg-purple-50/50 border-purple-300' :
                  isDelayed ? 'bg-rose-50/50 border-rose-300' :
                  'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-600">
                      Step {idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded capitalize ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isInProgress ? 'bg-purple-100 text-purple-800' :
                      isDelayed ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {m.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-1">
                    {m.milestone_name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {m.statutory_section || 'RFCTLARR 2013'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Target:</span>
                  <span className="font-mono font-medium text-slate-700">
                    {m.target_date ? new Date(m.target_date).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compensation & R&R Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Assessed Compensation</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            ₹{(comp.total_assessed_cr || 0).toFixed(2)} Cr
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Statutory Section 26 valuation</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">DBT Disbursed Amount</span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
            ₹{(comp.total_paid_cr || 0).toFixed(2)} Cr
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {comp.disbursed_pct || 0}% Cleared directly to bank accounts
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">R&amp;R Families Resettled</span>
          <span className="text-2xl font-extrabold text-indigo-900 font-mono mt-1 block">
            {comp.rnr_completed_count || 0} / {comp.total_claims || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Project affected families (PAFs)</span>
        </div>
      </div>

      {/* Land Parcels Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Land Parcels Under Acquisition ({parcels.length})</h3>
            <p className="text-xs text-slate-500">Cadastral survey numbers, ownership, and acquisition status</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Survey / Khasra No</th>
                <th className="py-2.5 px-3">Village / Taluka</th>
                <th className="py-2.5 px-3">Area (Ha)</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Owner Details</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Assessed Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parcels.map((p) => {
                let statusBadge = 'bg-slate-100 text-slate-700';
                if (p.status === 'possession_taken') statusBadge = 'bg-emerald-100 text-emerald-800';
                else if (p.status === 'acquired') statusBadge = 'bg-blue-100 text-blue-800';
                else if (p.status === 'disputed') statusBadge = 'bg-red-100 text-red-800 font-bold';
                else if (p.status === 'notified') statusBadge = 'bg-amber-100 text-amber-800';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.survey_number}</td>
                    <td className="py-3 px-3 text-slate-700">{p.village_name || 'N/A'}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{Number(p.area_hectares).toFixed(2)}</td>
                    <td className="py-3 px-3 capitalize text-slate-600">{p.land_type || 'Agricultural'}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{p.owner_name || 'Unknown'}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] capitalize font-medium ${statusBadge}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                      ₹{Number(p.assessed_amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Execution Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-2xl ${
                  actionModal === 'approve' ? 'text-emerald-600' :
                  actionModal === 'return_for_correction' ? 'text-amber-600' :
                  actionModal === 'clarification' ? 'text-sky-600' : 'text-rose-600'
                }`}>
                  {actionModal === 'approve' ? 'verified' :
                   actionModal === 'return_for_correction' ? 'replay' :
                   actionModal === 'clarification' ? 'help' : 'cancel'}
                </span>
                <h3 className="font-bold text-slate-900 text-base capitalize">
                  {actionModal.replace('_', ' ')}: {project.project_code}
                </h3>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {actionModal === 'approve' && 'This action grants State Government Cabinet clearance and publishes statutory award declaration in the State Gazette.'}
              {actionModal === 'return_for_correction' && 'This returns the project dossier to the District Collector for defect rectification and re-scrutiny.'}
              {actionModal === 'clarification' && 'Direct statutory inquiry issued to the District Collector. Project remains in State Approval queue.'}
              {actionModal === 'reject' && 'Statutory refusal of the land acquisition proposal under RFCTLARR 2013.'}
            </p>

            {actionModal === 'approve' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State Gazette Notification Reference
                </label>
                <input
                  type="text"
                  value={gazetteRef}
                  onChange={(e) => setGazetteRef(e.target.value)}
                  placeholder="e.g. MH-GOV-GZ-2026-4401"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Remarks / Directives {actionModal !== 'approve' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                placeholder="Enter official executive comments..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting}
                onClick={handleExecuteAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${
                  actionModal === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionModal === 'return_for_correction' ? 'bg-amber-600 hover:bg-amber-700' :
                  actionModal === 'clarification' ? 'bg-sky-600 hover:bg-sky-700' :
                  'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionSubmitting ? 'Recording...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
