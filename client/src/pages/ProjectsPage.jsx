import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const STAGES = [
  { id: 'proposal_submitted', label: '1. Submitted' },
  { id: 'document_verification', label: '2. Doc Verify' },
  { id: 'district_scrutiny', label: '3. District Scrutiny' },
  { id: 'state_approval', label: '4. State Approval' },
  { id: 'award_declared', label: '5. Award Declared' },
  { id: 'compensation_disbursed', label: '6. DBT Disbursed' },
  { id: 'possession_taken', label: '7. Possession Taken' }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Create Project Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project_type: 'highway',
    requesting_body: 'National Highways Authority of India (NHAI)',
    state: 'Maharashtra',
    district: '',
    estimated_budget_cr: '',
    target_completion_date: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  const isOfficial = ['district_official', 'state_official', 'ministry_official'].includes(user?.role);

  useEffect(() => {
    loadProjects();
  }, [stateFilter, statusFilter, typeFilter, searchTerm]);

  async function loadProjects() {
    try {
      setLoading(true);
      const params = {};
      if (stateFilter) params.state = stateFilter;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/projects', { params });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      showToast('Failed to retrieve projects list.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/projects', formData);
      showToast('New statutory land acquisition proposal registered!', 'success');
      setModalOpen(false);
      setFormData({
        name: '',
        project_type: 'highway',
        requesting_body: 'National Highways Authority of India (NHAI)',
        state: 'Maharashtra',
        district: '',
        estimated_budget_cr: '',
        target_completion_date: '',
        description: ''
      });
      loadProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
      showToast(err.response?.data?.error || 'Failed to create project.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'possession_taken':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'compensation_disbursed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'award_declared':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'state_approval':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'district_scrutiny':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'document_verification':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div>
          <h1 className="text-xl font-extrabold text-primary tracking-tight font-sans">
            Statutory Project Dossiers &amp; Proposals
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            End-to-end lifecycle tracking from Section 4 Preliminary Notification to Section 38 Vesting Orders.
          </p>
        </div>

        {isOfficial && (
          <button
            onClick={() => setModalOpen(true)}
            className="h-9 px-space-md bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Register New Proposal</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-space-md shadow-xs flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Corridor name, code, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface outline-none cursor-pointer"
          >
            <option value="">All Lifecycle Stages (7 Stages)</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface outline-none cursor-pointer"
          >
            <option value="">All Project Types</option>
            <option value="highway">Highways &amp; Expressways</option>
            <option value="railway">Dedicated Railways &amp; HSR</option>
            <option value="industrial_corridor">Industrial Corridors (DMIC)</option>
            <option value="irrigation">Lift Irrigation Canals</option>
            <option value="urban_development">Urban Development (PRR)</option>
            <option value="renewable_energy">Renewable Energy Parks</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface outline-none cursor-pointer"
          >
            <option value="">All States &amp; UTs</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-mono text-[10px] uppercase border-b border-govSlate-200">
              <tr>
                <th className="py-3 px-4">Dossier ID</th>
                <th className="py-3 px-4">Infrastructure Asset / Alignment</th>
                <th className="py-3 px-4">Agency / Dept</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Statutory Stage</th>
                <th className="py-3 px-4">Parcels Mapped</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="font-mono text-xs">Retrieving statutory dossiers...</span>
                    </div>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-1">folder_off</span>
                    <p className="text-xs">No projects match the selected filters.</p>
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-surface-container-low/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-primary whitespace-nowrap">
                      {p.project_code || `#PROP-00${p.id}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-govSlate-900 max-w-sm truncate">{p.name}</div>
                      <div className="text-[10px] text-govSlate-500 capitalize">{p.project_type?.replace('_', ' ')}</div>
                    </td>
                    <td className="py-3 px-4 text-govSlate-600 max-w-xs truncate">
                      {p.requesting_body}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-govSlate-800">{p.district}</div>
                      <div className="text-[10px] text-outline">{p.state}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(p.status)}`}>
                        {p.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      <span className="font-bold text-primary">{p.parcels_count || 0} Plots</span>
                      <span className="text-outline text-[10px] block">({parseFloat(p.total_area_ha || 0).toFixed(2)} Ha)</span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${p.id}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-primary font-semibold text-xs transition-all shadow-2xs"
                      >
                        Inspect Stepper &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Register New Proposal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-govSlate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">add_road</span>
                </div>
                <h3 className="font-bold text-sm text-primary">Register Land Acquisition Proposal</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Corridor / Project Alignment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Pune Outer Ring Road Package 3"
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                    Typology *
                  </label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                    className="w-full px-2.5 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="highway">Highways &amp; Expressways</option>
                    <option value="railway">Dedicated Railways</option>
                    <option value="industrial_corridor">Industrial Corridors</option>
                    <option value="irrigation">Irrigation Network</option>
                    <option value="urban_development">Urban Development</option>
                    <option value="renewable_energy">Renewable Energy</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                    Estimated Budget (₹ Cr)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimated_budget_cr}
                    onChange={(e) => setFormData({ ...formData, estimated_budget_cr: e.target.value })}
                    placeholder="e.g. 640.50"
                    className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Requesting Body / Proponent Agency *
                </label>
                <input
                  type="text"
                  required
                  value={formData.requesting_body}
                  onChange={(e) => setFormData({ ...formData, requesting_body: e.target.value })}
                  placeholder="e.g. NHAI / MSRDC / NHSRCL"
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Target Statutory Gazette Date
                </label>
                <input
                  type="date"
                  value={formData.target_completion_date}
                  onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Statutory Description &amp; Scope
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief note on land parcels, villages encompassed, and statutory objective..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs resize-none"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-govSlate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {submitting ? 'Registering...' : 'Register Dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
