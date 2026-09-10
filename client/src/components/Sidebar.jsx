import React from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const MINISTRY_NAV_ITEMS = [
  { tab: 'overview', to: '/?tab=overview', label: 'National Overview', icon: 'dashboard' },
  { tab: 'gis', to: '/?tab=gis', label: 'National GIS (5-Tier)', icon: 'public', badge: '5-Tier' },
  { tab: 'comparison', to: '/?tab=comparison', label: 'State Performance', icon: 'bar_chart' },
  { tab: 'kpis', to: '/?tab=kpis', label: 'National Progress', icon: 'trending_up' },
  { tab: 'risk', to: '/?tab=risk', label: 'Risk Heatmap', icon: 'troubleshoot', badge: 'Risk Index' },
  { tab: 'predictions', to: '/?tab=predictions', label: 'Predictive Delay', icon: 'psychology', badge: '18 At Risk' },
  { tab: 'deepdive', to: '/?tab=deepdive', label: 'Risk Deep Dive', icon: 'help', badge: 'Why 82/100' },
  { tab: 'policy', to: '/?tab=policy', label: 'Policy Insights', icon: 'lightbulb', badge: '4 Insights' },
  { tab: 'alerts', to: '/?tab=alerts', label: 'National Alerts', icon: 'notifications_active', badge: '5 Alerts' },
  { tab: 'timeline', to: '/?tab=timeline', label: 'Timeline Adherence', icon: 'schedule' },
  { tab: 'compensation', to: '/?tab=compensation', label: 'Compensation & DBT', icon: 'payments' },
  { tab: 'rr', to: '/?tab=rr', label: 'R&R Monitoring', icon: 'home_work' },
  { tab: 'possession', to: '/?tab=possession', label: 'Possession Status', icon: 'agriculture', badge: 'Sec 38' },
  { tab: 'reports', to: '/?tab=reports', label: 'Reports & Analytics', icon: 'description' }
];

const DISTRICT_NAV_ITEMS = [
  { tab: 'overview', to: '/?tab=overview', label: 'Executive Overview', icon: 'dashboard' },
  { tab: 'risk', to: '/?tab=risk', label: 'Risk & Bottlenecks', icon: 'troubleshoot', badge: 'HIGH RISK' },
  { tab: 'projects', to: '/?tab=projects', label: 'District Projects', icon: 'folder_open' },
  { tab: 'gis', to: '/?tab=gis', label: 'GIS Cadastre Map', icon: 'map' },
  { tab: 'verification', to: '/?tab=verification', label: 'Land Verification', icon: 'fact_check', badge: '5-Pillars' },
  { tab: 'objections', to: '/?tab=objections', label: 'Objections & Hearings', icon: 'gavel', badge: 'Sec 15' },
  { tab: 'awards', to: '/?tab=awards', label: 'Statutory Awards', icon: 'military_tech', badge: 'Sec 23' },
  { tab: 'compensation', to: '/?tab=compensation', label: 'Compensation & DBT', icon: 'payments' },
  { tab: 'rr', to: '/?tab=rr', label: 'R&R Resettlement', icon: 'home_work' },
  { tab: 'possession', to: '/?tab=possession', label: 'Possession Approvals', icon: 'agriculture', badge: 'Sec 38' },
  { tab: 'activity', to: '/?tab=activity', label: 'Audit History Log', icon: 'history' }
];

const STANDARD_NAV_ITEMS = [
  { to: '/', label: 'Executive Dashboard', icon: 'dashboard' },
  { to: '/projects', label: 'Proposals & Lifecycle', icon: 'rule_folder' },
  { to: '/map', label: 'GIS Cadastre Map', icon: 'layers' },
  { to: '/compensation', label: 'Compensation & R&R', icon: 'account_balance' },
  { to: '/documents', label: 'Statutory Documents', icon: 'description' },
  { to: '/field-capture', label: 'Field Data Capture', icon: 'photo_camera', badge: null }
];

const FIELD_OFFICER_NAV_ITEMS = [
  { to: '/', label: 'Field Operations', icon: 'explore' },
  { to: '/field/parcels', label: 'Assigned Parcels', icon: 'checklist' },
  { to: '/field/map', label: 'Assigned GIS Map', icon: 'layers' },
  { to: '/field/issues', label: 'Issues & Discrepancies', icon: 'report_problem' },
  { to: '/field/possession', label: 'Possession Evidence', icon: 'real_estate_agent' },
  { to: '/documents', label: 'Statutory Documents', icon: 'description' },
  { to: '/field-capture', label: 'Quick GPS Capture', icon: 'photo_camera' }
];

const STATE_OFFICIAL_NAV_ITEMS = [
  { to: '/', label: 'State Executive Desk', icon: 'dashboard' },
  { to: '/state/projects', label: 'State Projects', icon: 'account_tree' },
  { to: '/state/approvals', label: 'Cabinet Clearances', icon: 'fact_check' },
  { to: '/state/districts', label: 'District Benchmarks', icon: 'analytics' },
  { to: '/state/map', label: 'Cadastral GIS Map', icon: 'layers' },
  { to: '/state/interventions', label: 'Crisis Interventions', icon: 'crisis_alert' },
  { to: '/state/compensation', label: 'DBT & Compensation', icon: 'account_balance' },
  { to: '/state/risks', label: 'Risk Matrix', icon: 'security' },
  { to: '/state/alerts', label: 'Statutory Alerts', icon: 'notifications_active' },
  { to: '/state/reports', label: 'Cabinet Reports', icon: 'summarize' }
];

