import React from 'react';
import { DISTRICT_ALERTS } from '../../data/districtData';

export default function DistrictAlerts({ onSelectAlert, alerts = DISTRICT_ALERTS }) {
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-300 bg-red-50/40',
          dot: 'bg-error',
          badge: 'bg-red-100 text-error border-red-200',
          badgeText: 'CRITICAL STATUTORY',
          btnPrimary: 'bg-error hover:bg-red-700 text-white',
          btnSecondary: 'border-red-300 text-error hover:bg-red-50'
        };
      case 'high':
        return {
          border: 'border-orange-300 bg-orange-50/30',
          dot: 'bg-orange-600',
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          badgeText: 'HIGH PRIORITY',
          btnPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
          btnSecondary: 'border-orange-300 text-orange-800 hover:bg-orange-50'
        };
      case 'warning':
      default:
        return {
          border: 'border-amber-300 bg-amber-50/30',
          dot: 'bg-govAmber',
          badge: 'bg-amber-100 text-amber-900 border-amber-200',
          badgeText: 'ACTION REQUIRED',
          btnPrimary: 'bg-amber-700 hover:bg-amber-800 text-white',
          btnSecondary: 'border-amber-300 text-amber-900 hover:bg-amber-50'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-govSlate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-govSlate-100">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[22px] text-govAmber">notifications_active</span>
          <div>
            <h2 className="font-bold text-base text-primary">District Statutory Alerts &amp; Urgent Actions</h2>
            <p className="text-xs text-govSlate-500">
              Active bottlenecks requiring District Magistrate scrutiny, Section 15 bench hearings, or escrow clearance.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-error bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
          {alerts.length} Active Alerts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alerts.map((alert) => {
          const style = getSeverityStyle(alert.severity);
          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border ${style.border} flex flex-col justify-between transition-all hover:shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${style.badge}`}>
                    {style.badgeText}
                  </span>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: style.dot }}></span>
                </div>
                <h4 className="font-bold text-xs text-govSlate-900 leading-snug">
                  {alert.title}
                </h4>
                <p className="text-[11px] text-govSlate-600 mt-1 leading-relaxed">
                  {alert.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-govSlate-200/60">
                <button
                  onClick={() => onSelectAlert && onSelectAlert(alert.targetTab, 'view', alert)}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold border ${style.btnSecondary} transition-colors text-center`}
                >
                  {alert.viewText || 'View Cases'}
                </button>
                <button
                  onClick={() => onSelectAlert && onSelectAlert(alert.targetTab, 'action', alert)}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold ${style.btnPrimary} transition-colors text-center flex items-center justify-center gap-1 shadow-xs`}
                >
                  <span>{alert.actionText || 'Take Action'}</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
