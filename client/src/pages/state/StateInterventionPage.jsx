import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function StateInterventionPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Intervention drafting modal
  const [activeProject, setActiveProject] = useState(null);
  const [directiveType, setDirectiveType] = useState('appoint_slao');
  const [directiveNotes, setDirectiveNotes] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const loadInterventions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/state/intervention-priority');
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load intervention priority:', err);
      setError('Unable to load state resource intervention priority queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterventions();
  }, []);

  const handleDispatchDirective = () => {
    if (!directiveNotes.trim()) {
      alert('Please enter executive directive notes.');
      return;
    }
    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      setActiveProject(null);
      setDirectiveNotes('');
      alert('Cabinet Executive Directive recorded and transmitted to District Magistrate.');
    }, 800);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
        <span className="text-xs text-slate-500 font-medium">Analyzing State Bottlenecks &amp; Delays...</span>
      </div>
    );
  }

  const bottleneck = data?.flagged_bottleneck;
  const list = data?.prioritized_projects || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Crisis Intervention &amp; Bottleneck Resolution
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Resource Allocation &amp; Cabinet Interventions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify severe land acquisition delays and allocate state resources, special revenue officers, and fast-track dispute settlement.
          </p>
        </div>
      </div>

      {/* Flagged Single Critical Bottleneck (Ratnagiri) */}
      {bottleneck && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-6 text-white shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Critical State Bottleneck
                </span>
                <span className="text-amber-100 text-xs font-mono">
                  {bottleneck.district} Collectorate
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {bottleneck.title}
              </h2>
              <p className="text-xs text-amber-50 max-w-2xl leading-relaxed">
                {bottleneck.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-amber-100">
                <div className="bg-black/15 px-3 py-1.5 rounded-lg">
                  State Pending Share: <strong className="text-white">{bottleneck.pending_pct_of_state}%</strong>
                </div>
                <div className="bg-black/15 px-3 py-1.5 rounded-lg">
                  Delays: <strong className="text-white">{bottleneck.delay_days} Days Past Milestone</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveProject(list[0] || { title: bottleneck.title, project_code: 'MH-RTN-005', district: 'Ratnagiri' })}
              className="shrink-0 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 self-start lg:self-center"
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span>Deploy Cabinet Intervention</span>
            </button>
          </div>
        </div>
      )}

      {/* Prioritized Intervention Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Prioritized Projects Needing Administrative Action</h3>
            <p className="text-xs text-slate-500">Sorted by Composite Priority Score (pending land volume, delay, and litigation)</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {list.length} Projects Flagged
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {list.map((proj, idx) => {
            const score = proj.priority_score || 0;
            const isDelayed = proj.timeline_status === 'delayed';

            return (
              <div
                key={proj.id || idx}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors rounded-xl px-2"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {proj.project_code}
                    </span>
                    <span className="text-xs font-bold text-purple-700">{proj.district}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      score >= 70 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Priority Score: {score}/100
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">
                    {proj.title}
                  </h4>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                    <span>Pending Land: <strong className="text-slate-800">{Number(proj.pending_ha || 0).toFixed(1)} Ha</strong></span>
                    <span>Disputed Parcels: <strong className="text-red-700">{proj.disputed_parcels || 0}</strong></span>
                    <span>Status: <strong className={isDelayed ? 'text-red-700' : 'text-slate-800'}>{proj.timeline_status}</strong></span>
                    <span>Budget: <strong className="text-slate-800">₹{Number(proj.estimated_budget_cr || 0).toLocaleString('en-IN')} Cr</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/state/projects/${proj.id}`)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Dossier
                  </button>
                  <button
                    onClick={() => setActiveProject(proj)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>Direct Intervention</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Directive Dispatch Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                  State Executive Directive
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-0.5">
                  Intervene in {activeProject.title}
                </h3>
              </div>
              <button onClick={() => setActiveProject(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intervention Strategy
              </label>
              <select
                value={directiveType}
                onChange={(e) => setDirectiveType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-purple-500"
              >
                <option value="appoint_slao">Deploy Additional Special Land Acquisition Officers (SLAO)</option>
                <option value="fast_track_bench">Request High Court Special Land Bench for Injunctions</option>
                <option value="gram_sabha">Order Joint Gram Sabha &amp; Tribal Consent Consensus Session</option>
                <option value="enhanced_solatium">Approve Special State Ex-Gratia / Solatium Supplement</option>
                <option value="drone_survey">Re-survey with Aerial LiDAR &amp; Drones for Verification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cabinet Secretariat Directive Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={directiveNotes}
                onChange={(e) => setDirectiveNotes(e.target.value)}
                placeholder="Specify timelines, allocated budgetary supplement, or designated officers..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveProject(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchDirective}
                disabled={dispatchSuccess}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>{dispatchSuccess ? 'Transmitting Directive...' : 'Issue Directive'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
