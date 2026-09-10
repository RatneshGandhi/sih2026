import React, { useEffect, useState } from 'react';
import api from '../../api/client';
export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/citizen/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to load citizen documents:', err);
      setError(err.response?.data?.error || 'Failed to retrieve statutory documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-govSlate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[26px]">verified</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-govSlate-900 font-sans tracking-tight">
                Official Gazette &amp; Statutory Documents
              </h1>
            </div>
            <p className="text-xs text-govSlate-500 mt-1">
              Public statutory dockets, Section 11 preliminary notifications, SIA reports, and award declarations published for your land.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold bg-surface-container-low text-primary px-3.5 py-2 rounded-xl border border-govSlate-200">
            <span className="material-symbols-outlined text-govEmerald text-[18px]">lock</span>
            <span>Digitally Authenticated Vault</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-govSlate-200 p-5 animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl">error</span>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && documents.length === 0 && (
          <div className="bg-white rounded-2xl border border-govSlate-200 p-12 text-center text-govSlate-600 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-5xl text-govSlate-400">folder_off</span>
            <h3 className="text-base font-bold text-govSlate-900">No Gazette Documents Published</h3>
            <p className="text-xs text-govSlate-500 max-w-md">
              No statutory notices or award dockets have been released for public citizen inspection for your projects yet.
            </p>
          </div>
        )}

        {/* Documents Grid */}
        {!loading && !error && documents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-govSlate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-govSlate-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-surface-container text-primary">
                        v{doc.version}.0
                      </span>
                      {doc.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-govEmerald bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          Certified Official
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-govSlate-900 mt-1 leading-snug break-words">
                      {doc.file_name}
                    </h3>

                    <span className="text-xs text-govSlate-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">folder</span>
                      <span className="truncate">{doc.project_name}</span>
                    </span>
                  </div>
                </div>

                {/* Metadata & Verification Footer */}
                <div className="pt-3 border-t border-govSlate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-govSlate-500 font-mono text-[11px]">
                    <span>Size: {formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>Date: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                  </div>

                  <a
                    href={doc.file_path || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Docket
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
