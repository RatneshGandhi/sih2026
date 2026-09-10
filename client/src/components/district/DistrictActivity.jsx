import React from 'react';
import { DISTRICT_AUDIT_LOGS } from '../../data/districtData';

export default function DistrictActivity({ logs = DISTRICT_AUDIT_LOGS }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-govSlate-200/90 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-govSlate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-primary">history</span>
          <div>
            <h2 className="font-bold text-base text-primary">Recent Activity &amp; CALA Statutory Audit History</h2>
            <p className="text-xs text-govSlate-500">
              Immutable chronological trail of administrative hearings, award declarations, and surveyor uploads.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-semibold text-govSlate-500 bg-govSlate-100 px-2 py-0.5 rounded">
          Live Sovereign Audit Trail
        </span>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-xl border border-govSlate-200 bg-govSlate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-govSlate-900">{log.action}</span>
                  <span className="font-mono text-[10px] font-bold text-primary bg-white border border-govSlate-200 px-1.5 py-0.2 rounded">
                    {log.parcel}
                  </span>
                  <span className="text-[10px] text-govSlate-500">({log.project})</span>
                </div>
                <p className="text-govSlate-600 mt-0.5 text-[11px] leading-snug">{log.details}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-govSlate-500">
                  <span>Role: <strong className="text-govSlate-800">{log.role}</strong></span>
                  <span>•</span>
                  <span>Mandate: <strong className="text-primary">{log.statutoryRef}</strong></span>
                </div>
              </div>
            </div>

            <span className="font-mono text-[11px] font-semibold text-govSlate-500 self-end sm:self-center whitespace-nowrap bg-white px-2 py-1 rounded border border-govSlate-200">
              {log.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
