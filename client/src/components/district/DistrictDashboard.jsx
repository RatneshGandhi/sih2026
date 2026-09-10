import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DistrictOverview from './DistrictOverview';
import DistrictAlerts from './DistrictAlerts';
import DistrictRiskAnalysis from './DistrictRiskAnalysis';
import DistrictProjectProgress from './DistrictProjectProgress';
import DistrictProjectList from './DistrictProjectList';
import DistrictGIS from './DistrictGIS';
import DistrictVerification from './DistrictVerification';
import DistrictObjections from './DistrictObjections';
import DistrictAwardManagement from './DistrictAwardManagement';
import DistrictCompensation from './DistrictCompensation';
import DistrictRRMonitoring from './DistrictRRMonitoring';
import DistrictPossession from './DistrictPossession';
import DistrictActivity from './DistrictActivity';
import DistrictParcelModal from './DistrictParcelModal';
import DistrictDocumentModal from './DistrictDocumentModal';

import {
  DISTRICT_INFO,
  DISTRICT_KPIS,
  DISTRICT_PARCELS,
  DISTRICT_DOCUMENTS,
  DISTRICT_AUDIT_LOGS
} from '../../data/districtData';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';

const TABS = [
  { id: 'overview', label: 'Executive Overview', icon: 'dashboard' },
  { id: 'risk', label: 'Risk & Bottlenecks', icon: 'troubleshoot', badge: 'HIGH RISK' },
  { id: 'projects', label: 'District Projects', icon: 'folder_open' },
  { id: 'gis', label: 'GIS Cadastre Map', icon: 'map' },
  { id: 'verification', label: 'Land Record Verification', icon: 'fact_check', badge: '5-Pillars' },
  { id: 'objections', label: 'Objections & Hearings', icon: 'gavel', badge: 'Sec 15' },
  { id: 'awards', label: 'Statutory Awards', icon: 'military_tech', badge: 'Sec 23' },
  { id: 'compensation', label: 'Compensation & DBT', icon: 'payments' },
  { id: 'rr', label: 'R&R Resettlement', icon: 'home_work' },
  { id: 'possession', label: 'Possession Approvals', icon: 'agriculture', badge: 'Sec 38' },
  { id: 'activity', label: 'Audit History', icon: 'history' }
];

