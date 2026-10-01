import React, { useState, useEffect } from 'react';
import { api, getAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

export default function ClientPortal() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'milestones' | 'photos' | 'documents'

  useEffect(() => {
    async function loadClientProjects() {
      setLoading(true);
      try {
        const res = await api.getClientProjects();
        if (res.success && res.data?.length > 0) {
          setProjects(res.data);
          setSelectedProjectId(res.data[0]._id || res.data[0].projectId);
        }
      } catch {
        showToast('Error loading client projects', 'danger');
      } finally {
        setLoading(false);
      }
    }
    loadClientProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    async function loadDetails() {
      setDetailsLoading(true);
      try {
        const res = await api.getClientProjectDetails(selectedProjectId);
        if (res.success) {
          setProjectData(res.data);
        }
      } catch {
        showToast('Error loading project details', 'danger');
      } finally {
        setDetailsLoading(false);
      }
    }
    loadDetails();
  }, [selectedProjectId]);

  const handleDownloadDoc = async (doc) => {
    if (doc.fileUrl && !doc.fileUrl.startsWith('/uploads/')) {
      window.open(doc.fileUrl, '_blank', 'noreferrer');
      return;
    }
    const docId = doc._id || doc.documentId;
    setDownloadingDocId(docId);
    try {
      const res = await api.downloadDocument(docId, doc.fileName || `${doc.title}.pdf`);
      if (!res.success) {
        showToast(res.message || 'Download failed', 'danger');
      }
    } catch {
      showToast('Error downloading file', 'danger');
    } finally {
      setDownloadingDocId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading client portal workspace..." type="spinner" />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No Client Projects Assigned"
        message="Your account is not currently linked to any active client developments. Please contact your Buildora project director."
      />
    );
  }

  const p = projectData?.project || {};
  const milestones = projectData?.milestones || [];
  const approvedPhotos = projectData?.approvedPhotos || [];
  const clientDocs = projectData?.documents || [];

  return (
    <div className="client-portal-page" style={{ padding: '0 0.5rem' }}>
      <PageHeader
        title={`Client Portal — ${p.name || 'Executive View'}`}
        subtitle={`Welcome, ${currentUser?.name}. Real-time project telemetry, milestone progress, and approved site documentation.`}
        breadcrumbs={[{ label: 'Client Workspace' }, { label: p.name || 'Project' }]}
        actions={
          projects.length > 1 && (
            <select
              className="form-control"
              style={{ width: '240px', fontWeight: 600 }}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((proj) => (
                <option key={proj._id || proj.projectId} value={proj._id || proj.projectId}>
                  {proj.name} ({proj.projectId})
                </option>
              ))}
            </select>
          )
        }
      />

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard
          title="Overall Construction Progress"
          value={`${p.progress || 0}%`}
          subtitle={`Status: ${p.status || 'Active'}`}
          trend={`${milestones.filter((m) => m.status === 'Completed').length} / ${milestones.length} milestones met`}
          trendType="positive"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
        />
        <StatCard
          title="Target Handover Deadline"
          value={formatDate(p.deadline)}
          subtitle={`Started on ${formatDate(p.startDate)}`}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          title="Approved Site Media"
          value={approvedPhotos.length}
          subtitle="Verified supervisor photos"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>}
        />
        <StatCard
          title="Active Workforce On Site"
          value={`${p.workersOnSite || 0} Craftsmen`}
          subtitle="Daily site deployment"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'overview', label: 'Executive Overview' },
          { id: 'milestones', label: `Milestones (${milestones.length})` },
          { id: 'photos', label: `Site Photos (${approvedPhotos.length})` },
          { id: 'documents', label: `Documents (${clientDocs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem' }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {detailsLoading ? (
        <LoadingState message="Updating project records..." />
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: 'var(--color-text-dark)' }}>
                  Project Overview & Scope
                </h3>
                <p style={{ color: 'var(--color-text-body)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                  {p.description || 'Premium residential and commercial development constructed under ISO 9001 quality specifications.'}
                </p>

                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontWeight: 600 }}>
                    <span>Construction Progress</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-warm-sand)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.progress || 0}%`, height: '100%', backgroundColor: 'var(--color-primary-brown)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Location</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{p.location}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Client Organization</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{p.client}</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: 'var(--color-text-dark)' }}>
                  Site Showcase
                </h3>
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {milestones.map((m, index) => (
                  <div
                    key={m._id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: m.status === 'Completed' ? 'var(--color-success-bg)' : 'var(--color-white)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: m.status === 'Completed' ? 'var(--color-success)' : 'var(--color-warm-beige)',
                          color: m.status === 'Completed' ? 'white' : 'var(--color-primary-brown)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {m.status === 'Completed' ? '✓' : index + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-dark)', fontSize: '0.95rem' }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          Target Date: {formatDate(m.dueDate)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: APPROVED PHOTOS */}
          {activeTab === 'photos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {approvedPhotos.length === 0 ? (
                <EmptyState
                  title="No Site Photos Available Yet"
                  message="Uploaded supervisor photos will appear here once reviewed and signed off by the project director."
                />
              ) : (
                approvedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="card"
                    style={{
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-white)',
                    }}
                  >
                    <img
                      src={
                        photo.url?.startsWith('/uploads/') && photo.reportId
                          ? `/api/site-reports/${photo.reportId}/photos/${photo.id}/download?token=${getAuthToken()}`
                          : photo.url
                      }
                      alt={photo.caption || 'Site Photo'}
                      style={{ width: '100%', height: '190px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-dark)', fontSize: '0.9rem' }}>
                        {photo.caption || 'Site Progress Documentation'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                        Approved for Client View • {photo.date}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: CLIENT DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
              {clientDocs.length === 0 ? (
                <EmptyState
                  title="No Client Documents"
                  message="Signed architectural drawings and client milestone packages will be displayed here."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {clientDocs.map((doc) => (
                    <div
                      key={doc.documentId || doc._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {doc.fileName} • {doc.category}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={downloadingDocId === (doc._id || doc.documentId)}
                        onClick={() => handleDownloadDoc(doc)}
                        className="btn btn-outline btn-sm"
                      >
                        {downloadingDocId === (doc._id || doc.documentId) ? 'Downloading...' : 'Download PDF'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
