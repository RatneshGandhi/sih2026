import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useUIStore } from '../../store/uiStore';

export default function FieldPossessionPage() {
  const [records, setRecords] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({
    parcel_id: '',
    possession_date: new Date().toISOString().split('T')[0],
    gps_lat: '',
    gps_lng: '',
    site_photo_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop',
    supporting_doc_url: '',
    remarks: ''
  });

  const navigate = useNavigate();
  const { showToast } = useUIStore();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [posRes, parcelsRes] = await Promise.all([
          api.get('/field/possession'),
          api.get('/field/parcels')
        ]);
        setRecords(posRes.data.possession_records || []);
        const pList = parcelsRes.data.parcels || [];
        setParcels(pList);
        if (pList.length > 0) {
          setForm((prev) => ({ ...prev, parcel_id: pList[0].id }));
        }
      } catch (err) {
        console.error('Failed to load possession data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCaptureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            gps_lat: pos.coords.latitude.toFixed(6),
            gps_lng: pos.coords.longitude.toFixed(6)
          }));
          showToast('GPS coordinates locked from device sensor.', 'success');
        },
        (err) => {
          showToast('GPS capture failed: ' + err.message, 'error');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.remarks || form.remarks.trim().length < 10) {
      showToast('Mandatory: Detailed field handover remarks (minimum 10 characters) are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/field/possession', form);
      setRecords((prev) => [res.data.possession, ...prev]);
      setForm({
        parcel_id: parcels[0]?.id || '',
        possession_date: new Date().toISOString().split('T')[0],
        gps_lat: '',
        gps_lng: '',
        site_photo_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop',
        supporting_doc_url: '',
        remarks: ''
      });
      showToast('Possession evidence submitted for statutory scrutiny.', 'success');
    } catch (err) {
      showToast('Submission failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Top Banner */}
      <div className="w-full bg-white rounded-xl p-space-md border border-govSlate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-govEmerald flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[28px]">real_estate_agent</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-primary tracking-tight font-sans">
              Possession Evidence Handover Suite
            </h1>
            <p className="text-xs text-on-surface-variant font-sans mt-0.5">
              Submit on-ground possession panchnama, vacant site photographs &amp; boundary handover records for District Scrutiny
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-[11px] text-amber-900 max-w-sm">
          <strong>Statutory Governance:</strong> Field submission records factual possession evidence. Final possession decree is executed exclusively by the District Magistrate / Collector.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Left 5 Cols: Submit Possession Evidence Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-govSlate-200 shadow-xs p-5 flex flex-col gap-4">
          <div className="border-b border-govSlate-100 pb-3">
            <h3 className="font-bold text-sm text-primary font-sans">
              Submit On-Site Possession Evidence
            </h3>
            <p className="text-xs text-govSlate-500 mt-0.5">
              Execute physical panchnama and upload photographic verification
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
            {/* Parcel Selector */}
            <div>
              <label className="font-bold text-govSlate-700 block mb-1">Target Land Parcel *</label>
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

            {/* Possession Date */}
            <div>
              <label className="font-bold text-govSlate-700 block mb-1">Possession Execution Date *</label>
              <input
                type="date"
                required
                value={form.possession_date}
                onChange={(e) => setForm({ ...form, possession_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-govSlate-200 font-mono font-bold text-primary"
              />
            </div>

            {/* GPS Coordinates */}
            <div className="bg-slate-50 p-3 rounded-lg border border-govSlate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-govSlate-500 uppercase block">Ground GPS Lock</span>
                <span className="font-mono text-xs text-primary font-bold">
                  {form.gps_lat ? `${form.gps_lat}, ${form.gps_lng}` : 'Coordinates pending'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCaptureGPS}
                className="px-3 py-1.5 bg-white border border-govSlate-300 rounded text-xs font-bold text-primary hover:bg-slate-100 flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] text-govEmerald">my_location</span>
                <span>Lock GPS</span>
              </button>
            </div>

            {/* Site Photo URL */}
            <div>
              <label className="font-bold text-govSlate-700 block mb-1">Site Handover Photo URL *</label>
              <input
                type="text"
                required
                value={form.site_photo_url}
                onChange={(e) => setForm({ ...form, site_photo_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-govSlate-200 font-mono text-[11px]"
              />
            </div>

            {/* Supporting Document URL */}
            <div>
              <label className="font-bold text-govSlate-700 block mb-1">Executed Panchnama / Handover Doc URL (Optional)</label>
              <input
                type="text"
                value={form.supporting_doc_url}
                onChange={(e) => setForm({ ...form, supporting_doc_url: e.target.value })}
                placeholder="URL to signed panchnama scan..."
                className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-govSlate-200 font-mono text-[11px]"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="font-bold text-govSlate-700 block mb-1">Field Panchnama Remarks *</label>
              <textarea
                rows={3}
                required
                placeholder="Record witness names (Panchas), peaceful takeover declaration, vacant status, and handover to acquiring department..."
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                className="w-full p-2.5 bg-slate-50 rounded-lg border border-govSlate-200"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-secondary hover:bg-govEmeraldDark text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{submitting ? 'Submitting...' : 'SUBMIT POSSESSION EVIDENCE'}</span>
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Submitted Possession Evidence Register */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-govSlate-200 shadow-xs p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between border-b border-govSlate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                <h3 className="font-bold text-sm text-primary font-sans">
                  Possession Evidence Submissions
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-govSlate-500">
                {records.length} Submissions Logged
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center text-xs text-govSlate-400">
                No possession evidence records filed yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {records.map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-slate-50 rounded-xl border border-govSlate-200 flex flex-col sm:flex-row gap-3 text-xs">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-28 h-24 bg-slate-200 rounded-lg overflow-hidden shrink-0 border border-govSlate-200">
                      <img
                        src={rec.site_photo_url}
                        alt="Possession handover"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between gap-1">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-primary">
                            Survey No: {rec.survey_number}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            POSSESSION EVIDENCE SUBMITTED
                          </span>
                        </div>
                        <p className="text-govSlate-700 mt-1 line-clamp-2">{rec.remarks}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-govSlate-500 pt-1 border-t border-govSlate-200">
                        <span>Execution Date: <strong>{new Date(rec.possession_date).toLocaleDateString()}</strong></span>
                        {rec.gps_lat && (
                          <span className="font-mono">GPS: {rec.gps_lat}, {rec.gps_lng}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">verified_user</span>
            <span>
              All submitted evidence is archived with tamper-evident digital hashes in the Sovereign Cadastre Vault.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
