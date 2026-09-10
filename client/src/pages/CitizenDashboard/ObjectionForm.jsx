import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from './components/StatusBadge';

const REASON_CATEGORIES = [
  { value: 'boundary_discrepancy', label: 'Boundary discrepancy (Demarcation / GIS line error)' },
  { value: 'ownership_dispute', label: 'Ownership dispute (Khatedar / Title contestation)' },
  { value: 'compensation_dispute', label: 'Compensation dispute (Solatium / Market rate inadequate)' },
  { value: 'other', label: 'Other statutory claim under Section 15' }
];

export default function ObjectionForm() {
  const location = useLocation();
  const prefillParcelId = location.state?.prefillParcelId || '';

  const [parcels, setParcels] = useState([]);
  const [objections, setObjections] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(prefillParcelId);
  const [reasonCategory, setReasonCategory] = useState(REASON_CATEGORIES[0].value);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const fileInputRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [parcelsRes, objectionsRes] = await Promise.all([
        api.get('/citizen/parcels'),
        api.get('/citizen/objections')
      ]);

      const fetchedParcels = parcelsRes.data.parcels || [];
      setParcels(fetchedParcels);
      setObjections(objectionsRes.data.objections || []);

      if (!selectedParcel && fetchedParcels.length > 0) {
        setSelectedParcel(String(fetchedParcels[0].id));
      }
    } catch (err) {
      console.error('Failed to load objections data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!selectedParcel) {
      setSubmitError('Please select a land parcel.');
      return;
    }
    if (!description.trim()) {
      setSubmitError('Please provide a statutory description explaining the basis of objection.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('parcel_id', selectedParcel);
      formData.append('reason_category', reasonCategory);
      formData.append('description', description.trim());
      if (selectedFile) {
        formData.append('document', selectedFile);
      }

      const res = await api.post('/citizen/objections', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newObjection = res.data.objection;

      // Immediately prepend newly filed objection to list WITHOUT manual page refresh!
      setObjections((prev) => [newObjection, ...prev]);

      setSubmitSuccess(`Statutory objection lodged successfully! Assigned reference: #OBJ-${newObjection.id}. CALA officer notified for inquiry.`);
      setDescription('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to submit objection:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit objection. Please verify details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getReasonLabel = (category) => {
    const found = REASON_CATEGORIES.find(c => c.value === category);
    return found ? found.label.split('(')[0].trim() : category;
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-govSlate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[26px]">gavel</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-govSlate-900 font-sans tracking-tight">
                Statutory Objections &amp; Claims (Section 15)
              </h1>
            </div>
            <p className="text-xs text-govSlate-500 mt-1">
              File objections regarding boundary demarcation, title records, or solatium calculation before the Competent Authority.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px] text-govAmber">schedule</span>
            <span>60-Day Statutory Limitation Window</span>
          </div>
        </div>

        {/* 2-Column Layout: Left = Submission Form, Right = Track Existing Objections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Objection Filing Form */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-govSlate-200 shadow-xs p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-govSlate-100">
              <span className="material-symbols-outlined text-primary text-[22px]">post_add</span>
              <h2 className="text-base font-bold text-govSlate-900 font-sans">
                Lodge New Section 15 Claim
              </h2>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-govEmerald text-[18px]">check_circle</span>
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-start gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Parcel Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-govSlate-700">
                  Target Land Parcel <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedParcel}
                  onChange={(e) => setSelectedParcel(e.target.value)}
                  className="w-full text-xs bg-white border border-govSlate-300 rounded-xl px-3.5 py-2.5 text-govSlate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  required
                >
                  <option value="">-- Select Your Parcel --</option>
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      Survey No: {p.survey_number} • {p.village || 'N/A'} ({p.area_hectares} Ha)
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-govSlate-400">
                  Only parcels legally registered under your citizen ID can be selected.
                </span>
              </div>

              {/* Reason Dropdown (exactly matches prompt) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-govSlate-700">
                  Reason <span className="text-rose-600">*</span>
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full text-xs bg-white border border-govSlate-300 rounded-xl px-3.5 py-2.5 text-govSlate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  required
                >
                  {REASON_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-govSlate-700">
                  Statement &amp; Grounds of Objection <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Clearly explain the discrepancy, disputed measurement, or justification for compensation revision..."
                  className="w-full text-xs bg-white border border-govSlate-300 rounded-xl p-3 text-govSlate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-govSlate-400"
                  required
                />
              </div>

              {/* Document Upload (reuses existing multer setup) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-govSlate-700">
                  Upload Supporting Document (Optional)
                </label>
                <div className="border-2 border-dashed border-govSlate-300 hover:border-govSlate-400 rounded-xl p-4 text-center bg-surface-container-low/40 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="block w-full text-xs text-govSlate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-container cursor-pointer"
                  />
                  <span className="text-[11px] text-govSlate-400 mt-2 block">
                    Supported formats: PDF, PNG, JPG (7/12 extract, sale deed, survey map). Max 10MB.
                  </span>
                </div>
                {selectedFile && (
                  <div className="mt-1 flex items-center gap-2 text-xs font-medium text-govEmerald bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <span className="material-symbols-outlined text-[16px]">attach_file</span>
                    <span className="truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-govSlate-400 font-mono">
                      ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    Registering Claim with CALA...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    SUBMIT OBJECTION
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Real-time Objection Tracking Ledger */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-govSlate-200 p-5 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-govSlate-900 font-sans">
                  My Filed Objections &amp; Tracking Status
                </h3>
                <p className="text-[11px] text-govSlate-500 mt-0.5">
                  Track resolution progress in real time without submitting duplicate inquiries.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full">
                {objections.length} Active
              </span>
            </div>

            {loading && (
              <div className="flex flex-col gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-white rounded-2xl border border-govSlate-200 p-5 animate-pulse"></div>
                ))}
              </div>
            )}

            {!loading && objections.length === 0 && (
              <div className="bg-white rounded-2xl border border-govSlate-200 p-10 text-center text-govSlate-500 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-govSlate-400">check_circle</span>
                <h4 className="text-sm font-bold text-govSlate-800">No Objections Pending</h4>
                <p className="text-xs max-w-xs">You have not submitted any formal disputes against your land parcels.</p>
              </div>
            )}

            {!loading && objections.map((obj) => (
              <div
                key={obj.id}
                className="bg-white rounded-2xl border border-govSlate-200 shadow-xs p-5 flex flex-col gap-3 hover:border-govSlate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">#OBJ-{obj.id}</span>
                      <span className="text-xs font-bold text-govSlate-900">
                        Survey: {obj.survey_number}
                      </span>
                    </div>
                    <span className="text-[11px] text-govSlate-500 mt-0.5">
                      Filed on {new Date(obj.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <StatusBadge status={obj.status} type="objection" />
                </div>

                <div className="bg-surface-container-low/60 rounded-xl p-3 border border-govSlate-200/60 text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-govSlate-700 uppercase tracking-wide mb-1">
                    <span className="material-symbols-outlined text-[14px] text-govAmber">category</span>
                    <span>Reason: {getReasonLabel(obj.reason_category)}</span>
                  </div>
                  <p className="text-govSlate-800 leading-relaxed font-sans">
                    {obj.description}
                  </p>
                </div>

                {/* Supporting Document Link */}
                {obj.document_name && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-govSlate-100">
                    <div className="flex items-center gap-1 text-govSlate-600 truncate">
                      <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                      <span className="truncate">{obj.document_name}</span>
                    </div>
                    <a
                      href={obj.document_path || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 whitespace-nowrap ml-2"
                    >
                      <span>View File</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
