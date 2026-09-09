import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const STAGES = [
  { id: 'proposal_submitted', label: '1. Submitted', subtitle: 'Sec 4 Notice' },
  { id: 'document_verification', label: '2. Doc Verify', subtitle: 'SIA Report' },
  { id: 'district_scrutiny', label: '3. District Scrutiny', subtitle: 'Sec 15 Hearing' },
  { id: 'state_approval', label: '4. State Approval', subtitle: 'Sec 19 Gazette' },
  { id: 'award_declared', label: '5. Award Declared', subtitle: 'Sec 23/30 Award' },
  { id: 'compensation_disbursed', label: '6. DBT Disbursal', subtitle: 'PFMS Credit' },
  { id: 'possession_taken', label: '7. Possession', subtitle: 'Sec 38 Vesting' }
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'activity' | 'parcels'

  // Advance Stage Modal State
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [dscVerified, setDscVerified] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  // Document Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadVersion, setUploadVersion] = useState(1);
  const [uploading, setUploading] = useState(false);

  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  const isOfficial = ['district_official', 'state_official', 'ministry_official'].includes(user?.role);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  async function loadProjectDetails() {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load project:', err);
      showToast('Error loading project dossier.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleAdvanceStage = async (e) => {
    e.preventDefault();
    setAdvancing(true);
    try {
      const res = await api.patch(`/projects/${id}/advance-status`, {
        remarks,
        dsc_verified: dscVerified
      });
      showToast(res.data.message, 'success');
      setAdvanceModalOpen(false);
      setRemarks('');
      await loadProjectDetails();
    } catch (err) {
      console.error('Failed to advance stage:', err);
      showToast(err.response?.data?.error || 'Failed to advance stage.', 'error');
    } finally {
      setAdvancing(false);
    }
  };

  const handleToggleVerifyDoc = async (docId) => {
    if (!isOfficial) {
      showToast('Only authorized officials can digitally verify statutory filings.', 'error');
      return;
    }
    try {
      const res = await api.patch(`/documents/${docId}/verify`);
      showToast(res.data.message, 'success');
      await loadProjectDetails();
    } catch (err) {
      console.error('Failed to verify document:', err);
      showToast('Failed to toggle verification state.', 'error');
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a file to upload.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('project_id', id);
      formData.append('version', uploadVersion);
      formData.append('file', uploadFile);

      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Statutory filing uploaded and vaulted successfully!', 'success');
      setUploadModalOpen(false);
      setUploadFile(null);
      await loadProjectDetails();
    } catch (err) {
      console.error('Failed to upload document:', err);
      showToast('Failed to upload document.', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-on-surface-variant">Accessing statutory gazette ledger...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-error">Project Dossier Not Found</h2>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
        >
          &larr; Return to Proposals
        </button>
      </div>
    );
  }

  const { project, currentStageIndex, nextStage, parcels, documents, activityLog } = data;
  const progressPct = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <button onClick={() => navigate('/projects')} className="hover:text-primary transition-colors">
            Proposals
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-mono font-semibold text-primary">{project.project_code || `#PROP-00${project.id}`}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/map')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-govEmerald">map</span>
            <span>View on GIS Map</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span className="hidden sm:inline">Print Docket</span>
          </button>
        </div>
      </div>

      {/* Master Header Dossier Card */}
      <div className="bg-white rounded-2xl border border-govSlate-200/80 shadow-xs p-space-md lg:p-space-lg relative overflow-hidden">
        {/* Tri-color hairline */}
        <div className="tricolor-strip h-[3px] absolute top-0 left-0 right-0"></div>

        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-space-md mt-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-primary-container text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                {project.project_type?.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                {project.status.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span className="font-mono text-[11px] text-outline">
                {project.project_code || `#PROP-00${project.id}`}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight font-sans">
              {project.name}
            </h1>

            <div className="flex items-center gap-3 text-xs text-govSlate-600 mt-2 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-govNavy">
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                {project.requesting_body}
              </span>
              <span className="text-outline">•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">pin_drop</span>
                {project.district}, {project.state}
              </span>
              <span className="text-outline">•</span>
              <span className="font-mono text-[11px] text-outline">
                Budget: ₹ {project.estimated_budget_cr || 0} Cr
              </span>
            </div>
          </div>

          {/* SLA Windows Pill & Action Trigger */}
          <div className="flex items-center gap-space-md self-start xl:self-center shrink-0">
            <div className="p-3 bg-surface-container-low rounded-xl border border-govSlate-200 flex items-center gap-3">
              <span className="material-symbols-outlined text-govAmber text-3xl">timer</span>
              <div>
                <span className="text-[10px] font-mono uppercase text-outline font-semibold">Statutory SLA Window</span>
                <div className="text-xs font-bold text-govSlate-900">
                  Target: {project.target_completion_date ? new Date(project.target_completion_date).toLocaleDateString() : 'Active Phase'}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">In Compliance</span>
              </div>
            </div>

            {/* Advance Stage Button */}
            {isOfficial && nextStage && (
              <button
                onClick={() => setAdvanceModalOpen(true)}
                className="h-11 px-4 bg-secondary hover:bg-govEmeraldDark text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Approve &amp; Advance Stage</span>
              </button>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mt-space-md pt-space-sm border-t border-govSlate-100">
          <div>
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">Total Land Required</span>
            <p className="text-base font-extrabold text-primary font-mono mt-0.5">
              {parcels.reduce((acc, p) => acc + parseFloat(p.area_hectares || 0), 0).toFixed(2)} Ha
            </p>
            <span className="text-[11px] text-govSlate-500">Across {parcels.length} Cadastral Plots</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">Assessed Solatium</span>
            <p className="text-base font-extrabold text-primary font-mono mt-0.5">
              ₹ {(parcels.reduce((acc, p) => acc + parseFloat(p.assessed_amount || 0), 0) / 1e7).toFixed(2)} Cr
            </p>
            <span className="text-[11px] text-govSlate-500">RFCTLARR Sec 26-30 Outlay</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">Compensation Settled</span>
            <p className="text-base font-extrabold text-secondary font-mono mt-0.5">
              ₹ {(parcels.reduce((acc, p) => acc + parseFloat(p.paid_amount || 0), 0) / 1e7).toFixed(2)} Cr
            </p>
            <span className="text-[11px] text-govSlate-500">PFMS Direct Benefit Transfer</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-outline uppercase font-semibold">Physical Possession</span>
            <p className="text-base font-extrabold text-primary font-mono mt-0.5">
              {parcels.filter(p => p.status === 'possession_taken').length} / {parcels.length} Plots
            </p>
            <span className="text-[11px] text-govSlate-500">Section 38 Vesting Completed</span>
          </div>
        </div>
      </div>

      {/* 7-Stage Horizontal Statutory Stepper */}
      <div className="bg-white rounded-2xl border border-govSlate-200/80 shadow-xs p-space-md">
        <div className="flex items-center justify-between gap-space-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">linear_scale</span>
            <h2 className="font-bold text-sm text-primary">Statutory Lifecycle Progression (RFCTLARR 2013)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-govSlate-600">Lifecycle Progress:</span>
            <span className="font-mono font-bold text-xs text-secondary">{progressPct}%</span>
            <div className="w-24 h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* Stepper Nodes */}
        <div className="relative overflow-x-auto pb-2">
          <div className="min-w-[840px] flex items-center justify-between relative py-2 px-4">
            {/* Background Line */}
            <div className="absolute left-10 right-10 top-6 h-1 bg-surface-container-high -z-0"></div>
            {/* Active Filled Line */}
            <div
              className="absolute left-10 top-6 h-1 bg-secondary -z-0 transition-all duration-500"
              style={{ width: `${Math.min(100, (currentStageIndex / (STAGES.length - 1)) * 100)}%` }}
            ></div>

            {STAGES.map((s, idx) => {
              const isPassed = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={s.id} className="flex flex-col items-center text-center relative z-10 w-28">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ring-4 transition-all ${
                      isPassed
                        ? 'bg-secondary text-white ring-white'
                        : isCurrent
                        ? 'bg-govAmber text-white ring-amber-100 animate-pulse'
                        : 'bg-surface-container text-on-surface-variant ring-white'
                    }`}
                  >
                    {isPassed ? (
                      <span className="material-symbols-outlined text-[20px]">done</span>
                    ) : isCurrent ? (
                      <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
                    ) : (
                      <span className="font-mono text-[11px]">0{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold mt-2 leading-tight ${isCurrent ? 'text-primary' : 'text-govSlate-700'}`}>
                    {s.label}
                  </span>
                  <span className="text-[10px] font-mono text-outline mt-0.5">
                    {s.subtitle}
                  </span>
                  {isCurrent && (
                    <span className="mt-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Active SLA
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-2xl border border-govSlate-200 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-1 p-2 bg-surface-container-low border-b border-govSlate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap ${
              activeTab === 'documents' ? 'bg-primary text-white shadow-xs' : 'text-govSlate-600 hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">rule_folder</span>
            <span>Statutory Documents ({documents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap ${
              activeTab === 'activity' ? 'bg-primary text-white shadow-xs' : 'text-govSlate-600 hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>Audit Trail &amp; Activity Log ({activityLog.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('parcels')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap ${
              activeTab === 'parcels' ? 'bg-primary text-white shadow-xs' : 'text-govSlate-600 hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
            <span>Land Parcel Schedule ({parcels.length})</span>
          </button>
        </div>

        {/* Tab 1: Documents */}
        {activeTab === 'documents' && (
          <div className="p-space-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-xs text-primary">Vaulted Statutory Filings &amp; Gazettes</h3>
                <p className="text-[11px] text-on-surface-variant">Digitally signed public gazettes, SIA reports, and Section 38 declarations.</p>
              </div>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-3 py-1.5 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Upload Document</span>
              </button>
            </div>

            <div className="divide-y divide-govSlate-100 border border-govSlate-200 rounded-xl overflow-hidden">
              {documents.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant text-xs">
                  No documents vaulted for this project yet.
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-container-low/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {doc.file_name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-xs text-primary hover:underline truncate block"
                        >
                          {doc.file_name}
                        </a>
                        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono mt-0.5">
                          <span>Version {doc.version}</span>
                          <span>•</span>
                          <span>Uploaded by: {doc.uploader_name || 'Revenue Officer'}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          NIC Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                          Pending Scrutiny
                        </span>
                      )}

                      {isOfficial && (
                        <button
                          onClick={() => handleToggleVerifyDoc(doc.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            doc.verified
                              ? 'bg-govSlate-100 text-govSlate-700 hover:bg-govSlate-200'
                              : 'bg-secondary hover:bg-govEmeraldDark text-white'
                          }`}
                        >
                          {doc.verified ? 'Revoke Seal' : 'Verify & Seal'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Activity Audit Trail */}
        {activeTab === 'activity' && (
          <div className="p-space-md">
            <div className="mb-3">
              <h3 className="font-bold text-xs text-primary">Statutory Lifecycle Audit Ledger</h3>
              <p className="text-[11px] text-on-surface-variant">Immutable chronological event trail recording officer DSC seals and stage transitions.</p>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-govSlate-200">
              {activityLog.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-4">No activity logged yet.</p>
              ) : (
                activityLog.map((log) => (
                  <div key={log.id} className="relative flex items-start gap-3">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shadow-xs">
                      <span className="material-symbols-outlined text-[12px]">done</span>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-3.5 w-full border border-govSlate-200/70 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-primary">{log.user_name || 'Statutory Authority'}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                            {log.user_designation || log.user_role || 'Officer'}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-outline">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>

                      <p className="font-semibold text-govSlate-900 mt-1.5">
                        {log.action}
                      </p>

                      {log.remarks && (
                        <p className="text-govSlate-600 mt-1 text-[11px] bg-white p-2 rounded-lg border border-govSlate-100 leading-relaxed">
                          "{log.remarks}"
                        </p>
                      )}

                      {log.to_status && (
                        <div className="mt-2 text-[10px] font-mono text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          <span>Transitioned state to: <b>{log.to_status.replace(/_/g, ' ').toUpperCase()}</b></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Land Parcels Schedule */}
        {activeTab === 'parcels' && (
          <div className="p-space-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-xs text-primary">Cadastral Plot Inventory ({parcels.length} Parcels)</h3>
                <p className="text-[11px] text-on-surface-variant">Individual Khasra/Survey records mapped to this project boundary.</p>
              </div>
              <button
                onClick={() => navigate('/map')}
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">draw</span>
                <span>Draw New Parcel</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-govSlate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low font-mono text-[10px] uppercase text-on-surface-variant border-b border-govSlate-200">
                  <tr>
                    <th className="p-2.5">Survey No</th>
                    <th className="p-2.5">Village / Sector</th>
                    <th className="p-2.5">Area (Ha)</th>
                    <th className="p-2.5">Khatedar (Owner)</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Assessed Solatium</th>
                    <th className="p-2.5">DBT Disbursed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-govSlate-100">
                  {parcels.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-low/40">
                      <td className="p-2.5 font-mono font-bold text-primary">{p.survey_number}</td>
                      <td className="p-2.5">{p.village || 'Village Sector'}</td>
                      <td className="p-2.5 font-mono font-bold">{p.area_hectares} Ha</td>
                      <td className="p-2.5">{p.owner_name}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          p.status === 'possession_taken' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'acquired' ? 'bg-blue-100 text-blue-800' :
                          p.status === 'disputed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono">₹ {(parseFloat(p.assessed_amount || 0) / 1e5).toFixed(2)} L</td>
                      <td className="p-2.5 font-mono text-secondary font-bold">₹ {(parseFloat(p.paid_amount || 0) / 1e5).toFixed(2)} L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Advance Stage Confirmation & Official Noting */}
      {advanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-govSlate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-primary">Advance Statutory Lifecycle Stage</h3>
                  <p className="text-[11px] text-on-surface-variant font-mono">
                    Transition from <b>{project.status.replace(/_/g, ' ')}</b> &rarr; <b>{nextStage?.replace(/_/g, ' ')}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdvanceModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAdvanceStage} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Official Noting &amp; Statutory Remarks *
                </label>
                <textarea
                  required
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter statutory findings, Section 15 objection orders, or CALA endorsement details..."
                  className="w-full p-2.5 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>
                <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                  <span className="text-outline">Templates:</span>
                  <button
                    type="button"
                    onClick={() => setRemarks('Section 15 hearings concluded. Objections cleared following revised solatium schedule.')}
                    className="text-primary hover:underline font-medium"
                  >
                    + Sec 15 Cleared
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemarks('Section 19 statutory gazette declaration published in State Government Gazette.')}
                    className="text-primary hover:underline font-medium ml-2"
                  >
                    + Sec 19 Gazette
                  </button>
                </div>
              </div>

              {/* DSC Verification Checkbox */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-govSlate-200">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dscVerified}
                    onChange={(e) => setDscVerified(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded"
                  />
                  <div>
                    <span className="font-semibold text-primary block">
                      Authenticate with Digital Signature Certificate (DSC) / Aadhaar e-Sign
                    </span>
                    <span className="text-[11px] text-govSlate-600 block mt-0.5">
                      Statutory requirement: Official orders are cryptographically logged with NIC-CERT timestamping.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-govSlate-100">
                <button
                  type="button"
                  onClick={() => setAdvanceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={advancing}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-govEmeraldDark text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {advancing ? 'Processing Order...' : 'Approve & Advance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload Document */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-govSlate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                </div>
                <h3 className="font-bold text-sm text-primary">Upload Statutory Document</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Select Document File (PDF, DOCX, ZIP) *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-govSlate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-container file:text-primary hover:file:bg-surface-container-high cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Revision Version Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={uploadVersion}
                  onChange={(e) => setUploadVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-govSlate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {uploading ? 'Vaulting...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
