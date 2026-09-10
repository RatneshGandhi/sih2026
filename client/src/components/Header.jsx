import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useNavigate } from 'react-router-dom';

const DEMO_ROLES = [
  { key: 'citizen', label: 'Citizen / Landowner', icon: 'person', path: '/citizen', color: 'text-govSlate-700' },
  { key: 'field_officer', label: 'Field Survey Officer', icon: 'straighten', path: '/field', color: 'text-govEmerald' },
  { key: 'district_official', label: 'District Magistrate / CALA', icon: 'gavel', path: '/district', color: 'text-indigo-600' },
  { key: 'state_official', label: 'State Revenue Dept', icon: 'corporate_fare', path: '/state', color: 'text-purple-600' },
  { key: 'ministry_official', label: 'Central Ministry (MoRD)', icon: 'account_balance', path: '/ministry', color: 'text-amber-600' }
];

export default function Header() {
  const { user, logout, quickLogin } = useAuthStore();
  const { unreadCount, setNotificationsDrawerOpen, reseedDatabase } = useUIStore();
  const [reseedLoading, setReseedLoading] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const roleMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchRole = async (roleKey, path) => {
    setSwitchingRole(true);
    try {
      await quickLogin(roleKey);
      setIsRoleMenuOpen(false);
      navigate(path);
    } catch (err) {
      console.error('Failed to switch demo persona:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleReseed = async () => {
    if (window.confirm('Reset NLAMS database to initial seeded state for the demo?')) {
      setReseedLoading(true);
      await reseedDatabase();
      setReseedLoading(false);
      window.location.reload();
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'citizen':
        return { bg: 'bg-slate-100 text-slate-700', label: 'Citizen / Landowner' };
      case 'field_officer':
        return { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Field Surveyor' };
      case 'district_official':
        return { bg: 'bg-indigo-50 text-indigo-700 border border-indigo-200', label: 'District Magistrate / CALA' };
      case 'state_official':
        return { bg: 'bg-purple-50 text-purple-700 border border-purple-200', label: 'State Revenue Dept' };
      case 'ministry_official':
        return { bg: 'bg-amber-50 text-amber-800 border border-amber-200', label: 'Central Ministry (MoRD)' };
      default:
        return { bg: 'bg-slate-100 text-slate-700', label: role };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-govSlate-200/60">
      {/* Sovereign Tri-Color Hairline Accent Strip */}
      <div className="tricolor-strip h-[3px] w-full"></div>

      <div className="h-16 px-space-md lg:px-space-lg flex items-center justify-between gap-space-md">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[24px] text-govEmerald">assured_workload</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-primary tracking-tight font-sans">NLAMS</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                GOI CORE
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium hidden sm:inline leading-none">
              National Land Acquisition &amp; Management System
            </span>
          </div>
        </div>

        {/* Center: Live Telemetry & Quick Search */}
        <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
          <div className="w-full flex items-center gap-space-xs px-space-sm py-2 bg-surface-container-low rounded-lg border border-govSlate-200/60 shadow-inner">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by Project Code, Survey No, Khasra, Gazette..."
              className="w-full bg-transparent font-sans text-xs text-on-surface placeholder:text-outline outline-none"
            />
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-outline bg-white border border-govSlate-200 rounded">
              ⌘K
            </kbd>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-space-sm py-1.5 bg-surface-container rounded-lg text-on-surface whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-[11px] font-semibold text-primary">CADASTRE: LIVE</span>
          </div>
        </div>

        {/* Right Suite: Jury Demo Reseed + Notifications + User Chip */}
        <div className="flex items-center gap-space-xs sm:gap-space-sm">
          {/* 1-Click Demo Persona Switcher */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              disabled={switchingRole}
              title="Switch stakeholder persona for demo"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-container text-xs font-semibold shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-govEmerald">
                swap_horiz
              </span>
              <span className="hidden md:inline">Switch Role</span>
              <span className="material-symbols-outlined text-[14px]">
                {isRoleMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-govSlate-200 py-1.5 z-50 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-govSlate-100 text-[10px] font-mono uppercase tracking-wider font-bold text-govSlate-400">
                  Switch Stakeholder Persona
                </div>
                {DEMO_ROLES.map((role) => {
                  const isCurrent = user?.role === role.key;
                  return (
                    <button
                      key={role.key}
                      onClick={() => handleSwitchRole(role.key, role.path)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs transition-colors ${
                        isCurrent
                          ? 'bg-govSlate-100 font-bold text-primary'
                          : 'hover:bg-govSlate-50 text-govSlate-700'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${role.color}`}>
                        {role.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-xs leading-tight">{role.label}</div>
                      </div>
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-govEmerald"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Jury Demo Reset Button */}
          <button
            onClick={handleReseed}
            disabled={reseedLoading}
            title="Reset DB to clean initial demo data instantly"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-govSlate-200 text-xs font-medium transition-all shadow-xs"
          >
            <span className={`material-symbols-outlined text-[16px] text-govAmber ${reseedLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span className="hidden lg:inline">Reset Demo</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setNotificationsDrawerOpen(true)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors relative"
            title="Notifications & Statutory Notices"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-error text-white rounded-full flex items-center justify-center font-mono font-bold text-[10px] px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Chip */}
          <div className="flex items-center gap-space-xs pl-space-xs border-l border-govSlate-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-on-surface leading-tight truncate max-w-[180px]">
                {user?.name || 'Authenticated Officer'}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full mt-0.5 inline-block ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs font-semibold text-xs">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors ml-1"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
