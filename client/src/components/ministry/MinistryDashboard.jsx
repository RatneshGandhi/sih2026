import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NationalOverview from './NationalOverview';
import NationalGIS from './NationalGIS';
import StateComparison from './StateComparison';
import NationalKPIs from './NationalKPIs';
import NationalRiskMap from './NationalRiskMap';
import PredictiveAnalytics from './PredictiveAnalytics';
import ProjectRiskDeepDive from './ProjectRiskDeepDive';
import PolicyInsights from './PolicyInsights';
import NationalAlerts from './NationalAlerts';
import TimelineAnalytics from './TimelineAnalytics';
import NationalCompensation from './NationalCompensation';
import NationalRR from './NationalRR';
import NationalPossession from './NationalPossession';
import NationalReports from './NationalReports';
import MinistryParcelModal from './MinistryParcelModal';

import {
  MINISTRY_INFO,
  NATIONAL_KPIS,
  STATES_DATA,
  PREDICTIVE_DELAY_PROJECTS,
  PARCEL_P103_READONLY
} from '../../data/ministryData';
import api from '../../api/client';

const TABS = [
  { id: 'overview', label: 'National Overview', icon: 'dashboard' },
  { id: 'gis', label: 'National GIS', icon: 'public', badge: '5-Tier' },
  { id: 'comparison', label: 'State Comparison', icon: 'bar_chart' },
  { id: 'kpis', label: 'National Progress', icon: 'trending_up' },
  { id: 'risk', label: 'Risk Heatmap', icon: 'troubleshoot', badge: 'Risk Index' },
  { id: 'predictions', label: 'Predictive Delay', icon: 'psychology', badge: '18 At Risk' },
  { id: 'deepdive', label: 'Risk Deep Dive', icon: 'help', badge: 'Why 82/100' },
  { id: 'policy', label: 'Policy Insights', icon: 'lightbulb', badge: '4 Insights' },
  { id: 'alerts', label: 'National Alerts', icon: 'notifications_active', badge: '5 Alerts' },
  { id: 'timeline', label: 'Timeline Adherence', icon: 'schedule' },
  { id: 'compensation', label: 'Compensation & DBT', icon: 'payments' },
  { id: 'rr', label: 'R&R Monitoring', icon: 'home_work' },
  { id: 'possession', label: 'Possession Status', icon: 'agriculture', badge: 'Sec 38' },
  { id: 'reports', label: 'Reports & Analytics', icon: 'description' }
];

