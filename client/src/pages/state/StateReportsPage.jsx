import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const REPORT_OPTIONS = [
  {
    id: 'monthly_progress',
    title: 'Monthly Acquisition Progress Report',
    description: 'Summary of proposed vs acquired land, stage lifecycle, and project status across all districts.',
    icon: 'calendar_month'
  },
  {
    id: 'milestone_compliance',
    title: 'RFCTLARR 2013 Milestone Compliance Audit',
    description: 'Detailed section-wise audit (Sec 4 SIA, Sec 11, Sec 19, Sec 23, Sec 38) with delay status.',
    icon: 'fact_check'
  },
  {
    id: 'district_audit',
    title: 'District Collectorate Performance Audit',
    description: 'Decision-support composite scoring, land completion, dispute ratios, and collector rankings.',
    icon: 'analytics'
  },
  {
    id: 'financial_disbursement',
    title: 'Financial DBT & Compensation Statement',
    description: 'Statutory valuation, DBT bank disbursement rates, pending treasury escrow, and R&R figures.',
    icon: 'account_balance'
  }
];

export default function StateReportsPage() {
  const { user } = useAuthStore();
  const [selectedReport, setSelectedReport] = useState('monthly_progress');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const loadReport = async (reportType) => {
    try {
      setLoading(true);
      const res = await api.get(`/state/reports/${reportType}`);
      setReportData(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load report:', err);
      setError('Could not compile report data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(selectedReport);
  }, [selectedReport]);

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/state/reports/${selectedReport}?format=csv`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}_${user?.state || 'Maharashtra'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download CSV:', err);
      alert('Could not download CSV report.');
    } finally {
      setDownloading(false);
    }
  };

  const currentOption = REPORT_OPTIONS.find(r => r.id === selectedReport);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Cabinet Secretariat Dossiers
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-semibold">{user?.state || 'Maharashtra'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Statutory Compliance &amp; Executive Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export official reports for State Cabinet sessions, Legislative Assembly queries, and Ministry submissions.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          disabled={downloading || loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all self-start md:self-auto"
        >
          <span className={`material-symbols-outlined text-[18px] ${downloading ? 'animate-spin' : ''}`}>
            {downloading ? 'downloading' : 'download'}
          </span>
          <span>{downloading ? 'Generating CSV...' : 'Export CSV Dataset'}</span>
        </button>
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_OPTIONS.map(opt => {
          const isSelected = selectedReport === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedReport(opt.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-50/50 border-purple-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-purple-700' : 'text-slate-400'}`}>
                    {opt.icon}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {opt.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {opt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Preview Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{currentOption?.title}</h3>
            <p className="text-xs text-slate-500">
              State: <strong>{reportData?.state || user?.state || 'Maharashtra'}</strong> | Generated: {new Date(reportData?.generated_at || Date.now()).toLocaleString('en-IN')}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {reportData?.records?.length || 0} Records Found
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs text-slate-500">Querying database for report compilation...</span>
          </div>
        ) : error ? (
          <div className="p-5 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-xs">
            {error}
          </div>
        ) : !reportData?.records || reportData.records.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No records returned for this report query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  {Object.keys(reportData.records[0]).map(key => (
                    <th key={key} className="py-2.5 px-3 uppercase tracking-wider text-[10px]">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.records.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    {Object.values(row).map((val, colIdx) => (
                      <td key={colIdx} className="py-2.5 px-3 text-slate-800 font-medium">
                        {val === null || val === undefined ? '—' : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
