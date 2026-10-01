import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import FilterBar from '../components/common/FilterBar';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import { formatDate } from '../utils/formatters';

export default function Documents() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [visibilityFilter, setVisibilityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    project: '',
    category: 'Specification',
    visibility: 'Internal',
    fileName: '',
    fileUrl: '',
    fileType: 'PDF',
    fileSizeMB: 2.5,
    tags: '',
  });

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const [dRes, pRes] = await Promise.all([
        api.getDocuments({
          visibility: visibilityFilter,
          category: categoryFilter,
          search,
        }),
        api.getProjects(),
      ]);

      if (dRes.success) setDocuments(dRes.data || []);
      if (pRes.success) setProjects(pRes.data || []);
    } catch {
      showToast('Error loading document repository', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [visibilityFilter, categoryFilter]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const ext = file.name.split('.').pop().toUpperCase();
      setUploadForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: ext || 'PDF',
        fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.project) {
      showToast('Please provide a title and select a project', 'warning');
      return;
    }
    if (!selectedFile) {
      showToast('Please choose a file to upload', 'warning');
      return;
    }

    let res;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadForm.title);
    formData.append('project', uploadForm.project);
    formData.append('category', uploadForm.category);
    formData.append('visibility', uploadForm.visibility);
    if (uploadForm.tags) formData.append('tags', uploadForm.tags);
    res = await api.uploadDocument(formData);

    if (res.success) {
      showToast('Document uploaded successfully', 'success');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        title: '',
        project: '',
        category: 'Specification',
        visibility: 'Internal',
        fileName: '',
        fileUrl: '',
        fileType: 'PDF',
        fileSizeMB: 2.5,
        tags: '',
      });
      loadDocuments();
    } else {
      showToast(res.message || 'Failed to upload document', 'danger');
    }
  };

  const handleDownload = async (row) => {
    const isLocalUpload = row.fileUrl && row.fileUrl.startsWith('/uploads/');
    if (!isLocalUpload && row.fileUrl && row.fileUrl.startsWith('http')) {
      window.open(row.fileUrl, '_blank', 'noreferrer');
      return;
    }

    const docId = row._id || row.documentId;
    setDownloadingId(docId);
    try {
      const res = await api.downloadDocument(docId, row.fileName || `${row.title || 'document'}.pdf`);
      if (!res.success) {
        showToast(res.message || 'Failed to download document', 'danger');
      }
    } catch {
      showToast('Error initiating document download', 'danger');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleVisibilityChange = async (docId, newVisibility) => {
    const res = await api.updateDocumentVisibility(docId, newVisibility);
    if (res.success) {
      showToast(`Document visibility updated to '${newVisibility}'`, 'success');
      loadDocuments();
    } else {
      showToast(res.message || 'Update failed', 'danger');
    }
  };

  const visibilityOptions = currentUser?.role === 'Client'
    ? [
        { value: 'All', label: 'All Accessible' },
        { value: 'Client Visible', label: 'Client Visible' },
        { value: 'Approved', label: 'Approved' },
      ]
    : [
        { value: 'All', label: 'All Documents' },
        { value: 'Internal', label: 'Internal Only' },
        { value: 'Client Visible', label: 'Client Visible' },
        { value: 'Vendor Visible', label: 'Vendor Visible' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Archived', label: 'Archived' },
      ];

  const canManageVisibility = ['Admin', 'Project Manager'].includes(currentUser?.role);

  return (
    <div className="documents-page" style={{ padding: '0 0.5rem' }}>
      <PageHeader
        title="Document Management & Specifications"
        subtitle="Centralized digital blueprint repository with enterprise role-based access control and client permissioning."
        breadcrumbs={[{ label: 'Workspace', href: '/dashboard' }, { label: 'Documents' }]}
        actions={
          currentUser?.role !== 'Client' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowUploadModal(true)}
            >
              + Upload Document
            </button>
          )
        }
      />

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <FilterBar options={visibilityOptions} activeValue={visibilityFilter} onChange={setVisibilityFilter} />
          <SearchBar value={search} onChange={setSearch} placeholder="Search documents, file names, or tags..." onClear={() => setSearch('')} />
        </div>

        <DataTable
          loading={loading}
          data={documents.filter((d) => {
            if (search) {
              const s = search.toLowerCase();
              return (
                d.title?.toLowerCase().includes(s) ||
                d.fileName?.toLowerCase().includes(s) ||
                d.documentId?.toLowerCase().includes(s) ||
                d.projectName?.toLowerCase().includes(s)
              );
            }
            return true;
          })}
          columns={[
            { key: 'documentId', header: 'Doc ID', sortable: true, width: '120px' },
            {
              key: 'title',
              header: 'Document Name',
              sortable: true,
              render: (val, row) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{row.fileName}</div>
                </div>
              ),
            },
            { key: 'projectName', header: 'Project', sortable: true },
            { key: 'category', header: 'Classification', sortable: true },
            {
              key: 'fileType',
              header: 'Type',
              render: (val) => (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', backgroundColor: 'var(--color-warm-beige)', borderRadius: '4px' }}>
                  {val}
                </span>
              ),
            },
            {
              key: 'visibility',
              header: 'Visibility Status',
              render: (val, row) => (
                canManageVisibility ? (
                  <select
                    className="form-control"
                    style={{ fontSize: '0.78rem', padding: '2px 6px', height: '28px', width: 'auto' }}
                    value={val}
                    onChange={(e) => handleVisibilityChange(row._id, e.target.value)}
                  >
                    <option value="Internal">Internal</option>
                    <option value="Client Visible">Client Visible</option>
                    <option value="Approved">Approved</option>
                    <option value="Archived">Archived</option>
                  </select>
                ) : (
                  <StatusBadge status={val} />
                )
              ),
            },
            {
              key: 'updatedAt',
              header: 'Last Modified',
              sortable: true,
              render: (val) => formatDate(val),
            },
            {
              key: 'actions',
              header: 'Access',
              render: (_, row) => (
                <button
                  type="button"
                  disabled={downloadingId === (row._id || row.documentId)}
                  onClick={() => handleDownload(row)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                >
                  {downloadingId === (row._id || row.documentId) ? 'Downloading...' : 'Download'}
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* MODAL: Upload Document */}
      <FormModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
        }}
        title="Upload Project Document"
        subtitle="Catalog architectural blueprints, structural engineering sheets, or compliance permits"
      >
        <form onSubmit={handleUpload}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Document Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Tower 1 Structural Framing Plan Level 18-24"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                className="form-control"
                value={uploadForm.project}
                onChange={(e) => setUploadForm({ ...uploadForm, project: e.target.value })}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id || p.projectId} value={p.projectId || p._id}>
                    {p.name} ({p.projectId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Classification *</label>
              <select
                className="form-control"
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              >
                <option value="Architectural Drawing">Architectural Drawing</option>
                <option value="Structural Calculation">Structural Calculation</option>
                <option value="Vendor Contract">Vendor Contract</option>
                <option value="Safety Permit">Safety Permit</option>
                <option value="Site Inspection">Site Inspection</option>
                <option value="Client Invoice">Client Invoice</option>
                <option value="Specification">Specification</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-warm-sand)' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Choose Local File to Upload</label>
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.png,.jpg,.jpeg,.webp"
              style={{ background: 'var(--color-white)' }}
            />
            {selectedFile && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '0.4rem' }}>
                ✓ Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {!selectedFile && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Or Document External URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://storage.buildora.com/docs/STR_LVL18.pdf"
                value={uploadForm.fileUrl}
                onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Client Visibility Setting *</label>
              <select
                className="form-control"
                value={uploadForm.visibility}
                onChange={(e) => setUploadForm({ ...uploadForm, visibility: e.target.value })}
              >
                <option value="Internal">Internal (Strictly Buildora Staff)</option>
                <option value="Client Visible">Client Visible (Exposed to Client Portal)</option>
                <option value="Vendor Visible">Vendor Visible (Exposed to Vendor Portal)</option>
                <option value="Approved">Approved (Executive Sign-off)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comma-separated Tags</label>
              <input
                type="text"
                className="form-control"
                placeholder="tower1, structural, rebar"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Upload to Repository
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
