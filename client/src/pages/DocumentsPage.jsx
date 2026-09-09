import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [version, setVersion] = useState(1);
  const [uploading, setUploading] = useState(false);

  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  const isOfficial = ['district_official', 'state_official', 'ministry_official'].includes(user?.role);

  useEffect(() => {
    loadDocuments();
    loadProjects();
  }, [projectFilter]);

  async function loadDocuments() {
    try {
      setLoading(true);
      const params = {};
      if (projectFilter) params.project_id = projectFilter;

      const res = await api.get('/documents', { params });
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      showToast('Failed to load documents repository.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);
      if (res.data.projects?.length > 0) {
        setSelectedProjectId(res.data.projects[0].id);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }

  const handleToggleVerify = async (docId) => {
    if (!isOfficial) {
      showToast('Only authorized statutory officials can certify documents.', 'error');
      return;
    }

    try {
      const res = await api.patch(`/documents/${docId}/verify`);
      showToast(res.data.message, 'success');
      loadDocuments();
    } catch (err) {
      console.error('Failed to toggle verification:', err);
      showToast('Failed to verify document.', 'error');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedProjectId) {
      showToast('Please select a project and document file.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('project_id', selectedProjectId);
      formData.append('version', version);
      formData.append('file', uploadFile);

      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Document uploaded and recorded in NIC vault!', 'success');
      setUploadModalOpen(false);
      setUploadFile(null);
      loadDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.response?.data?.error || 'Failed to upload document.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        d.file_name.toLowerCase().includes(term) ||
        d.project_name?.toLowerCase().includes(term) ||
        d.uploader_name?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="p-space-md lg:p-space-lg flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div>
          <h1 className="text-xl font-extrabold text-primary tracking-tight font-sans">
            Secure Document Repository &amp; Audit Vault
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Cryptographically sealed Gazette Preliminary Notifications, SIA Reports, and Section 38 Vesting Deeds.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="h-9 px-space-md bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          <span>+ Upload Document</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-space-md shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search documents by name or agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface placeholder:text-outline outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-surface-container-low border border-govSlate-200 rounded-lg text-xs text-on-surface outline-none cursor-pointer"
        >
          <option value="">All Corridors &amp; Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-xl border border-govSlate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant font-mono text-[10px] uppercase border-b border-govSlate-200">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Associated Project</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Vaulted On</th>
                <th className="py-3 px-4">NIC Digital Seal</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="font-mono text-xs">Scanning document vault...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-on-surface-variant">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">
                            {doc.file_name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                          </span>
                        </div>
                        <div>
                          <a
                            href={doc.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-primary hover:underline"
                          >
                            {doc.file_name}
                          </a>
                          <span className="text-[10px] text-outline block font-mono">
                            {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-govSlate-800 font-medium">
                      {doc.project_name}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-primary text-[10px]">
                        v{doc.version}.0
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-govSlate-800">{doc.uploader_name || 'Officer'}</div>
                      <div className="text-[10px] text-outline capitalize">{doc.uploader_role?.replace('_', ' ')}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-outline whitespace-nowrap">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {doc.verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          NIC-CERT Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                          Pending Verification
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={doc.file_path}
                          download
                          className="p-1 rounded hover:bg-surface-container text-primary"
                          title="Download Docket"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                        </a>

                        {isOfficial && (
                          <button
                            onClick={() => handleToggleVerify(doc.id)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                              doc.verified
                                ? 'bg-govSlate-100 text-govSlate-700 hover:bg-govSlate-200'
                                : 'bg-secondary hover:bg-govEmeraldDark text-white'
                            }`}
                          >
                            {doc.verified ? 'Revoke Seal' : 'Verify & Seal'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Upload New Document */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-govSlate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-govSlate-200 w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-govSlate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                </div>
                <h3 className="font-bold text-sm text-primary">Vault New Statutory Document</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded text-outline"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpload} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Associate Infrastructure Project *
                </label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Select Document File *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-govSlate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-container file:text-primary hover:file:bg-surface-container-high cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-govSlate-700 uppercase font-mono text-[11px] mb-1">
                  Version Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-govSlate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-govSlate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {uploading ? 'Vaulting to Disk...' : 'Upload to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
