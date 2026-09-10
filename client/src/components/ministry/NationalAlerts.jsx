import React from 'react';
import { NATIONAL_ALERTS } from '../../data/ministryData';

export default function NationalAlerts({ onSelectAlert }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[26px]">notifications_active</span>
            <h2 className="font-extrabold text-lg sm:text-xl text-primary">
              National Alerts &amp; Statutory Attention Feed
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-mono text-[10px] font-bold border border-red-300">
              5 ACTIVE ALERTS
            </span>
          </div>
          <p className="text-xs text-govSlate-600 mt-1">
            Real-time notifications signaling statutory deadlines, escrow disbursement freezes, and jurisdictional litigation spikes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs bg-govSlate-50 px-3 py-1.5 rounded-lg border border-govSlate-200 text-govSlate-600">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span>Central Alert Telemetry: Live</span>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="flex flex-col gap-3">
        {NATIONAL_ALERTS.map((alert) => {
          const isCritical = alert.severity === 'critical';
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md ${
                isCritical
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCritical
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-amber-500 text-white shadow-xs'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {alert.icon || 'warning'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        isCritical
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.badge}
                    </span>
                    <span className="font-mono text-[11px] text-govSlate-400">
                      {alert.id}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-govSlate-900 mt-1">
                    {alert.text}
                  </h3>
                  <p className="text-xs text-govSlate-600 mt-0.5">
                    {alert.subtext}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectAlert && onSelectAlert(alert.targetTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto ${
                  isCritical
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                }`}
              >
                <span>{alert.actionLabel}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
