import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useUIStore } from '../../store/uiStore';

export default function FieldIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    parcel_id: '',
    issue_type: 'boundary_mismatch',
    priority: 'red',
    title: '',
    description: '',
    gps_lat: '',
    gps_lng: ''
  });

  const navigate = useNavigate();
  const { showToast } = useUIStore();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [issuesRes, parcelsRes] = await Promise.all([
          api.get('/field/issues', {
            params: {
              priority: priorityFilter !== 'all' ? priorityFilter : undefined,
              status: statusFilter !== 'all' ? statusFilter : undefined
            }
          }),
          api.get('/field/parcels')
        ]);
        setIssues(issuesRes.data.issues || []);
        setParcels(parcelsRes.data.parcels || []);
        if (parcelsRes.data.parcels?.length > 0 && !form.parcel_id) {
          setForm((prev) => ({ ...prev, parcel_id: parcelsRes.data.parcels[0].id }));
        }
      } catch (err) {
        console.error('Failed to load issues:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [priorityFilter, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/field/issues', form);
      setIssues((prev) => [res.data.issue, ...prev]);
      setShowModal(false);
      setForm({
        parcel_id: parcels[0]?.id || '',
        issue_type: 'boundary_mismatch',
        priority: 'red',
        title: '',
        description: '',
        gps_lat: '',
        gps_lng: ''
      });
      showToast('Discrepancy recorded in statutory log.', 'success');
    } catch (err) {
      showToast('Failed to record issue: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCaptureGPSForIssue = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            gps_lat: pos.coords.latitude.toFixed(6),
            gps_lng: pos.coords.longitude.toFixed(6)
          }));
          showToast('GPS coordinates locked for discrepancy.', 'success');
        },
        (err) => {
          showToast('Failed to lock GPS: ' + err.message, 'error');
        }
      );
    }
  };

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Header Banner */}
      <div className="w-full bg-white rounded-xl p-space-md border border-govSlate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">report_problem</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-primary tracking-tight font-sans">
              Statutory Issues &amp; Discrepancy Register
            </h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Ground observation flags for title mismatches, encroachments, and cadastral boundary deviations under RFCTLARR Section 15
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_alert</span>
          <span>Flag New Discrepancy</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-govSlate-600 uppercase tracking-wider">Filters:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-govSlate-200 text-govSlate-700 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="red">Red / High Priority</option>
            <option value="orange">Orange / Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-govSlate-200 text-govSlate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review (CALA)</option>
            <option value="resolved">Resolved</option>
            <option value="requires_correction">Requires Correction</option>
          </select>
        </div>

        <span className="text-xs font-mono font-bold text-govSlate-500">
          Showing {issues.length} flagged records
        </span>
      </div>

      {/* Issues Table */}
      {loading ? (
        <div className="p-12 flex justify-center items-center bg-white rounded-xl border border-govSlate-200">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : issues.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-govSlate-200 text-center flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[48px] text-govSlate-300">verified</span>
          <h3 className="font-bold text-sm text-primary font-sans">No Active Discrepancies Recorded</h3>
          <p className="text-xs text-govSlate-500">All assigned parcels currently meet preliminary cadastre specifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {issues.map((issue) => {
            const isRed = issue.priority === 'red' || issue.priority === 'high';
            return (
              <div
                key={issue.id}
                className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between gap-3 ${
                  isRed ? 'border-red-300 hover:border-red-500' : 'border-amber-300 hover:border-amber-500'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isRed ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {issue.priority} PRIORITY
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                      {issue.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-primary font-sans leading-snug">{issue.title}</h3>
                    <p className="text-xs text-govSlate-600 mt-1 line-clamp-3">{issue.description}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-govSlate-100 text-[11px] text-govSlate-500">
                  <div className="flex items-center justify-between">
                    <span>Survey: <strong>{issue.survey_number}</strong></span>
                    <span>Village: <strong>{issue.village}</strong></span>
                  </div>
                  {issue.gps_lat && (
                    <div className="font-mono text-[10px] text-govSlate-400">
                      GPS: {issue.gps_lat}, {issue.gps_lng}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-govSlate-400">
                      Logged: {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => navigate(`/field/parcels/${issue.parcel_id}`)}
                      className="text-xs font-bold text-secondary hover:underline flex items-center gap-0.5"
                    >
                      <span>Open Parcel</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Flagging New Discrepancy */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-govSlate-200 shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-govSlate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[24px]">report_problem</span>
                <h2 className="font-bold text-base text-primary font-sans">
                  Flag New Cadastral Discrepancy
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-govSlate-400 hover:text-govSlate-700 font-bold text-lg">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-govSlate-700 block mb-1">Select Assigned Parcel *</label>
                <select
                  required
                  value={form.parcel_id}
                  onChange={(e) => setForm({ ...form, parcel_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-govSlate-200 font-medium"
                >
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} — {p.survey_number} ({p.village}, {p.area_hectares} Ha)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-govSlate-700 block mb-1">Issue Category *</label>
                  <select
                    value={form.issue_type}
                    onChange={(e) => setForm({ ...form, issue_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-govSlate-200 font-medium"
                  >
                    <option value="boundary_mismatch">Boundary Mismatch</option>
                    <option value="major_area_mismatch">Major Area Deviation (&gt;10%)</option>
                    <option value="ownership_mismatch">Ownership Title Dispute</option>
                    <option value="unauthorized_occupation">Unauthorized Occupation</option>
                    <option value="missing_document">Missing Statutory Document</option>
                    <option value="other">Other Discrepancy</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-govSlate-700 block mb-1">Priority / Severity *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-govSlate-200 font-bold text-red-700"
                  >
                    <option value="red">RED / HIGH (Halts Award)</option>
                    <option value="orange">ORANGE / MEDIUM (Review)</option>
                    <option value="low">LOW (Informational)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-govSlate-700 block mb-1">Title / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Brick perimeter wall encroaching western boundary"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-govSlate-200"
                />
              </div>

              <div>
                <label className="font-bold text-govSlate-700 block mb-1">Comprehensive Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record factual observations, owner statements, and physical markers observed..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 rounded-lg border border-govSlate-200"
                ></textarea>
              </div>

              {/* Optional GPS */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-govSlate-200">
                <div>
                  <span className="text-[10px] font-bold text-govSlate-500 uppercase block">GPS Location Tag</span>
                  <span className="font-mono text-xs text-primary font-semibold">
                    {form.gps_lat ? `${form.gps_lat}, ${form.gps_lng}` : 'No GPS tag attached'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCaptureGPSForIssue}
                  className="px-2.5 py-1 bg-white border border-govSlate-300 rounded text-xs font-semibold text-primary hover:bg-slate-100 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">my_location</span>
                  <span>Capture GPS</span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-govSlate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-govSlate-200 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'File Statutory Discrepancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