export default function MinistryDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(tabFromUrl || 'overview');
  const [liveKpis, setLiveKpis] = useState(NATIONAL_KPIS);

  useEffect(() => {
    let isMounted = true;
    async function loadMinistrySummary() {
      try {
        const res = await api.get('/dashboard/summary');
        if (res.data?.kpis && isMounted) {
          const k = res.data.kpis;
          setLiveKpis((prev) => ({
            ...prev,
            landProposedHa: parseFloat(k.total_area_notified_ha) || prev.landProposedHa,
            landAcquiredHa: parseFloat(k.total_area_acquired_ha) || prev.landAcquiredHa,
            acquisitionProgressPct: parseFloat(k.pct_acquired) || prev.acquisitionProgressPct,
            compensationAssessedCr: parseFloat(k.total_compensation_assessed_cr) || prev.compensationAssessedCr,
            compensationDisbursedCr: parseFloat(k.total_compensation_paid_cr) || prev.compensationDisbursedCr,
            affectedFamilies: k.total_families_affected || prev.affectedFamilies,
            possessionCompletedPct: parseFloat(k.pct_possession) || prev.possessionCompletedPct,
            rrCompletedPct: parseFloat(k.pct_rnr_completed) || prev.rrCompletedPct
          }));
        }
      } catch (err) {
        console.warn('Ministry dashboard live sync fallback:', err.message);
      }
    }
    loadMinistrySummary();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [tabFromUrl]);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    setSearchParams({ tab: tabId });
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [deepDiveProject, setDeepDiveProject] = useState(null);
  const [activeParcelModal, setActiveParcelModal] = useState(null);

  // Universal National Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const results = [];

    // Search Parcels (e.g. P103, SRV-103)
    if ('p103'.includes(q) || 'srv-103'.includes(q) || 'rahul sharma'.includes(q)) {
      results.push({
        type: 'parcel',
        label: `Parcel P103 (Survey SRV-103)`,
        sublabel: `Maharashtra → Ratnagiri → Mumbai-Goa Railway → P103 (Rahul Sharma)`,
        badge: 'Disputed Parcel',
        badgeColor: 'bg-red-50 text-red-700 border-red-200',
        data: PARCEL_P103_READONLY
      });
    }

    // Search Projects
    PREDICTIVE_DELAY_PROJECTS.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'project',
          label: `${p.name} (${p.id})`,
          sublabel: `${p.state} • ${p.district} • Progress ${p.progressPct}% • Risk ${p.riskScore}/100`,
          badge: p.delayFormatted ? `Delay ${p.delayFormatted}` : 'Project',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          data: p
        });
      }
    });

    // Search States
    STATES_DATA.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) {
        results.push({
          type: 'state',
          label: `${s.name} (${s.code})`,
          sublabel: `${s.projectsCount} Projects • ${s.acquisitionPct}% Acquired • Risk ${s.riskScore}/100`,
          badge: s.riskLevel,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          data: s
        });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery]);

  // Navigate to Deep Dive tab with specific project
  const handleDeepDiveProject = (proj) => {
    setDeepDiveProject(proj);
    setActiveTab('deepdive');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1680px] mx-auto w-full antialiased font-sans text-govSlate-900">
      {/* Read-Only Parcel Modal if opened from search */}
      {activeParcelModal && (
        <MinistryParcelModal
          parcel={activeParcelModal}
          onClose={() => setActiveParcelModal(null)}
        />
      )}

      {/* Top Sovereign Telemetry Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px] sm:text-[28px] text-govEmerald">
              account_balance
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-xs text-primary uppercase tracking-wide">
                GOVERNMENT OF INDIA • MINISTRY OF RURAL DEVELOPMENT (MoRD)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold border border-emerald-200">
                CENTRAL APEX BENCH
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-mono text-[9px] font-bold border border-blue-200">
                PM-GATISHAKTI NMP
              </span>
            </div>
            <span className="text-[11px] text-govSlate-600 mt-0.5">
              NLAMS Central Command &amp; Policy Decision Support System • Department of Land Resources
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          <div className="flex items-center gap-1.5 bg-govSlate-50 border border-govSlate-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-govEmerald animate-pulse"></span>
            <span className="font-mono font-bold text-primary">CADASTRE STREAM: LIVE</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs text-blue-900">
            <span className="material-symbols-outlined text-[16px] text-blue-700">lock</span>
            <span className="font-semibold">Oversight Mode (Read-Only)</span>
          </div>
        </div>
      </div>

      {/* Universal National Search Bar */}
      <div className="relative z-30">
        <div className="bg-white rounded-2xl p-3 border border-govSlate-200/90 shadow-xs flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[22px] ml-1">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Universal National Search: Search by State, District, Project, Parcel ID (e.g. P103), or Survey # (e.g. SRV-103)..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-govSlate-900 placeholder-govSlate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-lg hover:bg-govSlate-100 text-govSlate-400"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-1 bg-govSlate-100 text-govSlate-500 font-mono text-[10px] rounded-lg">
            Ctrl+K
          </span>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-govSlate-200 overflow-hidden divide-y divide-govSlate-100 animate-slide-down">
            {searchResults.map((res, i) => (
              <div
                key={i}
                onClick={() => {
                  if (res.type === 'parcel') {
                    setActiveParcelModal(res.data);
                  } else if (res.type === 'project') {
                    handleDeepDiveProject(res.data);
                  } else if (res.type === 'state') {
                    setActiveTab('comparison');
                  }
                  setSearchQuery('');
                }}
                className="p-3.5 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors text-xs"
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    {res.type === 'parcel' ? 'layers' : res.type === 'project' ? 'folder_open' : 'public'}
                  </span>
                  <div>
                    <div className="font-bold text-govSlate-900 text-sm">{res.label}</div>
                    <div className="text-[11px] text-govSlate-500 mt-0.5">{res.sublabel}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${res.badgeColor}`}>
                    {res.badge}
                  </span>
                  <span className="material-symbols-outlined text-govSlate-400 text-[18px]">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Tab Bar */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-govSlate-200/90 shadow-xs min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-govSlate-600 hover:bg-govSlate-100 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.badge.includes('Risk') || tab.badge.includes('Alerts')
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-govSlate-100 text-govSlate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab View Rendering */}
      <main className="w-full">
        {activeTab === 'overview' && (
          <NationalOverview onNavigateTab={(tab) => setActiveTab(tab)} kpis={liveKpis} />
        )}

        {activeTab === 'gis' && (
          <NationalGIS
            onDeepDiveProject={(p) => handleDeepDiveProject(p)}
          />
        )}

        {activeTab === 'comparison' && (
          <StateComparison
            onSelectStateForGIS={(stateCode) => {
              setActiveTab('gis');
            }}
          />
        )}

        {activeTab === 'kpis' && <NationalKPIs />}

        {activeTab === 'risk' && (
          <NationalRiskMap
            onSelectStateForGIS={(stateCode) => {
              setActiveTab('gis');
            }}
          />
        )}

        {activeTab === 'predictions' && (
          <PredictiveAnalytics
            onSelectProjectForDeepDive={(p) => handleDeepDiveProject(p)}
          />
        )}

        {activeTab === 'deepdive' && (
          <ProjectRiskDeepDive
            initialProject={deepDiveProject}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'policy' && <PolicyInsights />}

        {activeTab === 'alerts' && (
          <NationalAlerts
            onSelectAlert={(targetTab) => setActiveTab(targetTab)}
          />
        )}

        {activeTab === 'timeline' && <TimelineAnalytics />}

        {activeTab === 'compensation' && <NationalCompensation />}

        {activeTab === 'rr' && <NationalRR />}

        {activeTab === 'possession' && <NationalPossession />}

        {activeTab === 'reports' && <NationalReports />}
      </main>

      {/* Statutory Footer Strip */}
      <footer className="bg-white rounded-2xl p-4 border border-govSlate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-govSlate-500">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-govEmerald text-[18px]">verified</span>
          <span>
            NLAMS National Land Acquisition &amp; Management System • Central Ministry Oversight Portal
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Synced: {MINISTRY_INFO.syncTimestamp}</span>
          <span>•</span>
          <span className="text-primary font-bold">MoRD / GoI</span>
        </div>
      </footer>
    </div>
  );
}
