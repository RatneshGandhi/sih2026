import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const { user } = useAuthStore();

  const standardNavItems = [
    { to: '/', label: 'Executive Dashboard', icon: 'dashboard' },
    { to: '/projects', label: 'Proposals & Lifecycle', icon: 'rule_folder' },
    { to: '/map', label: 'GIS Cadastre Map', icon: 'layers' },
    { to: '/compensation', label: 'Compensation & R&R', icon: 'account_balance' },
    { to: '/documents', label: 'Statutory Documents', icon: 'description' },
    { to: '/field-capture', label: 'Field Data Capture', icon: 'photo_camera' }
  ];

  const fieldOfficerNavItems = [
    { to: '/', label: 'Field Operations', icon: 'explore' },
    { to: '/field/parcels', label: 'Assigned Parcels', icon: 'checklist' },
    { to: '/field/map', label: 'Assigned GIS Map', icon: 'layers' },
    { to: '/field/issues', label: 'Issues & Discrepancies', icon: 'report_problem' },
    { to: '/field/possession', label: 'Possession Evidence', icon: 'real_estate_agent' },
    { to: '/documents', label: 'Statutory Documents', icon: 'description' },
    { to: '/field-capture', label: 'Quick GPS Capture', icon: 'photo_camera' }
  ];

  const stateOfficialNavItems = [
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

  let navItems = standardNavItems;
  if (user?.role === 'field_officer') navItems = fieldOfficerNavItems;
  else if (user?.role === 'state_official') navItems = stateOfficialNavItems;

  return (
    <aside className="fixed left-0 top-[67px] bottom-0 w-64 bg-surface-container-low border-r border-govSlate-200/80 z-30 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col">
        {/* Node context badge */}
        <div className="px-space-md py-3 border-b border-govSlate-200/50">
          <div className="bg-surface-container-high/60 rounded-lg px-space-sm py-2 flex items-center justify-between">
            <span className="font-semibold text-xs text-primary">
              {user?.role === 'state_official' ? `${user?.state || 'State'} Secretariat` : 'Central Repository'}
            </span>
            <span className="font-mono text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold">
              {user?.role === 'state_official' ? 'STATE APEX' : 'v4.2.0 CORE'}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col px-space-xs py-space-sm gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-space-sm py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Statutory Sovereign Verification Footer Card */}
      <div className="p-space-sm">
        <div className="bg-white rounded-xl p-3 border border-govSlate-200 shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-govEmerald text-[18px]">verified_user</span>
            <span className="font-bold text-[11px] text-primary uppercase tracking-wider">NIC-CERT Verified</span>
          </div>
          <p className="text-[11px] text-govSlate-600 leading-tight">
            Ministry of Rural Development &amp; Land Resources, GoI
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-outline border-t border-govSlate-100 pt-1.5 mt-0.5">
            <span>RFCTLARR 2013</span>
            <span className="text-govEmerald font-semibold">SSL 256-bit</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