export default function DistrictDashboard() {
  const { user } = useAuthStore();
  const districtName = user?.district || DISTRICT_INFO.district;
  const magistrateName = user?.name || DISTRICT_INFO.magistrateName;
  const designation = user?.designation || DISTRICT_INFO.designation;
  const stateName = user?.state || DISTRICT_INFO.state;

  const currentInfo = useMemo(() => ({
    ...DISTRICT_INFO,
    state: stateName,
    district: districtName,
    magistrateName: magistrateName,
    designation: designation,
    office: `Office of the District Magistrate & Competent Authority for Land Acquisition (CALA), ${districtName}`
  }), [stateName, districtName, magistrateName, designation]);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(tabFromUrl || 'overview');

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
  const [selectedParcelModalId, setSelectedParcelModalId] = useState(null);
  const [activeDocModalItem, setActiveDocModalItem] = useState(null);
  const [auditLogs, setAuditLogs] = useState(DISTRICT_AUDIT_LOGS);
  const [kpis, setKpis] = useState(DISTRICT_KPIS);

  // Load live DB metrics and audit logs on mount
  useEffect(() => {
    let isMounted = true;
    async function loadOverviewMetrics() {
      try {
        const res = await api.get('/district/overview');
        if (res.data?.kpis && isMounted) {
          setKpis((prev) => ({
            ...prev,
            ...res.data.kpis
          }));
        }
        if (res.data?.auditLogs && Array.isArray(res.data.auditLogs) && res.data.auditLogs.length > 0 && isMounted) {
          setAuditLogs(res.data.auditLogs);
        }
      } catch (err) {
        console.warn('District overview live metrics sync fallback:', err.message);
      }
    }
    loadOverviewMetrics();
    return () => { isMounted = false; };
  }, []);

  // Search Results for Quick Bar
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return DISTRICT_PARCELS.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.rightsHolder.toLowerCase().includes(q) ||
        p.projectName.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle opening parcel dossier modal
  const handleOpenParcelDossier = (parcelId) => {
    setSelectedParcelModalId(parcelId);
  };

  // Handle opening document viewer
  const handleOpenDocModal = (parcelId) => {
    const doc =
      DISTRICT_DOCUMENTS.find((d) => d.parcelId === parcelId) ||
      DISTRICT_DOCUMENTS[0];
    setActiveDocModalItem(doc);
  };

  // Handle alerts click: navigate to tab & set context
  const handleSelectAlert = (targetTab) => {
    setActiveTab(targetTab);
  };

  // Handle award declared event to update stats dynamically
  const handleAwardDeclared = (awardItem) => {
    setKpis((prev) => ({
      ...prev,
      pendingVerification: Math.max(0, prev.pendingVerification - 1)
    }));
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        time: 'Just now',
        action: 'Statutory Award declared under Section 23',
        parcel: awardItem.parcelId,
        project: awardItem.projectName,
        role: 'District Magistrate / CALA',
        statutoryRef: 'Section 23 Award',
        details: `Award of ₹ ${(awardItem.totalAwardCompensation / 100000).toFixed(2)} Lakhs confirmed for ${awardItem.affectedPerson}.`
      },
      ...prev
    ]);
  };

  const currentParcelObj = DISTRICT_PARCELS.find((p) => p.id === selectedParcelModalId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1680px] mx-auto w-full antialiased font-sans text-govSlate-900">
      {/* Top Sovereign Telemetry Header */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px] text-govEmerald">gavel</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-primary uppercase tracking-wide">
                GOVERNMENT OF {currentInfo.state.toUpperCase()} • REVENUE &amp; FOREST DEPARTMENT
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold rounded border border-emerald-200">
                DISTRICT CALA BENCH • {currentInfo.district.toUpperCase()}
              </span>
            </div>
            <span className="text-[11px] text-govSlate-500">
              Logged in: {currentInfo.magistrateName} ({currentInfo.designation})
            </span>
          </div>
        </div>

        {/* Search Bar + Quick Actions */}
        <div className="flex items-center gap-2 relative">
          <div className="relative w-64 sm:w-80">
            <div className="flex items-center gap-1.5 bg-govSlate-50 border border-govSlate-200 rounded-lg px-2.5 py-1.5 shadow-inner">
              <span className="material-symbols-outlined text-govSlate-400 text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Survey, Plot, Owner, Corridor..."
                className="w-full bg-transparent text-xs text-govSlate-900 placeholder:text-govSlate-400 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-govSlate-400 hover:text-govSlate-700">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>

            {/* Quick Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-govSlate-200 z-50 max-h-60 overflow-y-auto divide-y divide-govSlate-100 text-xs">
                {searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedParcelModalId(p.id);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-govSlate-50 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-primary font-mono">{p.id}</span> • {p.surveyNumber}
                      <span className="text-[10px] text-govSlate-500 block">{p.rightsHolder} ({p.village})</span>
                    </div>
                    <span className="text-[10px] font-mono text-govEmerald font-bold">{p.statusLabel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-govSlate-200 bg-govSlate-50 hover:bg-govSlate-100 text-govSlate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Export or Print District Dossier"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span className="hidden sm:inline">Print Docket</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="bg-white rounded-xl p-1.5 border border-govSlate-200/90 shadow-xs flex items-center overflow-x-auto gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-xs font-bold'
                  : 'text-govSlate-600 hover:bg-govSlate-100 hover:text-govSlate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-white/20 text-white' :
                  tab.badge === 'HIGH RISK' ? 'bg-red-100 text-error' :
                  'bg-surface-container text-primary'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Primary District Overview Section - rendered in overview tab, or compact strip on other tabs */}
      {activeTab === 'overview' ? (
        <DistrictOverview kpis={kpis} info={currentInfo} />
      ) : (
        <div className="bg-white rounded-xl p-3.5 border border-govSlate-200/90 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              {TABS.find(t => t.id === activeTab)?.icon || 'dashboard'}
            </span>
            <span className="font-bold text-sm text-primary">
              {TABS.find(t => t.id === activeTab)?.label}
            </span>
            <span className="text-govSlate-400">•</span>
            <span className="text-xs text-govSlate-600 font-medium">
              {currentInfo.district} District Jurisdiction
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-govSlate-100 px-2 py-1 rounded text-govSlate-700">
              Projects: <strong>{kpis.totalProjects}</strong>
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded">
              Progress: <strong>{((kpis.landAcquiredHa / kpis.landProposedHa) * 100).toFixed(1)}%</strong>
            </span>
            <span className="bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded">
              Disputes: <strong>{kpis.disputesCount}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Tab Content Display */}
      <div className="w-full flex flex-col gap-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DistrictAlerts onSelectAlert={handleSelectAlert} />
            <DistrictRiskAnalysis
              onTriggerAction={(tab) => {
                setActiveTab(tab);
              }}
            />
            <DistrictProjectProgress
              onSelectProject={() => {
                setActiveTab('projects');
              }}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <DistrictProjectList onInspectParcels={() => setActiveTab('gis')} />
              </div>
              <div className="lg:col-span-4">
                <DistrictActivity logs={auditLogs} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            <DistrictRiskAnalysis
              onTriggerAction={(tab) => {
                setActiveTab(tab);
              }}
            />
            <DistrictAlerts onSelectAlert={handleSelectAlert} />
            <DistrictProjectProgress
              onSelectProject={() => {
                setActiveTab('projects');
              }}
            />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <DistrictProjectList onInspectParcels={() => setActiveTab('gis')} />
            <DistrictProjectProgress />
          </div>
        )}

        {activeTab === 'gis' && (
          <div className="space-y-6">
            <DistrictGIS onSelectParcel={handleOpenParcelDossier} />
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-6">
            <DistrictVerification
              onViewDoc={handleOpenDocModal}
              onViewParcel={handleOpenParcelDossier}
            />
          </div>
        )}

        {activeTab === 'objections' && (
          <div className="space-y-6">
            <DistrictObjections
              onViewDoc={handleOpenDocModal}
              onViewParcel={handleOpenParcelDossier}
            />
          </div>
        )}

        {activeTab === 'awards' && (
          <div className="space-y-6">
            <DistrictAwardManagement
              onViewDoc={handleOpenDocModal}
              onViewParcel={handleOpenParcelDossier}
              onAwardDeclared={handleAwardDeclared}
            />
          </div>
        )}

        {activeTab === 'compensation' && (
          <div className="space-y-6">
            <DistrictCompensation onViewParcel={handleOpenParcelDossier} />
          </div>
        )}

        {activeTab === 'rr' && (
          <div className="space-y-6">
            <DistrictRRMonitoring onViewParcel={handleOpenParcelDossier} />
          </div>
        )}

        {activeTab === 'possession' && (
          <div className="space-y-6">
            <DistrictPossession
              onViewDoc={handleOpenDocModal}
              onViewParcel={handleOpenParcelDossier}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <DistrictActivity logs={auditLogs} />
          </div>
        )}
      </div>

      {/* Global Parcel Dossier Modal */}
      {selectedParcelModalId && currentParcelObj && (
        <DistrictParcelModal
          parcel={currentParcelObj}
          isOpen={true}
          onClose={() => setSelectedParcelModalId(null)}
          onViewDoc={(id) => handleOpenDocModal(id)}
          onOpenAction={(tab) => {
            setSelectedParcelModalId(null);
            setActiveTab(tab);
          }}
        />
      )}

      {/* Global Document Viewer Modal */}
      {activeDocModalItem && (
        <DistrictDocumentModal
          document={activeDocModalItem}
          isOpen={true}
          onClose={() => setActiveDocModalItem(null)}
        />
      )}
    </div>
  );
}
