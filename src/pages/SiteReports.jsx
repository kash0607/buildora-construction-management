import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import QuickReportModal from '../components/modals/QuickReportModal';
import StatusBadge from '../components/common/StatusBadge';

export default function SiteReports() {
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadReports = async () => {
    try {
      const res = await api.getRecentSiteReports();
      if (res.success) {
        setReports(res.data);
      }
    } catch {
      showToast('Error loading site reports', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Daily Site Progress Logs...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="projects-header">
        <div className="projects-header-text">
          <h1>Daily Site Reports</h1>
          <p>Supervisors daily field logs, weather telemetry, worker attendance, and completed works.</p>
        </div>
        <div>
          <button className="btn btn-accent" onClick={() => setIsCreateOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="12" y2="18"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
            Submit Daily Log
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '1fr 380px' : '1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Field Submissions</div>
              <div className="card-subtitle">Verified logs recorded across all operational construction sites</div>
            </div>
            <span className="badge badge-neutral">{reports.length} Logs</span>
          </div>
          <div className="card-body">
            <div className="site-activity-feed">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="site-feed-item"
                  style={{
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    background: selectedReport?.id === rep.id ? 'var(--color-warm-beige)' : 'transparent',
                    transition: 'background var(--transition-fast)'
                  }}
                  onClick={() => setSelectedReport(rep)}
                >
                  <div className="site-feed-avatar">
                    {rep.supervisor.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="site-feed-body">
                    <div className="site-feed-header">
                      <span className="site-feed-author">{rep.supervisor}</span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={rep.status} />
                        <span className="site-feed-time">{rep.date}</span>
                      </div>
                    </div>
                    <div className="site-feed-project">
                      <strong>{rep.project}</strong> • 👷 {rep.workersPresent} Workers • ☀️ {rep.weather} • 📈 {rep.progressToday}
                    </div>
                    <p className="site-feed-text" style={{ marginTop: '0.4rem' }}>{rep.workCompleted}</p>
                    {rep.issues && rep.issues !== 'None reported.' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.3rem' }}>
                        ⚠️ Field Note: {rep.issues}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Report Detail Sidebar */}
        {selectedReport && (
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-header">
              <div>
                <div className="card-title">{selectedReport.id}</div>
                <div className="card-subtitle">{selectedReport.project}</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedReport(null)}
              >
                ✕
              </button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Date & Supervisor</span>
                <div className="font-bold text-dark">{selectedReport.date}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Submitted by {selectedReport.supervisor}</div>
              </div>

              <div className="flex justify-between" style={{ padding: '0.5rem', background: 'var(--color-warm-sand)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Attendance</div>
                  <div className="font-bold text-dark">{selectedReport.workersPresent} Workers</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Weather</div>
                  <div className="font-bold text-dark">{selectedReport.weather}</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Progress</div>
                  <div className="font-bold text-accent">{selectedReport.progressToday}</div>
                </div>
              </div>

              <div>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Works Executed</span>
                <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{selectedReport.workCompleted}</p>
              </div>

              <div>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Observations / Issues</span>
                <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{selectedReport.issues}</p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ width: '100%' }}
                onClick={() => showToast('Field log verified & approved by PM', 'success')}
              >
                ✓ Verify & Sign-off Log
              </button>
            </div>
          </div>
        )}
      </div>

      <QuickReportModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onReportSubmitted={() => loadReports()}
      />
    </>
  );
}