const CITIZEN_NAV_ITEMS = [
  { to: '/citizen', label: 'My Land Parcels', icon: 'landscape' },
  { to: '/citizen/map', label: 'My Land on Map', icon: 'map' },
  { to: '/citizen/compensation', label: 'Compensation Tracker', icon: 'account_balance_wallet' },
  { to: '/citizen/rnr', label: 'R&R Assistance', icon: 'family_restroom' },
  { to: '/citizen/objections', label: 'Objections & Claims', icon: 'gavel' },
  { to: '/citizen/documents', label: 'Official Documents', icon: 'description' }
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isCitizen = user?.role === 'citizen';
  const isMinistry = user?.role === 'ministry_official';
  const isDistrict = user?.role === 'district_official';
  const isState = user?.role === 'state_official';
  const isField = user?.role === 'field_officer';
  const currentTab = searchParams.get('tab') || 'overview';

  // Determine nav items based on user role
  let navItems = STANDARD_NAV_ITEMS;
  if (isCitizen) navItems = CITIZEN_NAV_ITEMS;
  else if (isMinistry) navItems = MINISTRY_NAV_ITEMS;
  else if (isDistrict) navItems = DISTRICT_NAV_ITEMS;
  else if (isState) navItems = STATE_OFFICIAL_NAV_ITEMS;
  else if (isField) navItems = FIELD_OFFICER_NAV_ITEMS;

  // Context Badge Info
  const nodeContext = isCitizen
    ? { title: 'Landowner Portal', badge: 'CITIZEN' }
    : isMinistry
    ? { title: 'Central Ministry (MoRD)', badge: 'PM-GATISHAKTI' }
    : isDistrict
    ? { title: 'District CALA Bench', badge: user?.district?.toUpperCase() || 'RATNAGIRI' }
    : isState
    ? { title: `${user?.state || 'State'} Secretariat`, badge: 'STATE APEX' }
    : isField
    ? { title: 'Field Operations Unit', badge: 'SURVEYOR' }
    : { title: 'Central Repository', badge: 'v4.2.0 CORE' };

  // Footer Card Info
  const footerInfo = isCitizen
    ? {
        title: 'Landowner Verification',
        sub: 'Statutory RFCTLARR 2013 Landowner Portal',
        leftTag: 'Sec 15/23/38',
        rightTag: 'Verified Owner'
      }
    : isMinistry
    ? {
        title: 'Central Apex Cadastre',
        sub: 'Ministry of Rural Development & PM-GatiShakti, GoI',
        leftTag: 'RFCTLARR 2013',
        rightTag: 'National Oversight'
      }
    : isDistrict
    ? {
        title: 'Collector & CALA Office',
        sub: 'Revenue & Forest Dept, District Administration',
        leftTag: 'RFCTLARR 2013',
        rightTag: 'District CALA'
      }
    : isState
    ? {
        title: `${user?.state || 'State'} Revenue Dept`,
        sub: 'Mantralaya Apex Land Acquisition Secretariat',
        leftTag: 'RFCTLARR 2013',
        rightTag: 'State Apex'
      }
    : isField
    ? {
        title: 'Field Verification Cadre',
        sub: 'Ground Inspection & Survey Unit',
        leftTag: 'RFCTLARR 2013',
        rightTag: 'Field Officer'
      }
    : {
        title: 'NIC-CERT Verified',
        sub: 'Ministry of Rural Development & Land Resources, GoI',
        leftTag: 'RFCTLARR 2013',
        rightTag: 'SSL 256-bit'
      };

  const isItemActive = (item) => {
    if (isMinistry || isDistrict) {
      if (location.pathname === '/') {
        return item.tab === currentTab;
      }
      return false;
    }
    if (item.to === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside className="fixed left-0 top-[67px] bottom-0 w-64 bg-surface-container-low border-r border-govSlate-200/80 z-30 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Node context badge */}
        <div className="px-space-md py-3 border-b border-govSlate-200/50 shrink-0">
          <div className="bg-surface-container-high/60 rounded-lg px-space-sm py-2 flex items-center justify-between">
            <span className="font-semibold text-xs text-primary truncate mr-1">
              {nodeContext.title}
            </span>
            <span className="font-mono text-[9px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold shrink-0">
              {nodeContext.badge}
            </span>
          </div>
        </div>

        {/* Scrollable navigation links */}
        <nav className="flex-1 overflow-y-auto px-space-xs py-space-sm flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <button
                key={item.to || item.tab}
                onClick={() => navigate(item.to)}
                className={`flex items-center justify-between px-space-sm py-2 rounded-lg text-xs font-medium transition-all w-full text-left ${
                  active
                    ? 'bg-primary text-white shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-sm truncate">
                  <span className="material-symbols-outlined text-[19px] shrink-0">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ml-1 ${
                      active
                        ? 'bg-white/20 text-white'
                        : item.badge.toLowerCase().includes('risk') || item.badge.toLowerCase().includes('alert')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Statutory Sovereign Verification Footer Card */}
      <div className="p-space-sm shrink-0 border-t border-govSlate-200/50 bg-surface-container-low">
        <div className="bg-white rounded-xl p-3 border border-govSlate-200 shadow-xs flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-govEmerald text-[18px]">verified_user</span>
            <span className="font-bold text-[11px] text-primary uppercase tracking-wider truncate">
              {footerInfo.title}
            </span>
          </div>
          <p className="text-[11px] text-govSlate-600 leading-tight line-clamp-2">
            {footerInfo.sub}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-outline border-t border-govSlate-100 pt-1.5 mt-0.5">
            <span>{footerInfo.leftTag}</span>
            <span className="text-govEmerald font-semibold">{footerInfo.rightTag}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
