import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const DRONE_PHOTO_PRESET = 'https://lh3.googleusercontent.com/aida/AEtjO1W7c_omDQip6jjOEjp03XX25bF0cT4lbA2Hb-shoa9pKbCExQznYDCrL6horL9ir2gTE1cZkUZRLONIClWhokynR6ipoc6E7HUlXlkMv0Wwmyzl_OnjM7QGu578CMGeZ7H-gjRiu2SmVHXzmGGiBLRbUk_UMANyMzp9oLTYa0Re8i_7NQYa8cG-0m5do_uEEf3JUvkuJpMJRkdVewxOclha3CenxSTAcK2uGdhn6dk87X6IxPcmKTp6Od0';

export default function FieldCapturePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    project_id: '',
    survey_number: '',
    owner_name: '',
    area_hectares: '',
    land_type: 'agricultural',
    village: '',
    latitude: '19.8824',
    longitude: '72.7482',
    photo_url: DRONE_PHOTO_PRESET
  });

  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.projects || []);
        if (res.data.projects?.length > 0) {
          setFormData((prev) => ({ ...prev, project_id: res.data.projects[0].id }));
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const handleGetCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          }));
          showToast('GPS coordinates locked successfully from device sensors!', 'success');
        },
        (err) => {
          showToast('Could not fetch GPS. Using calibrated survey benchmark.', 'info');
        }
      );
    } else {
      showToast('Geolocation not supported on this browser.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      // Generate a small representative bounding polygon around the point
      const offset = 0.0035; // ~350m bounding box
      const polygonCoords = [
        [lng - offset, lat - offset],
        [lng + offset, lat - offset],
        [lng + offset, lat + offset],
        [lng - offset, lat + offset],
        [lng - offset, lat - offset]
      ];

      const payload = {
        project_id: parseInt(formData.project_id, 10),
        survey_number: formData.survey_number,
        owner_name: formData.owner_name,
        area_hectares: parseFloat(formData.area_hectares),
        geom: {
          type: 'Polygon',
          coordinates: [polygonCoords]
        },
        status: 'notified',
        land_type: formData.land_type,
        village: formData.village || 'Field Inspection Sector',
        photo_url: formData.photo_url
      };

      const res = await api.post('/parcels', payload);
      showToast(`Field parcel ${formData.survey_number} synced to central cadastre!`, 'success');
      navigate('/map');
    } catch (err) {
      console.error('Submit error:', err);
      showToast(err.response?.data?.error || 'Failed to submit field data.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-space-md lg:p-space-lg max-w-4xl mx-auto w-full">
      {/* Title & Context */}
      <div className="mb-space-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-govEmerald text-2xl">satellite_alt</span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary">
            Field Inspection Mobile Workstation
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight font-sans">
          Field Cadastral Data Capture &amp; DGPS Demarcation
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Authorized for Cadastral Surveyors &amp; Amin Officers to record ground verification markers and GPS boundaries directly into the central cadastre.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-govSlate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Sovereign Hairline */}
        <div className="tricolor-strip h-[3px] absolute top-0 left-0 right-0"></div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Project Alignment */}
          <div>
            <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
              Associated Infrastructure Corridor *
            </label>
            <select
              required
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-3 py-2.5 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs cursor-pointer font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.district}, {p.state})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Survey Number */}
            <div>
              <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                Survey / Khasra / Gat Number *
              </label>
              <input
                type="text"
                required
                value={formData.survey_number}
                onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                placeholder="e.g. SY-219/1A"
                className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono font-semibold"
              />
            </div>

            {/* Khatedar Name */}
            <div>
              <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                Registered Landowner (Khatedar) *
              </label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                placeholder="e.g. Tukaram Sadashiv Patil"
                className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Area */}
            <div>
              <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                Demarcated Area (Hectares) *
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.area_hectares}
                onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                placeholder="e.g. 4.2500"
                className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            {/* Land Typology */}
            <div>
              <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                Land Classification
              </label>
              <select
                value={formData.land_type}
                onChange={(e) => setFormData({ ...formData, land_type: e.target.value })}
                className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs cursor-pointer"
              >
                <option value="agricultural">Agricultural (Jirayat / Bagayat)</option>
                <option value="horticultural">Horticultural / Orchard</option>
                <option value="commercial_strip">Commercial Roadside Strip</option>
                <option value="waste_land">Gaothan / Non-Agri Land</option>
              </select>
            </div>

            {/* Village / Sector */}
            <div>
              <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                Village / Revenue Circle
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="e.g. Vangaon"
                className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* DGPS Coordinates Strip */}
          <div className="p-3.5 bg-surface-container-low rounded-xl border border-govSlate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold text-primary uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">gps_fixed</span>
                NavIC / DGPS Boundary Calibration
              </span>
              <button
                type="button"
                onClick={handleGetCurrentGPS}
                className="px-2 py-1 bg-white hover:bg-surface-container text-secondary border border-govSlate-200 rounded font-semibold text-[10px] flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                Acquire Device GPS
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                <label className="text-[10px] text-outline uppercase block mb-0.5">Latitude (DD)</label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-govSlate-300 rounded"
                />
              </div>
              <div>
                <label className="text-[10px] text-outline uppercase block mb-0.5">Longitude (DD)</label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-govSlate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Inspection Drone Photo Upload & Preview */}
          <div>
            <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
              Field Boundary Demarcation Photo / Drone Orthomosaic
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="URL or camera upload path"
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono"
                />
                <p className="text-[10px] text-outline mt-1 font-mono">
                  Peg marker survey drone capture loaded from central Stitch repository.
                </p>
              </div>
              <div className="h-20 rounded-xl overflow-hidden border border-govSlate-200 bg-surface">
                <img
                  src={formData.photo_url}
                  alt="Field Boundary Inspection Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Submission CTA */}
          <div className="pt-4 border-t border-govSlate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-secondary hover:bg-govEmeraldDark text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              <span>{submitting ? 'Submitting to Central Cadastre...' : 'Submit Field Demarcation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
