import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import DistrictDashboard from '../components/district/DistrictDashboard';
import MinistryDashboard from '../components/ministry/MinistryDashboard';

const STAGE_COLORS = {
  proposal_submitted: '#94A3B8',
  document_verification: '#38BDF8',
  district_scrutiny: '#F2A93B',
  state_approval: '#818CF8',
  award_declared: '#A78BFA',
  compensation_disbursed: '#34D399',
  possession_taken: '#0E9F6E'
};

const STAGE_LABELS = {
  proposal_submitted: '1. Proposal Submitted',
  document_verification: '2. Doc Verification',
  district_scrutiny: '3. District Scrutiny',
  state_approval: '4. State Approval',
  award_declared: '5. Award Declared',
  compensation_disbursed: '6. DBT Disbursed',
  possession_taken: '7. Possession Taken'
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (user?.role === 'district_official') {
    return <DistrictDashboard />;
  }

  if (user?.role === 'ministry_official') {
    return <MinistryDashboard />;
  }

  return <StandardDashboardPage />;
}

function StandardDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [sumRes, mapRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/map-data')
        ]);
        setSummary(sumRes.data);
        setMapData(mapRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Could not retrieve dashboard metrics from server.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const getParcelStyle = (feature) => {
    const status = feature.properties?.status;
    switch (status) {
      case 'possession_taken':
        return { color: '#057A55', fillColor: '#0E9F6E', weight: 2, fillOpacity: 0.6 };
      case 'acquired':
        return { color: '#1D4ED8', fillColor: '#3B82F6', weight: 2, fillOpacity: 0.5 };
      case 'disputed':
        return { color: '#991B1B', fillColor: '#BA1A1A', weight: 2, fillOpacity: 0.7 };
      case 'notified':
      default:
        return { color: '#B45309', fillColor: '#F2A93B', weight: 2, fillOpacity: 0.5 };
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-on-surface-variant font-semibold">
            Aggregating Central Cadastre Metrics...
          </span>
        </div>
      </div>
    );
  }

  const kpis = summary?.kpis || {};
  const donutData = (summary?.projects_by_stage || []).map((s) => ({
    name: STAGE_LABELS[s.status] || s.status,
    rawStatus: s.status,
    value: parseInt(s.count, 10),
    color: STAGE_COLORS[s.status] || '#64748B'
  }));

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Top Sovereign Notice Strip */}
      <div className="w-full bg-white rounded-xl p-space-md border border-govSlate-200/80 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[28px] text-govEmerald">assured_workload</span>
          </div>
          <div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-bold text-xl text-primary tracking-tight font-sans">
                Executive Command Center
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold tracking-wide">
                STATUTORY MONITORING
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                RFCTLARR ACT, 2013 REGIME
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Consolidated national cadastre, DBT solatium accounts, and drone-verified boundary clearances.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap self-end xl:self-auto">
          <div className="flex items-center gap-1.5 bg-surface-container-low border border-govSlate-200 px-space-sm py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono font-semibold text-primary">CADASTRE SYNC: LIVE</span>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="h-9 px-space-md bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">layers</span>
            <span>Open GIS Cadastre</span>
          </button>
        </div>
      </div>

      {/* 6 Real Database-Aggregated KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-space-sm">
        {/* Card 1: Area Notified */}
        <div className="bg-white rounded-xl p-space-sm border border-govSlate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Area Notified</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-mono text-[10px] font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> 100%
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary tracking-tight font-tnum">
              {kpis.total_area_notified_ha} <span className="text-xs font-normal text-on-surface-variant">Ha</span>
            </div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              Across {kpis.total_parcels} cadastral plots
            </div>
          </div>
          <div className="w-full pt-1">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Area Acquired */}
        <div className="bg-white rounded-xl p-space-sm border border-govSlate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Area Acquired</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              {kpis.pct_acquired}%
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-secondary tracking-tight font-tnum">
              {kpis.total_area_acquired_ha} <span className="text-xs font-normal text-on-surface-variant">Ha</span>
            </div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              Section 19 Gazetted
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: `${Math.min(100, kpis.pct_acquired)}%` }}></div>
          </div>
        </div>

        {/* Card 3: Compensation Flow */}
        <div className="bg-white rounded-xl p-space-sm border border-govSlate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Compensation Flow</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-mono text-[10px] font-bold">
              {kpis.pct_compensation_disbursed}% Disbursed
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary tracking-tight font-tnum">
              ₹ {kpis.total_compensation_paid_cr} <span className="text-xs font-normal text-on-surface-variant">Cr</span>
            </div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              Assessed: ₹ {kpis.total_compensation_assessed_cr} Cr
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-govEmerald h-full rounded-full" style={{ width: `${Math.min(100, kpis.pct_compensation_disbursed)}%` }}></div>
          </div>
        </div>

        {/* Card 4: Families Affected (PAFs) */}
        <div className="bg-white rounded-xl p-space-sm border border-govSlate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Project Families (PAFs)</span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">groups</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary tracking-tight font-tnum">
              {kpis.total_families_affected} <span className="text-xs font-normal text-on-surface-variant">PAFs</span>
            </div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              Resettlement &amp; Grants Tracked
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary-container h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Card 5: R&R Composite Progress */}
        <div className="bg-white rounded-xl p-space-sm border border-govSlate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">R&amp;R Status</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
              Sec 31-38
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-secondary tracking-tight font-tnum">
              {kpis.pct_rnr_completed}%
            </div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              Homesteads &amp; Annuity settled
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: `${Math.min(100, kpis.pct_rnr_completed)}%` }}></div>
          </div>
        </div>

        {/* Card 6: Possession Status */}
        <div className="bg-white rounded-xl p-space-sm border border-govSlate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Possession Status</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">verified</span> {kpis.pct_possession}%
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-primary tracking-tight font-tnum">
              {kpis.total_area_possessed_ha} <span className="text-xs font-normal text-on-surface-variant">Ha</span>
            </div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              Section 38 Handover orders
            </div>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, kpis.pct_possession)}%` }}></div>
          </div>
        </div>
      </section>

      {/* Main Grid: Interactive Mini-Map + Donut Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        {/* Left (Col 1-8): Live Cadastral Map View */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-govSlate-200/80 shadow-xs p-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">map</span>
                <h2 className="font-bold text-base text-primary">National Cadastral Map Grid</h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  {mapData?.features?.length || 0} Parcels Mapped
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Real database polygons color-coded by acquisition and possession state.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#0E9F6E]"></span>
                <span className="text-govSlate-700 text-[11px]">Possession Taken</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#3B82F6]"></span>
                <span className="text-govSlate-700 text-[11px]">Acquired</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#F2A93B]"></span>
                <span className="text-govSlate-700 text-[11px]">Notified</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#BA1A1A]"></span>
                <span className="text-govSlate-700 text-[11px]">Disputed</span>
              </span>
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="h-[380px] w-full rounded-xl overflow-hidden border border-govSlate-200 relative">
            <MapContainer
              center={[20.5937, 78.9629]} // Center on India
              zoom={5}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapData && (
                <GeoJSON
                  data={mapData}
                  style={getParcelStyle}
                  onEachFeature={(feature, layer) => {
                    const p = feature.properties;
                    layer.bindPopup(`
                      <div style="font-family: Inter, sans-serif; font-size: 12px; padding: 4px;">
                        <b style="color: #001533; font-size: 13px;">Survey: ${p.survey_number}</b><br/>
                        <b>Owner:</b> ${p.owner_name}<br/>
                        <b>Area:</b> ${p.area_hectares} Ha<br/>
                        <b>Status:</b> <span style="text-transform: capitalize; font-weight: bold; color: ${
                          p.status === 'possession_taken' ? '#0E9F6E' : p.status === 'disputed' ? '#BA1A1A' : '#F2A93B'
                        }">${p.status.replace('_', ' ')}</span><br/>
                        <b>Project:</b> ${p.project_name || 'N/A'}<br/>
                        <b>Location:</b> ${p.district}, ${p.state}
                      </div>
                    `);
                  }}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Right (Col 9-12): Projects by Workflow Stage (Recharts Donut) */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-govSlate-200/80 shadow-xs p-space-md flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-govSlate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
                <h2 className="font-bold text-sm text-primary">Projects by Lifecycle Stage</h2>
              </div>
              <span className="text-[11px] font-mono text-outline font-semibold">
                Total: {summary?.projects_by_stage?.reduce((acc, c) => acc + parseInt(c.count, 10), 0)}
              </span>
            </div>

            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      fontFamily: 'Inter'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stage breakdown tags */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-govSlate-100 text-[11px]">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-1 rounded bg-surface">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <span className="truncate text-govSlate-700">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-primary shrink-0">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Needing Attention Table */}
      <div className="bg-white rounded-xl border border-govSlate-200/80 shadow-xs p-space-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-govAmber text-[22px]">warning</span>
            <div>
              <h3 className="font-bold text-sm text-primary">Statutory Priority: Projects Needing Immediate Attention</h3>
              <p className="text-xs text-on-surface-variant">Under Section 15 scrutiny hearings or with recorded title disputes.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="text-xs font-semibold text-primary hover:text-govEmerald hover:underline flex items-center gap-0.5"
          >
            <span>View All Projects</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase font-mono text-[10px]">
              <tr>
                <th className="p-2.5 rounded-l-lg">Project Code</th>
                <th className="p-2.5">Corridor / Asset Name</th>
                <th className="p-2.5">Location</th>
                <th className="p-2.5">Current Stage</th>
                <th className="p-2.5">Disputed Parcels</th>
                <th className="p-2.5 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {(summary?.projects_needing_attention || []).map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-2.5 font-mono font-semibold text-primary">{p.project_code || `#PROP-00${p.id}`}</td>
                  <td className="p-2.5 font-semibold text-govSlate-900 max-w-xs truncate">{p.name}</td>
                  <td className="p-2.5 text-govSlate-600">{p.district}, {p.state}</td>
                  <td className="p-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      {STAGE_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td className="p-2.5">
                    {parseInt(p.disputed_parcels, 10) > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-error">
                        <span className="material-symbols-outlined text-[14px]">flag</span>
                        {p.disputed_parcels} Disputed
                      </span>
                    ) : (
                      <span className="text-outline font-mono">0 Clear</span>
                    )}
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] transition-colors"
                    >
                      Inspect Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
