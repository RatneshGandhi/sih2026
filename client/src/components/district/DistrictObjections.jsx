import React, { useState, useEffect } from 'react';
import { DISTRICT_OBJECTIONS } from '../../data/districtData';
import api from '../../api/client';

export default function DistrictObjections({ onViewDoc, onViewParcel }) {
  const [objections, setObjections] = useState(DISTRICT_OBJECTIONS);
  const [selectedObjection, setSelectedObjection] = useState(null);
  const [scheduleModalObj, setScheduleModalObj] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('2026-09-25');
  const [scheduledBench, setScheduledBench] = useState('CALA Chamber 1, Collectorate');
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch live objections from DB on mount
  useEffect(() => {
    let isMounted = true;
    async function loadObjections() {
      setIsLoading(true);
      try {
        const res = await api.get('/district/objections');
        if (res.data?.objections && Array.isArray(res.data.objections) && isMounted) {
          const liveList = res.data.objections;
          // Merge live DB objections with standard demo dockets for rich coverage
          const liveIds = new Set(liveList.map(o => o.id));
          const complementary = DISTRICT_OBJECTIONS.filter(o => !liveIds.has(o.id));
          setObjections([...liveList, ...complementary]);
        }
      } catch (err) {
        console.warn('Live objections fetch fallback:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadObjections();
    return () => { isMounted = false; };
  }, []);

  const handleUpdateStatus = async (id, newStatus, statusLabel, remarks) => {
    const targetObj = objections.find(o => o.id === id);
    const dbTargetId = targetObj?.dbId || id;

    // Optimistically update UI
    setObjections((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            status: newStatus,
            statusLabel: statusLabel,
            officerRemarks: remarks || o.officerRemarks
          };
        }
        return o;
      })
    );
    if (selectedObjection?.id === id) {
      setSelectedObjection((prev) => ({
        ...prev,
        status: newStatus,
        statusLabel: statusLabel,
        officerRemarks: remarks || prev.officerRemarks
      }));
    }

    try {
      await api.patch(`/district/objections/${dbTargetId}`, {
        status: newStatus,
        officerRemarks: remarks
      });
      showToast(`Objection ${id} status updated to: ${statusLabel} in central database`);
    } catch (err) {
      console.warn('Statutory status update local sync:', err.message);
      showToast(`Objection ${id} updated locally: ${statusLabel}`);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleModalObj) return;
    const formatted = `${scheduledDate} (${scheduledBench})`;
    const targetObj = scheduleModalObj;
    const dbTargetId = targetObj?.dbId || targetObj.id;

    // Optimistically update UI
    setObjections((prev) =>
      prev.map((o) => {
        if (o.id === targetObj.id) {
          return {
            ...o,
            status: 'hearing_scheduled',
            statusLabel: 'Hearing Scheduled',
            hearingDate: formatted,
            officerRemarks: `Hearing summons dispatched for ${formatted}. Summons served to Landowner & Requisitioning Agency.`
          };
        }
        return o;
      })
    );

    try {
      await api.patch(`/district/objections/${dbTargetId}`, {
        status: 'hearing_scheduled',
        hearingDate: scheduledDate,
        hearingNotes: scheduledBench,
        officerRemarks: `Hearing summons dispatched for ${formatted}. Formal notice served.`
      });
      showToast(`Hearing scheduled for ${targetObj.id} on ${formatted}. Citizen notified!`);
    } catch (err) {
      console.warn('Hearing schedule local sync:', err.message);
      showToast(`Hearing scheduled for ${targetObj.id} on ${formatted}`);
    }

    setScheduleModalObj(null);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-govEmerald">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-primary">gavel</span>
          <div>
            <h2 className="font-bold text-base text-primary">Section 15 Objections &amp; Statutory Hearings</h2>
            <p className="text-xs text-govSlate-500">
              Quasi-judicial hearing docket under RFCTLARR Act, 2013 for boundary discrepancies, valuation appeals, and severance claims.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
          {objections.filter((o) => o.status !== 'rejected' && o.status !== 'accepted').length} Active Dockets
        </span>
      </div>

      {/* Objections Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {objections.map((obj) => {
          const isScheduled = obj.status === 'hearing_scheduled';
          const isAccepted = obj.status === 'accepted';
          const isRejected = obj.status === 'rejected';

          return (
            <div
              key={obj.id}
              className="p-4 rounded-xl border border-govSlate-200 bg-white hover:border-primary transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary bg-surface-container px-2 py-0.5 rounded">
                      {obj.id} ({obj.objectionCode})
                    </span>
                    <h4 className="font-extrabold text-sm text-govSlate-900 mt-1">{obj.applicant}</h4>
                    <p className="text-[11px] text-govSlate-500">
                      Parcel: <strong className="text-govSlate-800">{obj.parcelId}</strong> (Survey {obj.surveyNumber}) • {obj.projectName}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    isAccepted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    isRejected ? 'bg-red-100 text-error border border-red-200' :
                    isScheduled ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    {isAccepted ? '🟢 ' : isRejected ? '🔴 ' : isScheduled ? '🔵 ' : '🟡 '}
                    {obj.statusLabel}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-govSlate-50 border border-govSlate-200 text-xs">
                  <span className="text-[10px] font-bold text-govSlate-500 uppercase block">Grievance / Grounds:</span>
                  <p className="text-govSlate-800 font-medium mt-0.5">{obj.reason}</p>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-govSlate-600">
                  <span>Hearing: <strong className="text-primary">{obj.hearingDate}</strong></span>
                  <span className="font-mono">{obj.documentsCount} Documents Filed</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-govSlate-100 flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedObjection(obj)}
                  className="px-2.5 py-1 rounded bg-govSlate-100 hover:bg-govSlate-200 text-govSlate-800 text-xs font-semibold"
                >
                  View Details
                </button>

                <button
                  onClick={() => setScheduleModalObj(obj)}
                  className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold"
                >
                  Schedule Hearing
                </button>

                <button
                  onClick={() => {
                    handleUpdateStatus(obj.id, 'under_review', 'Re-survey Ordered', 'Sent to Field Officer for joint GPS re-measurement.');
                  }}
                  className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold"
                >
                  Request Verification
                </button>

                <button
                  onClick={() => handleUpdateStatus(obj.id, 'accepted', 'Accepted (Sec 15 Order)', 'CALA bench accepted objection. Re-valuation ordered.')}
                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold"
                >
                  Accept
                </button>

                <button
                  onClick={() => handleUpdateStatus(obj.id, 'rejected', 'Rejected on Merits', 'Disallowed after scrutinizing 1985 settlement records.')}
                  className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-error text-xs font-semibold"
                >
                  Reject
                </button>

                <button
                  onClick={() => onViewDoc && onViewDoc(obj.parcelId)}
                  className="p-1 text-govSlate-500 hover:text-govEmerald ml-auto"
                  title="View Attached Documents"
                >
                  <span className="material-symbols-outlined text-[18px]">attach_file</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hearing Details Modal */}
      {selectedObjection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-2xl w-full p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-200">
              <div>
                <span className="font-mono text-xs font-bold bg-primary text-white px-2 py-0.5 rounded">
                  {selectedObjection.objectionCode}
                </span>
                <h3 className="font-bold text-base text-primary mt-1">
                  Section 15 Hearing Docket: {selectedObjection.id}
                </h3>
              </div>
              <button onClick={() => setSelectedObjection(null)} className="text-govSlate-400 hover:text-govSlate-800">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-govSlate-50 rounded border border-govSlate-200">
                <span className="text-[10px] font-bold text-govSlate-500 uppercase">Applicant</span>
                <p className="font-bold text-govSlate-900 mt-0.5">{selectedObjection.applicant}</p>
                <p className="text-govSlate-600">{selectedObjection.contact}</p>
              </div>
              <div className="p-2.5 bg-govSlate-50 rounded border border-govSlate-200">
                <span className="text-[10px] font-bold text-govSlate-500 uppercase">Parcel Reference</span>
                <p className="font-bold text-govSlate-900 mt-0.5">Plot {selectedObjection.parcelId} (Survey {selectedObjection.surveyNumber})</p>
                <p className="text-govSlate-600 truncate">{selectedObjection.projectName}</p>
              </div>
            </div>

            <div className="p-3 bg-govSlate-50 rounded border border-govSlate-200 text-xs">
              <span className="text-[10px] font-bold text-govSlate-500 uppercase block">Grievance Description:</span>
              <p className="text-govSlate-800 mt-0.5 leading-relaxed">{selectedObjection.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-govSlate-50 rounded border border-govSlate-200">
                <span className="text-[10px] font-bold text-govSlate-500 uppercase">Hearing Schedule</span>
                <p className="font-bold text-primary mt-0.5">{selectedObjection.hearingDate}</p>
              </div>
              <div className="p-2.5 bg-govSlate-50 rounded border border-govSlate-200">
                <span className="text-[10px] font-bold text-govSlate-500 uppercase">Current Workflow Status</span>
                <p className="font-bold text-amber-900 mt-0.5">{selectedObjection.statusLabel}</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded border border-govSlate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-govSlate-500 uppercase">CALA Officer Remarks:</span>
              <p className="text-govSlate-700 italic">{selectedObjection.officerRemarks}</p>
            </div>

            <div className="p-3 bg-white rounded border border-govSlate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-govSlate-500 uppercase">Verification Result:</span>
              <p className="text-govSlate-700">{selectedObjection.verificationResult}</p>
            </div>

            {/* Attached Docs */}
            <div className="text-xs">
              <span className="text-[10px] font-bold text-govSlate-500 uppercase block mb-1">Attached Exhibits ({selectedObjection.documents?.length || 0}):</span>
              <div className="space-y-1">
                {selectedObjection.documents?.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-govSlate-50 rounded border border-govSlate-200">
                    <span className="font-mono text-govSlate-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-govEmerald">description</span>
                      {d.name} ({d.size})
                    </span>
                    <button
                      onClick={() => onViewDoc && onViewDoc(selectedObjection.parcelId)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Inspect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-govSlate-200">
              <button
                onClick={() => onViewParcel && onViewParcel(selectedObjection.parcelId)}
                className="px-3 py-1.5 rounded-lg border border-govSlate-300 text-xs font-semibold hover:bg-govSlate-100"
              >
                Inspect Parcel Dossier
              </button>
              <button
                onClick={() => setSelectedObjection(null)}
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold"
              >
                Close Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Hearing Modal */}
      {scheduleModalObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-govSlate-300 max-w-md w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-200">
              <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600">event</span>
                Schedule Section 15 Hearing
              </h3>
              <button onClick={() => setScheduleModalObj(null)} className="text-govSlate-400 hover:text-govSlate-800">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="text-xs space-y-3 text-govSlate-700">
              <p>
                Scheduling summons for <strong>{scheduleModalObj.applicant}</strong> regarding Parcel <strong>{scheduleModalObj.parcelId}</strong>.
              </p>

              <div>
                <label className="block font-bold text-govSlate-800 mb-1">Hearing Date:</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-govSlate-50 border border-govSlate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-govSlate-800 mb-1">Hearing Courtroom / Bench:</label>
                <select
                  value={scheduledBench}
                  onChange={(e) => setScheduledBench(e.target.value)}
                  className="w-full bg-govSlate-50 border border-govSlate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="CALA Chamber 1, Collectorate">CALA Chamber 1, Collectorate</option>
                  <option value="Joint Agriculture & Revenue Tribunal">Joint Agriculture &amp; Revenue Tribunal</option>
                  <option value="Tahsildar Court, Ratnagiri Division">Tahsildar Court, Ratnagiri Division</option>
                </select>
              </div>

              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
                Statutory Notice Form 8 will be dispatched via registered speed-post and SMS notification.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-govSlate-200">
              <button
                onClick={() => setScheduleModalObj(null)}
                className="px-3 py-1.5 rounded-lg border border-govSlate-300 text-xs font-semibold hover:bg-govSlate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold"
              >
                Confirm &amp; Issue Summons
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
