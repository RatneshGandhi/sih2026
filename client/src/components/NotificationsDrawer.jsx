import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';

export default function NotificationsDrawer() {
  const { notificationsDrawerOpen, setNotificationsDrawerOpen, notifications, unreadCount, markAsRead, markAllAsRead } = useUIStore();
  const [filter, setFilter] = useState('all');

  if (!notificationsDrawerOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'approval_needed') return n.type === 'approval_needed';
    if (filter === 'delay') return n.type === 'delay';
    if (filter === 'update') return n.type === 'update';
    return true;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'approval_needed':
        return {
          bg: 'bg-primary-container text-on-primary',
          icon: 'pending_actions',
          label: 'Statutory Approval'
        };
      case 'delay':
        return {
          bg: 'bg-error-container text-on-error-container',
          icon: 'warning',
          label: 'Statutory Delay / SLA'
        };
      default:
        return {
          bg: 'bg-secondary-container text-on-secondary-container',
          icon: 'notifications_active',
          label: 'Official Ledger Update'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-govSlate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={() => setNotificationsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-govSlate-200 flex flex-col">
          {/* Top Header */}
          <div className="p-space-md border-b border-govSlate-200 bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
              <div>
                <h2 className="font-semibold text-primary text-base">Statutory Alerts & Audit Notices</h2>
                <p className="text-xs text-on-surface-variant font-mono">{unreadCount} unread notices</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Filter Pills & Actions */}
          <div className="p-space-sm border-b border-govSlate-100 flex items-center justify-between gap-2 flex-wrap bg-surface">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('approval_needed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filter === 'approval_needed' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                Approvals
              </button>
              <button
                onClick={() => setFilter('delay')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filter === 'delay' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                Delays
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-secondary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-space-sm divide-y divide-govSlate-100">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">notifications_off</span>
                <p className="text-sm">No statutory notices matching filter.</p>
              </div>
            ) : (
              filtered.map((n) => {
                const badge = getTypeBadge(n.type);
                return (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-colors rounded-lg mb-1.5 ${n.is_read ? 'bg-surface/60 opacity-80' : 'bg-white border border-govSlate-200/80 shadow-xs'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${badge.bg}`}>
                        <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono text-outline whitespace-nowrap">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-govSlate-900 mt-1.5 leading-snug">
                      {n.title}
                    </h4>
                    <p className="text-xs text-govSlate-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    {n.project_name && (
                      <div className="mt-2 text-[11px] font-mono text-primary flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded">
                        <span className="material-symbols-outlined text-[12px]">folder</span>
                        <span className="truncate">{n.project_name}</span>
                      </div>
                    )}

                    {!n.is_read && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-[11px] font-medium text-govEmerald hover:underline flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">done</span>
                          Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-space-sm border-t border-govSlate-200 bg-surface-container-lowest text-center">
            <span className="text-[11px] text-on-surface-variant font-mono">
              National Informatics Centre (NIC) Statutory Dispatcher
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
