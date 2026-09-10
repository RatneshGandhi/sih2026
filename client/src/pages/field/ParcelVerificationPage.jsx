import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import api from '../../api/client';
import { useUIStore } from '../../store/uiStore';
import { STATUS_CONFIG, PRIORITY_CONFIG } from './FieldOfficerDashboard';

// Custom Pin Icon for GPS Location
const gpsMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function FitBoundsHelper({ geom, gpsPoint }) {
  const map = useMap();
  useEffect(() => {
    try {
      const bounds = [];
      if (geom) {
        const geoJsonLayer = L.geoJSON(geom);
        bounds.push(geoJsonLayer.getBounds());
      }
      if (gpsPoint && gpsPoint[0] && gpsPoint[1]) {
        bounds.push(L.latLngBounds([gpsPoint, gpsPoint]));
      }
      if (bounds.length > 0) {
        const combined = bounds.reduce((acc, b) => acc.extend(b), L.latLngBounds(bounds[0]));
        map.fitBounds(combined, { padding: [30, 30], maxZoom: 17 });
      }
    } catch (e) {
      console.warn('Could not fit bounds:', e);
    }
  }, [geom, gpsPoint, map]);
  return null;
}

export default function ParcelVerificationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUIStore();

  const [parcelData, setParcelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1); // 1 to 7 steps
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: GPS
    gps_lat: '',
    gps_lng: '',
    gps_accuracy: null,
    gps_captured_at: null,
    // Step 2: Boundary
    boundary_match: 'yes',
    observed_area_hectares: '',
    area_mismatch_flag: false,
    boundary_remarks: '',
    // Step 3: Observations
    land_use: 'agricultural',
    occupancy: 'owner_occupied',
    actual_condition: ['accessible'],
    observation_remarks: '',
    // Step 7: General
    general_remarks: ''
  });

  // Step 4: Families
  const [families, setFamilies] = useState([]);
  const [selectedFamilyUpdates, setSelectedFamilyUpdates] = useState({});

  // Step 5: Evidence & Docs
  const [evidenceList, setEvidenceList] = useState([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [evidenceCategory, setEvidenceCategory] = useState('site_photo');
  const [evidenceCaption, setEvidenceCaption] = useState('');
  const [selectedEvidenceFile, setSelectedEvidenceFile] = useState(null);

  // Step 6: Issues
  const [issues, setIssues] = useState([]);
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    issue_type: 'boundary_mismatch',
    priority: 'orange',
    title: '',
    description: ''
  });

  // GPS state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Fetch parcel details & existing verification
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [parcelRes, familiesRes, evidenceRes, issuesRes] = await Promise.all([
          api.get(`/field/parcels/${id}`),
          api.get(`/field/parcels/${id}/families`),
          api.get(`/field/parcels/${id}/evidence`),
          api.get('/field/issues')
        ]);

        const pData = parcelRes.data.parcel;
        const vData = parcelRes.data.verification;
        setParcelData(pData);

        if (vData) {
          setFormData({
            gps_lat: vData.gps_lat || '',
            gps_lng: vData.gps_lng || '',
            gps_accuracy: vData.gps_accuracy || null,
            gps_captured_at: vData.gps_captured_at || null,
            boundary_match: vData.boundary_match || 'yes',
            observed_area_hectares: vData.observed_area_hectares || pData.area_hectares,
            area_mismatch_flag: vData.area_mismatch_flag || false,
            boundary_remarks: vData.boundary_remarks || '',
            land_use: vData.land_use || pData.land_type || 'agricultural',
            occupancy: vData.occupancy || 'owner_occupied',
            actual_condition: vData.actual_condition || ['accessible'],
            observation_remarks: vData.observation_remarks || '',
            general_remarks: vData.general_remarks || ''
          });
          if (vData.step_progress) {
            setActiveTab(Math.min(vData.step_progress, 7));
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            observed_area_hectares: pData.area_hectares,
            land_use: pData.land_type || 'agricultural'
          }));
        }

        setFamilies(familiesRes.data.families || []);
        setEvidenceList(evidenceRes.data.evidence || []);
        setIssues((issuesRes.data.issues || []).filter((i) => i.parcel_id === parseInt(id, 10)));
      } catch (err) {
        console.error('Failed to load parcel verification details:', err);
        showToast('Error loading parcel data or unauthorized.', 'error');
        navigate('/field/parcels');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // GPS Location Trigger
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your device or browser.');
      showToast('Geolocation not supported.', 'error');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setFormData((prev) => ({
          ...prev,
          gps_lat: latitude.toFixed(6),
          gps_lng: longitude.toFixed(6),
          gps_accuracy: parseFloat(accuracy.toFixed(1)),
          gps_captured_at: new Date().toISOString()
        }));
        setGpsLoading(false);
        showToast(`GPS Coordinates locked! (Accuracy: ±${accuracy.toFixed(1)}m)`, 'success');
      },
      (error) => {
        setGpsLoading(false);
        let msg = 'Failed to acquire GPS fix.';
        if (error.code === 1) msg = 'Location access denied. Please enable GPS permissions in browser settings.';
        else if (error.code === 2) msg = 'Position unavailable. Check your device satellite/cellular connection.';
        else if (error.code === 3) msg = 'GPS request timed out. Please retry outdoors with clear sky view.';
        setGpsError(msg);
        showToast(msg, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Area mismatch computation helper
  const handleObservedAreaChange = (val) => {
    const observed = parseFloat(val);
    const official = parseFloat(parcelData?.area_hectares || 0);
    let mismatch = false;
    if (!isNaN(observed) && official > 0) {
      const diffRatio = Math.abs(observed - official) / official;
      if (diffRatio > 0.05) { // more than 5% discrepancy
        mismatch = true;
      }
    }
    setFormData((prev) => ({
      ...prev,
      observed_area_hectares: val,
      area_mismatch_flag: mismatch
    }));
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      await api.put(`/field/verifications/${id}/draft`, {
        step_progress: activeTab,
        ...formData
      });
      showToast('Verification draft saved successfully.', 'success');
    } catch (err) {
      console.error('Failed to save draft:', err);
      showToast('Failed to save draft: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  // Final Submit Handler
  const handleSubmitVerification = async () => {
    if (!formData.gps_lat || !formData.gps_lng) {
      showToast('Step 1 Incomplete: GPS location must be captured before final submission.', 'error');
      setActiveTab(1);
      return;
    }

    if (!formData.boundary_match) {
      showToast('Step 2 Incomplete: Boundary verification selection is required.', 'error');
      setActiveTab(2);
      return;
    }

    if ((formData.boundary_match !== 'yes' || formData.area_mismatch_flag) && (!formData.boundary_remarks || formData.boundary_remarks.trim().length < 5)) {
      showToast('Step 2 Incomplete: Remarks are required when boundary or area discrepancies are noted.', 'error');
      setActiveTab(2);
      return;
    }

    if (!window.confirm('Submit this Field Verification Report for District Scrutiny? Once submitted, the report will be locked for review.')) {
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/field/verifications/${id}/submit`, formData);
      showToast('Field Verification submitted successfully for statutory review!', 'success');
      navigate('/field/parcels');
    } catch (err) {
      console.error('Failed to submit verification:', err);
      showToast('Submission failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Evidence Upload Handler
  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!selectedEvidenceFile) {
      showToast('Please select a photo file to upload.', 'error');
      return;
    }

    try {
      setUploadingEvidence(true);
      const data = new FormData();
      data.append('file', selectedEvidenceFile);
      data.append('category', evidenceCategory);
      data.append('caption', evidenceCaption);
      if (formData.gps_lat) data.append('gps_lat', formData.gps_lat);
      if (formData.gps_lng) data.append('gps_lng', formData.gps_lng);

      const res = await api.post(`/field/parcels/${id}/evidence`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setEvidenceList((prev) => [res.data.evidence, ...prev]);
      setSelectedEvidenceFile(null);
      setEvidenceCaption('');
      showToast('Photo evidence cataloged and geo-tagged!', 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Failed to upload evidence.', 'error');
    } finally {
      setUploadingEvidence(false);
    }
  };

  // Delete Evidence Handler
  const handleDeleteEvidence = async (evidenceId) => {
    if (!window.confirm('Remove this draft evidence photo?')) return;
    try {
      await api.delete(`/field/evidence/${evidenceId}`);
      setEvidenceList((prev) => prev.filter((item) => item.id !== evidenceId));
      showToast('Evidence removed.', 'info');
    } catch (err) {
      showToast('Failed to delete evidence item.', 'error');
    }
  };

  // Family Verification Save Handler
  const handleSaveFamilyVerification = async (familyId) => {
    const update = selectedFamilyUpdates[familyId] || {};
    try {
      await api.post(`/field/parcels/${id}/families/${familyId}/verify`, update);
      showToast('Proposed family observation logged.', 'success');
      // Refresh family list
      const res = await api.get(`/field/parcels/${id}/families`);
      setFamilies(res.data.families || []);
    } catch (err) {
      showToast('Failed to record family verification.', 'error');
    }
  };

  // Create Issue Handler
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/field/issues', {
        parcel_id: parseInt(id, 10),
        ...issueForm,
        gps_lat: formData.gps_lat || null,
        gps_lng: formData.gps_lng || null
      });
      setIssues((prev) => [res.data.issue, ...prev]);
      setShowNewIssueModal(false);
      setIssueForm({ issue_type: 'boundary_mismatch', priority: 'orange', title: '', description: '' });
      showToast('Discrepancy flagged and recorded.', 'success');
    } catch (err) {
      showToast('Failed to flag discrepancy: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-govSlate-600 font-semibold">
            Loading Parcel Cadastral Record &amp; Geo-Layers...
          </span>
        </div>
      </div>
    );
  }

  if (!parcelData) return null;

  // Geometry parsing for Leaflet
  let parcelGeom = parcelData.geom;
  if (typeof parcelGeom === 'string') {
    try { parcelGeom = JSON.parse(parcelGeom); } catch (e) { parcelGeom = null; }
  }

  const gpsPoint = formData.gps_lat && formData.gps_lng ? [parseFloat(formData.gps_lat), parseFloat(formData.gps_lng)] : null;
  const statusConf = STATUS_CONFIG[parcelData.verification_status] || STATUS_CONFIG.pending;
  const prioConf = PRIORITY_CONFIG[parcelData.priority] || PRIORITY_CONFIG.medium;

  // Calculate distance between GPS and polygon centroid if GPS exists
  let distanceToCentroidMeters = null;
  if (gpsPoint && parcelGeom) {
    try {
      const centroid = turf.centroid(parcelGeom);
      const point = turf.point([gpsPoint[1], gpsPoint[0]]);
      const distanceKm = turf.distance(point, centroid);
      distanceToCentroidMeters = Math.round(distanceKm * 1000);
    } catch (e) {
      console.warn('Turf distance calculation error:', e);
    }
  }

  // GPS accuracy rating
  const getAccuracyBadge = (acc) => {
    if (!acc) return null;
    if (acc <= 10) return { label: 'HIGH PRECISION (±' + acc + 'm)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (acc <= 30) return { label: 'MODERATE (±' + acc + 'm)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'LOW PRECISION (±' + acc + 'm) - Warn: Retest outdoors', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const accuracyBadge = getAccuracyBadge(formData.gps_accuracy);

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Top Header & Navigation Bar */}
      <div className="w-full bg-white rounded-xl p-4 border border-govSlate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/field/parcels')}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-govSlate-700 transition-colors"
            title="Back to Assigned Parcels"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base font-black text-primary">#{parcelData.id}</span>
              <h1 className="font-bold text-base text-primary font-sans">
                Survey No: {parcelData.survey_number}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${prioConf.badge}`}>
                {prioConf.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConf.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}></span>
                <span>{statusConf.label}</span>
              </span>
            </div>
            <p className="text-[11px] text-govSlate-500 font-sans mt-0.5">
              Project: {parcelData.project_name} | {parcelData.village}, {parcelData.district}, {parcelData.state}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft || submitting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs border border-govSlate-200 transition-all shadow-xs"
          >
            <span className={`material-symbols-outlined text-[18px] ${savingDraft ? 'animate-spin' : ''}`}>
              save
            </span>
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleSubmitVerification}
            disabled={submitting || parcelData.verification_status === 'submitted_for_review'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary hover:bg-govEmeraldDark text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Submit for Review</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Side Official Cadastre Data + Interactive Mini-GIS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Left 5 Cols: Legal Cadastre Details & Map */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Official Cadastre Data (Read Only Guarded) */}
          <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-govSlate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
                <h3 className="font-bold text-xs text-primary uppercase tracking-wider font-sans">
                  Official Record Data (Read-Only)
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                CALA PROTECTED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-govSlate-100">
                <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Official Owner</span>
                <span className="font-bold text-govSlate-900 text-xs truncate block" title={parcelData.owner_name}>
                  {parcelData.owner_name}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-govSlate-100">
                <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Cadastral Area</span>
                <span className="font-mono font-black text-primary text-sm">
                  {parcelData.area_hectares} <span className="text-xs font-normal">Ha</span>
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-govSlate-100">
                <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Classification</span>
                <span className="capitalize font-semibold text-govSlate-800 text-xs">
                  {parcelData.land_type?.replace('_', ' ')}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-govSlate-100">
                <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Gazette Stage</span>
                <span className="capitalize font-semibold text-govSlate-800 text-xs">
                  {parcelData.official_parcel_status || 'Notified'}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-govSlate-400 italic">
              * Legal ownership, Gazette titles, and solatium awards can only be revised by SLAO/CALA authorities.
            </p>
          </div>

          {/* Interactive GIS Demarcation Map */}
          <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-govEmerald text-[18px]">satellite_alt</span>
                <span className="font-bold text-xs text-primary uppercase tracking-wider">
                  Parcel Cadastre Map
                </span>
              </div>
              {distanceToCentroidMeters !== null && (
                <span className="text-[10px] font-mono font-bold text-govSlate-600 bg-slate-100 px-2 py-0.5 rounded">
                  GPS Offset: {distanceToCentroidMeters}m from centroid
                </span>
              )}
            </div>

            <div className="w-full h-[320px] rounded-lg overflow-hidden border border-govSlate-200 relative">
              <MapContainer
                center={[19.8824, 72.7482]}
                zoom={15}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {parcelGeom && (
                  <GeoJSON
                    data={parcelGeom}
                    style={{
                      color: '#132A4C',
                      weight: 3,
                      fillColor: '#0E9F6E',
                      fillOpacity: 0.45
                    }}
                  />
                )}

                {gpsPoint && (
                  <Marker position={gpsPoint} icon={gpsMarkerIcon}>
                    <Popup>
                      <div className="text-xs">
                        <strong>Field Officer GPS</strong><br />
                        Lat: {formData.gps_lat}<br />
                        Lng: {formData.gps_lng}<br />
                        Acc: ±{formData.gps_accuracy}m
                      </div>
                    </Popup>
                  </Marker>
                )}

                <FitBoundsHelper geom={parcelGeom} gpsPoint={gpsPoint} />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: 7-Step Verification Workstation */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-govSlate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Step Progress Navigation Bar */}
          <div className="bg-slate-50 border-b border-govSlate-200 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary font-sans uppercase tracking-wider">
                Verification Workstation: Step {activeTab} of 7
              </span>
              <span className="text-xs font-mono font-bold text-secondary">
                {Math.round((activeTab / 7) * 100)}% Complete
              </span>
            </div>
            {/* Progress Track */}
            <div className="w-full bg-govSlate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full transition-all duration-300"
                style={{ width: `${(activeTab / 7) * 100}%` }}
              ></div>
            </div>

            {/* Step Tabs */}
            <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 text-[11px] font-semibold">
              {[
                { step: 1, label: '1. GPS', icon: 'my_location' },
                { step: 2, label: '2. Boundary', icon: 'polyline' },
                { step: 3, label: '3. Observations', icon: 'visibility' },
                { step: 4, label: '4. Families', icon: 'group' },
                { step: 5, label: '5. Evidence', icon: 'photo_camera' },
                { step: 6, label: '6. Issues', icon: 'flag' },
                { step: 7, label: '7. Review', icon: 'fact_check' }
              ].map((tab) => (
                <button
                  key={tab.step}
                  onClick={() => setActiveTab(tab.step)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.step
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'bg-white text-govSlate-600 border border-govSlate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workstation Step Content Container */}
          <div className="p-space-md flex-1 overflow-y-auto min-h-[420px]">
            {/* ========================================= */}
            {/* STEP 1: GPS CAPTURE */}
            {/* ========================================= */}
            {activeTab === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-primary font-sans">
                      Step 1: Real GPS Ground Verification
                    </h3>
                    <p className="text-xs text-govSlate-500 mt-0.5">
                      Stand inside parcel boundary and acquire satellite coordinates via mobile sensor
                    </p>
                  </div>
                  <button
                    onClick={handleCaptureGPS}
                    disabled={gpsLoading}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary hover:bg-govEmeraldDark text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${gpsLoading ? 'animate-spin' : ''}`}>
                      {gpsLoading ? 'refresh' : 'near_me'}
                    </span>
                    <span>{gpsLoading ? 'Acquiring Fix...' : 'Capture Current Location'}</span>
                  </button>
                </div>

                {gpsError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600">error</span>
                    <span>{gpsError}</span>
                  </div>
                )}

                {/* GPS Coordinates Telemetry Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-govSlate-200 flex flex-col gap-3">
                  <span className="text-xs font-bold text-govSlate-600 uppercase tracking-wider">
                    Ground Telemetry Status
                  </span>

                  {formData.gps_lat && formData.gps_lng ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-govSlate-200">
                        <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Latitude</span>
                        <span className="font-mono font-bold text-primary text-sm">{formData.gps_lat}° N</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-govSlate-200">
                        <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Longitude</span>
                        <span className="font-mono font-bold text-primary text-sm">{formData.gps_lng}° E</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-govSlate-200">
                        <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Sensor Precision</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border inline-block mt-0.5 ${accuracyBadge?.color || 'text-govSlate-700'}`}>
                          {accuracyBadge?.label || '±' + formData.gps_accuracy + 'm'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-govSlate-200">
                        <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Captured At</span>
                        <span className="font-mono text-xs text-govSlate-700 font-medium">
                          {formData.gps_captured_at ? new Date(formData.gps_captured_at).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-govSlate-400 flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[36px]">location_searching</span>
                      <p className="text-xs">No GPS coordinates locked yet. Click "Capture Current Location".</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setActiveTab(2)}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
                  >
                    <span>Next: Boundary Verification</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* STEP 2: BOUNDARY VERIFICATION */}
            {/* ========================================= */}
            {activeTab === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-sm text-primary font-sans">
                    Step 2: Boundary Delineation &amp; Area Check
                  </h3>
                  <p className="text-xs text-govSlate-500 mt-0.5">
                    Compare on-site cadastral stone markers against notified revenue map boundaries
                  </p>
                </div>

                {/* Boundary Match Radio Group */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-govSlate-700">
                    Physical Boundary Matches Official Cadastre Record? *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'yes', label: 'Yes (Exact Match)', color: 'peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-900' },
                      { val: 'partially', label: 'Partially Matches', color: 'peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-900' },
                      { val: 'no', label: 'No (Discrepancy)', color: 'peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-900' }
                    ].map((opt) => (
                      <label key={opt.val} className="cursor-pointer">
                        <input
                          type="radio"
                          name="boundary_match"
                          value={opt.val}
                          checked={formData.boundary_match === opt.val}
                          onChange={(e) => setFormData({ ...formData, boundary_match: e.target.value })}
                          className="peer sr-only"
                        />
                        <div className={`p-2.5 text-center text-xs font-bold rounded-lg border border-govSlate-200 bg-slate-50 transition-all ${opt.color}`}>
                          {opt.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Area Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="bg-slate-50 p-3 rounded-lg border border-govSlate-200">
                    <span className="text-[10px] text-govSlate-400 font-bold uppercase block">Official Area</span>
                    <span className="font-mono font-black text-primary text-base">
                      {parcelData.area_hectares} Hectares
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-govSlate-700 block mb-1">
                      Observed / Surveyed Area (Hectares) *
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.observed_area_hectares}
                      onChange={(e) => handleObservedAreaChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 rounded-lg border border-govSlate-200 font-mono font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Area Mismatch Warning Alert */}
                {formData.area_mismatch_flag && (
                  <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600">warning</span>
                      <div>
                        <strong>⚠ AREA MISMATCH DETECTED (&gt;5% deviation)</strong>
                        <p className="text-[11px] text-amber-800">
                          Official: {parcelData.area_hectares} Ha vs Observed: {formData.observed_area_hectares} Ha. Mandatory remarks required.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boundary Remarks */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-govSlate-700">
                    Boundary Verification Remarks {(formData.boundary_match !== 'yes' || formData.area_mismatch_flag) ? '*' : '(Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.boundary_remarks}
                    onChange={(e) => setFormData({ ...formData, boundary_remarks: e.target.value })}
                    placeholder="Describe stone marker positions, boundary encroachments, or reasons for area deviation..."
                    className="w-full p-2.5 text-xs bg-slate-50 rounded-lg border border-govSlate-200 focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                  ></textarea>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setActiveTab(1)}
                    className="px-3 py-1.5 border border-govSlate-200 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab(3)}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
                  >
                    <span>Next: Field Observations</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* STEP 3: FIELD OBSERVATIONS */}
            {/* ========================================= */}
            {activeTab === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-sm text-primary font-sans">
                    Step 3: Ground Asset &amp; Land Use Inspection
                  </h3>
                  <p className="text-xs text-govSlate-500 mt-0.5">
                    Catalog physical land use, occupation type, and visible asset conditions
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Land Use */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-govSlate-700">Observed Land Use *</label>
                    <select
                      value={formData.land_use}
                      onChange={(e) => setFormData({ ...formData, land_use: e.target.value })}
                      className="px-3 py-2 text-xs bg-slate-50 rounded-lg border border-govSlate-200 font-medium"
                    >
                      <option value="agricultural">Agricultural (Irrigated / Non-irrigated)</option>
                      <option value="horticultural">Horticultural / Orchard</option>
                      <option value="residential">Residential / Abadi</option>
                      <option value="commercial">Commercial / Shop Frontage</option>
                      <option value="industrial">Industrial / Warehouse</option>
                      <option value="forest">Forest / Scrub / Fallow</option>
                      <option value="vacant">Vacant Land</option>
                      <option value="mixed">Mixed Use</option>
                      <option value="other">Other Land Use</option>
                    </select>
                  </div>

                  {/* Occupancy */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-govSlate-700">Actual Occupancy *</label>
                    <select
                      value={formData.occupancy}
                      onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
                      className="px-3 py-2 text-xs bg-slate-50 rounded-lg border border-govSlate-200 font-medium"
                    >
                      <option value="owner_occupied">Owner Occupied (Self-cultivated)</option>
                      <option value="tenant_occupied">Tenant / Bataidar Occupied</option>
                      <option value="vacant">Vacant / Unoccupied</option>
                      <option value="government_occupied">Government Occupied</option>
                      <option value="unauthorized">Unauthorized Encroachment</option>
                      <option value="other">Other Occupancy</option>
                    </select>
                  </div>
                </div>

                {/* Actual Condition Multi-Checks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-govSlate-700">Visible Physical Conditions &amp; Assets</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'accessible', label: 'Directly Accessible via Road' },
                      { key: 'inaccessible', label: 'Landlocked / Inaccessible' },
                      { key: 'crop_present', label: 'Standing Crops Present' },
                      { key: 'trees_present', label: 'Fruit / Timber Trees Present' },
                      { key: 'structure_present', label: 'Pucca / Kucha Structures' },
                      { key: 'encroachment_observed', label: 'Encroachment Observed' },
                      { key: 'waterbody_present', label: 'Well / Borewell / Canal' },
                      { key: 'power_line', label: 'High Tension Power Line' }
                    ].map((item) => {
                      const checked = formData.actual_condition.includes(item.key);
                      return (
                        <label
                          key={item.key}
                          className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center gap-2 transition-all ${
                            checked
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                              : 'bg-slate-50 border-govSlate-200 text-govSlate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, actual_condition: [...formData.actual_condition, item.key] });
                              } else {
                                setFormData({
                                  ...formData,
                                  actual_condition: formData.actual_condition.filter((k) => k !== item.key)
                                });
                              }
                            }}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Observation Remarks */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-govSlate-700">Detailed Observation Notes</label>
                  <textarea
                    rows={3}
                    value={formData.observation_remarks}
                    onChange={(e) => setFormData({ ...formData, observation_remarks: e.target.value })}
                    placeholder="Specific remarks on crop stage, structure type, tree enumeration, or access barriers..."
                    className="w-full p-2.5 text-xs bg-slate-50 rounded-lg border border-govSlate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setActiveTab(2)}
                    className="px-3 py-1.5 border border-govSlate-200 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab(4)}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
                  >
                    <span>Next: Affected Families</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* STEP 4: AFFECTED FAMILIES VERIFICATION */}
            {/* ========================================= */}
            {activeTab === 4 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-sm text-primary font-sans">
                    Step 4: Affected Family Socio-Economic Verification
                  </h3>
                  <p className="text-xs text-govSlate-500 mt-0.5">
                    Field-level verification for R&amp;R eligibility. Official legal census records remain intact.
                  </p>
                </div>

                {families.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-govSlate-200 text-xs text-govSlate-500">
                    No affected family records mapped to this parcel in the preliminary notification.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {families.map((fam) => {
                      const currUpdate = selectedFamilyUpdates[fam.id] || {
                        verified_affected: fam.verified_affected || (fam.is_affected ? 'yes' : 'no'),
                        verified_displaced: fam.verified_displaced || (fam.is_displaced ? 'yes' : 'no'),
                        verified_rnr_required: fam.verified_rnr_required || (fam.rnr_required ? 'yes' : 'no'),
                        verified_member_count: fam.verified_member_count || fam.member_count,
                        remarks: fam.field_remarks || ''
                      };

                      return (
                        <div key={fam.id} className="p-3.5 bg-slate-50 rounded-xl border border-govSlate-200 flex flex-col gap-3 text-xs">
                          <div className="flex items-center justify-between border-b border-govSlate-200 pb-2">
                            <div>
                              <div className="font-bold text-primary text-sm">{fam.family_head_name}</div>
                              <span className="text-[10px] text-govSlate-500 font-mono">
                                Aadhaar: {fam.aadhaar_masked || 'Not recorded'} | Category: {fam.category}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              Official Members: {fam.member_count}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-govSlate-600 uppercase block mb-0.5">
                                Affected Status
                              </label>
                              <select
                                value={currUpdate.verified_affected}
                                onChange={(e) => setSelectedFamilyUpdates({
                                  ...selectedFamilyUpdates,
                                  [fam.id]: { ...currUpdate, verified_affected: e.target.value }
                                })}
                                className="w-full px-2 py-1.5 bg-white rounded border border-govSlate-200 text-xs"
                              >
                                <option value="yes">Yes (Affected)</option>
                                <option value="no">No</option>
                                <option value="needs_review">Needs Review</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-govSlate-600 uppercase block mb-0.5">
                                Displaced Status
                              </label>
                              <select
                                value={currUpdate.verified_displaced}
                                onChange={(e) => setSelectedFamilyUpdates({
                                  ...selectedFamilyUpdates,
                                  [fam.id]: { ...currUpdate, verified_displaced: e.target.value }
                                })}
                                className="w-full px-2 py-1.5 bg-white rounded border border-govSlate-200 text-xs"
                              >
                                <option value="yes">Yes (Physical House Loss)</option>
                                <option value="no">No</option>
                                <option value="needs_review">Needs Review</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-govSlate-600 uppercase block mb-0.5">
                                R&amp;R Grant Entitlement
                              </label>
                              <select
                                value={currUpdate.verified_rnr_required}
                                onChange={(e) => setSelectedFamilyUpdates({
                                  ...selectedFamilyUpdates,
                                  [fam.id]: { ...currUpdate, verified_rnr_required: e.target.value }
                                })}
                                className="w-full px-2 py-1.5 bg-white rounded border border-govSlate-200 text-xs"
                              >
                                <option value="yes">Yes (Eligible)</option>
                                <option value="no">No</option>
                                <option value="needs_review">Needs Scrutiny</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-govSlate-600 uppercase block mb-0.5">
                                Observed Members
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={currUpdate.verified_member_count}
                                onChange={(e) => setSelectedFamilyUpdates({
                                  ...selectedFamilyUpdates,
                                  [fam.id]: { ...currUpdate, verified_member_count: parseInt(e.target.value, 10) || 1 }
                                })}
                                className="w-full px-2 py-1.5 bg-white rounded border border-govSlate-200 text-xs font-mono font-bold"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Field remarks for this family (e.g. resident structure location)..."
                              value={currUpdate.remarks}
                              onChange={(e) => setSelectedFamilyUpdates({
                                ...selectedFamilyUpdates,
                                [fam.id]: { ...currUpdate, remarks: e.target.value }
                              })}
                              className="flex-1 px-2.5 py-1.5 bg-white rounded border border-govSlate-200 text-xs"
                            />
                            <button
                              onClick={() => handleSaveFamilyVerification(fam.id)}
                              className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/90 shrink-0"
                            >
                              Log Proposed Update
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setActiveTab(3)}
                    className="px-3 py-1.5 border border-govSlate-200 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab(5)}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
                  >
                    <span>Next: Photo Evidence &amp; Documents</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* STEP 5: PHOTO EVIDENCE & DOCUMENTS */}
            {/* ========================================= */}
            {activeTab === 5 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-sm text-primary font-sans">
                    Step 5: Geo-Tagged Evidence &amp; Field Photographs
                  </h3>
                  <p className="text-xs text-govSlate-500 mt-0.5">
                    Capture ground evidence with automatic GPS coordinate stamping
                  </p>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleUploadEvidence} className="p-3.5 bg-slate-50 rounded-xl border border-govSlate-200 flex flex-col gap-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Upload Field Photograph / Evidence Item
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-govSlate-700 block mb-1">Evidence Category *</label>
                      <select
                        value={evidenceCategory}
                        onChange={(e) => setEvidenceCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-govSlate-200 font-medium"
                      >
                        <option value="site_photo">Site Photograph (General Panorama)</option>
                        <option value="boundary_photo">Boundary Marker / Cadastral Stone</option>
                        <option value="land_use_photo">Land Use / Crops / Assets</option>
                        <option value="structure_photo">Structure / Built Asset</option>
                        <option value="occupancy_evidence">Occupancy / Field Panchanama</option>
                        <option value="other_evidence">Other Field Evidence</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-govSlate-700 block mb-1">Select File (Image / PDF) *</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setSelectedEvidenceFile(e.target.files[0])}
                        className="w-full text-xs text-govSlate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-govSlate-700 block mb-1">Caption / Description</label>
                    <input
                      type="text"
                      value={evidenceCaption}
                      onChange={(e) => setEvidenceCaption(e.target.value)}
                      placeholder="e.g., North-West boundary marker with Sarpanch present..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-govSlate-200"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-govSlate-500 font-mono">
                      {formData.gps_lat ? `Geo-tag: ${formData.gps_lat}, ${formData.gps_lng}` : 'Warning: GPS not locked. Photo will lack geo-tags.'}
                    </span>
                    <button
                      type="submit"
                      disabled={uploadingEvidence || !selectedEvidenceFile}
                      className="px-4 py-2 bg-secondary text-white font-bold text-xs rounded-lg hover:bg-govEmeraldDark transition-all disabled:opacity-50"
                    >
                      {uploadingEvidence ? 'Uploading...' : 'Upload & Catalog'}
                    </button>
                  </div>
                </form>

                {/* Uploaded Evidence Grid */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Uploaded Evidence Items ({evidenceList.length})
                  </span>

                  {evidenceList.length === 0 ? (
                    <div className="text-center py-6 text-xs text-govSlate-400 bg-slate-50 rounded-xl border border-govSlate-200">
                      No photo evidence uploaded yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {evidenceList.map((item) => (
                        <div key={item.id} className="bg-slate-50 rounded-xl border border-govSlate-200 overflow-hidden flex flex-col justify-between">
                          <div className="h-32 bg-slate-200 relative overflow-hidden">
                            {item.file_type?.startsWith('image/') || item.file_path?.includes('http') || item.file_path?.endsWith('.jpg') || item.file_path?.endsWith('.png') ? (
                              <img
                                src={item.file_path}
                                alt={item.caption || item.file_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-govSlate-400">
                                <span className="material-symbols-outlined text-[36px]">description</span>
                              </div>
                            )}
                            <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded bg-black/60 text-white uppercase backdrop-blur-xs">
                              {item.category?.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="p-3 text-xs flex flex-col gap-1">
                            <span className="font-bold text-govSlate-800 line-clamp-1">{item.caption || item.file_name}</span>
                            {item.gps_lat && (
                              <span className="text-[10px] font-mono text-govSlate-500">
                                {item.gps_lat}, {item.gps_lng}
                              </span>
                            )}
                            <div className="flex items-center justify-between border-t border-govSlate-200 pt-2 mt-1">
                              <span className="text-[9px] text-govSlate-400">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => handleDeleteEvidence(item.id)}
                                className="text-[11px] text-red-600 hover:underline font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setActiveTab(4)}
                    className="px-3 py-1.5 border border-govSlate-200 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab(6)}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
                  >
                    <span>Next: Flag Issues &amp; Discrepancies</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* STEP 6: ISSUES & DISCREPANCIES */}
            {/* ========================================= */}
            {activeTab === 6 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-primary font-sans">
                      Step 6: Discrepancy &amp; Dispute Flagging
                    </h3>
                    <p className="text-xs text-govSlate-500 mt-0.5">
                      Highlight ownership title mismatches, unauthorized occupation, or boundary deviations
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewIssueModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_alert</span>
                    <span>Flag New Discrepancy</span>
                  </button>
                </div>

                {/* Modal for New Issue */}
                {showNewIssueModal && (
                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-900 uppercase tracking-wider">
                        Log Statutory Discrepancy / Alert
                      </span>
                      <button onClick={() => setShowNewIssueModal(false)} className="text-red-700 hover:text-red-900 font-bold">
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleCreateIssue} className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-red-900 uppercase block">Issue Type *</label>
                          <select
                            value={issueForm.issue_type}
                            onChange={(e) => setIssueForm({ ...issueForm, issue_type: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white rounded border border-red-300 text-xs"
                          >
                            <option value="boundary_mismatch">Boundary Mismatch / Encroachment</option>
                            <option value="major_area_mismatch">Major Cadastral Area Discrepancy</option>
                            <option value="ownership_mismatch">Legal Title / Ownership Dispute</option>
                            <option value="unauthorized_occupation">Unauthorized Occupation / Squatters</option>
                            <option value="missing_document">Missing Statutory 7/12 Extract</option>
                            <option value="other">Other Field Discrepancy</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-red-900 uppercase block">Severity / Priority *</label>
                          <select
                            value={issueForm.priority}
                            onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white rounded border border-red-300 text-xs font-bold"
                          >
                            <option value="red">RED / HIGH (Halts Award Declaration)</option>
                            <option value="orange">ORANGE / MEDIUM (Scrutiny Recommended)</option>
                            <option value="low">LOW (Informational Note)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-red-900 uppercase block">Title *</label>
                        <input
                          type="text"
                          required
                          value={issueForm.title}
                          onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                          placeholder="Short summary of discrepancy..."
                          className="w-full px-2.5 py-1.5 bg-white rounded border border-red-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-red-900 uppercase block">Detailed Description *</label>
                        <textarea
                          rows={2}
                          required
                          value={issueForm.description}
                          onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                          placeholder="Provide specific details, affected coordinates, and witness statements..."
                          className="w-full px-2.5 py-1.5 bg-white rounded border border-red-300 text-xs"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowNewIssueModal(false)}
                          className="px-3 py-1 bg-white border border-red-200 text-xs rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-red-700 text-white font-bold text-xs rounded hover:bg-red-800"
                        >
                          Submit Discrepancy
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* List of Issues */}
                <div className="flex flex-col gap-2">
                  {issues.length === 0 ? (
                    <div className="text-center py-6 text-xs text-govSlate-400 bg-slate-50 rounded-xl border border-govSlate-200">
                      No issues or discrepancies flagged on this parcel.
                    </div>
                  ) : (
                    issues.map((issue) => (
                      <div
                        key={issue.id}
                        className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                          issue.priority === 'red' || issue.priority === 'high'
                            ? 'bg-red-50/70 border-red-300'
                            : 'bg-amber-50/70 border-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-govSlate-900">{issue.title}</span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded uppercase ${
                            issue.priority === 'red' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                          }`}>
                            {issue.priority} PRIORITY
                          </span>
                        </div>
                        <p className="text-xs text-govSlate-700">{issue.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-govSlate-500 pt-1 border-t border-govSlate-200">
                          <span>Status: <strong>{issue.status}</strong></span>
                          <span>Logged: {new Date(issue.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setActiveTab(5)}
                    className="px-3 py-1.5 border border-govSlate-200 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab(7)}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
                  >
                    <span>Next: Final Review &amp; Submit</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* STEP 7: REVIEW & FINAL SUBMISSION */}
            {/* ========================================= */}
            {activeTab === 7 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-sm text-primary font-sans">
                    Step 7: Verification Summary &amp; Statutory Submission
                  </h3>
                  <p className="text-xs text-govSlate-500 mt-0.5">
                    Review completed field entries. Upon submission, status transitions to "Submitted for Review" for District Scrutiny.
                  </p>
                </div>

                {/* Checklist Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-govSlate-200 flex items-start gap-2">
                    <span className={`material-symbols-outlined text-[20px] ${formData.gps_lat ? 'text-govEmerald' : 'text-rose-500'}`}>
                      {formData.gps_lat ? 'check_circle' : 'cancel'}
                    </span>
                    <div>
                      <strong className="block">1. GPS Location</strong>
                      <span className="text-govSlate-500">
                        {formData.gps_lat ? `${formData.gps_lat}, ${formData.gps_lng} (±${formData.gps_accuracy}m)` : 'Missing GPS fix'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-govSlate-200 flex items-start gap-2">
                    <span className="material-symbols-outlined text-govEmerald text-[20px]">check_circle</span>
                    <div>
                      <strong className="block">2. Boundary &amp; Area Check</strong>
                      <span className="text-govSlate-500">
                        Match: {formData.boundary_match.toUpperCase()} | Observed: {formData.observed_area_hectares} Ha
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-govSlate-200 flex items-start gap-2">
                    <span className="material-symbols-outlined text-govEmerald text-[20px]">check_circle</span>
                    <div>
                      <strong className="block">3. Observations &amp; Use</strong>
                      <span className="text-govSlate-500 capitalize">
                        {formData.land_use} / {formData.occupancy?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-govSlate-200 flex items-start gap-2">
                    <span className={`material-symbols-outlined text-[20px] ${evidenceList.length > 0 ? 'text-govEmerald' : 'text-amber-500'}`}>
                      {evidenceList.length > 0 ? 'check_circle' : 'info'}
                    </span>
                    <div>
                      <strong className="block">4. Evidence &amp; Photos</strong>
                      <span className="text-govSlate-500">
                        {evidenceList.length} photo evidence item(s) cataloged
                      </span>
                    </div>
                  </div>
                </div>

                {/* General Officer Remarks */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-govSlate-700">
                    Final Field Officer Certification &amp; Statutory Noting
                  </label>
                  <textarea
                    rows={3}
                    value={formData.general_remarks}
                    onChange={(e) => setFormData({ ...formData, general_remarks: e.target.value })}
                    placeholder="Certify on-site ground inspection, presence of local witnesses, and recommendation for District Collector scrutiny..."
                    className="w-full p-2.5 text-xs bg-slate-50 rounded-lg border border-govSlate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>

                {/* Statutory Guard Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">policy</span>
                  <span>
                    <strong>Statutory Note:</strong> Field Officers record on-ground factual data. Final award approval, compensation sanction, and legal ownership modification remain the statutory mandate of District / SLAO authorities under the RFCTLARR Act.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-govSlate-100">
                  <button
                    onClick={() => setActiveTab(6)}
                    className="px-3 py-1.5 border border-govSlate-200 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDraft}
                      disabled={savingDraft}
                      className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs border border-govSlate-200 shadow-xs"
                    >
                      Save Draft Only
                    </button>
                    <button
                      onClick={handleSubmitVerification}
                      disabled={submitting || parcelData.verification_status === 'submitted_for_review'}
                      className="flex items-center gap-1 px-5 py-2 rounded-lg bg-secondary hover:bg-govEmeraldDark text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>
                        {parcelData.verification_status === 'submitted_for_review'
                          ? 'Already Submitted for Review'
                          : 'Final Submit for District Review'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
