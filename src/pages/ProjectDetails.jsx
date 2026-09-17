import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import EditProjectModal from '../components/modals/EditProjectModal';

export default function ProjectDetails() {
  const { id } = useParams();
  const projectId = id || 'PRJ-101';
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [issues, setIssues] = useState([]);
  const [siteReports, setSiteReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadProjectData = async () => {
    try {
      const [pRes, tRes, iRes, rRes, mRes] = await Promise.all([
        api.getProject(projectId),
        api.getTasks(projectId),
        api.getIssues(projectId),
        api.getRecentSiteReports(),
        api.getMilestones(projectId)
      ]);

      if (pRes.success) {
        setProject(pRes.data);
      } else {
        showToast(pRes.message || 'Project not found', 'danger');
      }

      if (tRes.success) setTasks(tRes.data);
      if (mRes.success) setMilestones(mRes.data);
      if (iRes.success) setIssues(iRes.data);
      if (rRes.success) {
        setSiteReports(rRes.data.filter((r) => r.project.includes(pRes?.data?.name || '')));
      }
    } catch {
      showToast('Error loading project workspace', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();

    const handleDataChange = () => loadProjectData();
    window.addEventListener('buildora-data-changed', handleDataChange);
    return () => window.removeEventListener('buildora-data-changed', handleDataChange);
  }, [projectId]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Project Workspace...</h3>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Project Not Found</h2>
        <p className="text-muted">The requested project ID does not exist or has been archived.</p>
        <Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const budgetCr = '₹' + (project.budget / 10000000).toFixed(1) + ' Cr';
  const spentCr = '₹' + ((project.actualCost || 0) / 10000000).toFixed(1) + ' Cr';
  const committedCr = '₹' + ((project.committedCost || 0) / 10000000).toFixed(1) + ' Cr';
  const remainingCr = '₹' + (Math.max(0, project.budget - (project.committedCost || 0) - (project.actualCost || 0)) / 10000000).toFixed(1) + ' Cr';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'team', label: 'Team' },
    { id: 'materials', label: 'Materials & BOQ' },
    { id: 'procurement', label: 'Procurement' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'documents', label: 'Documents' },
    { id: 'site-reports', label: 'Site Reports' }
  ];

  return (
    <>
      {/* Top Back Navigation */}
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/projects" className="btn btn-ghost btn-sm font-semibold" style={{ paddingLeft: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Projects Directory
        </Link>
      </div>

      {/* Project Hero Banner */}
      <section id="project-hero-banner" className="project-details-hero">
        <div className="project-details-hero-info">
          <div className="project-details-tagline">
            <span>PROJECT ID: {project.id}</span> • <span>{project.client}</span>
          </div>
          <h1 className="project-details-title">{project.name}</h1>
          <div className="project-details-meta-row">
            <span>📍 {project.location}</span>
            <span>👤 Lead PM: <strong>{project.manager}</strong></span>
            <span>📅 Target Handover: <strong>{project.deadline}</strong></span>
            <StatusBadge status={project.status} />
          </div>

          <div className="project-details-quick-stats">
            <div className="hero-quick-stat">
              <span className="hero-quick-stat-label">Overall Progress</span>
              <span className="hero-quick-stat-val">{project.progress}%</span>
            </div>
            <div className="hero-quick-stat">
              <span className="hero-quick-stat-label">Total Budget</span>
              <span className="hero-quick-stat-val">{budgetCr}</span>
            </div>
            <div className="hero-quick-stat">
              <span className="hero-quick-stat-label">Incurred Cost</span>
              <span className="hero-quick-stat-val" style={{ color: 'var(--color-warm-beige)' }}>
                {spentCr}
              </span>
            </div>
            <div className="hero-quick-stat">
              <span className="hero-quick-stat-label">Active Work Force</span>
              <span className="hero-quick-stat-val">{project.workersOnSite || 0} Workers</span>
            </div>
          </div>
        </div>

        <div className="project-details-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setIsEditOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            Edit Project
          </button>
          <button
            className="btn btn-outline btn-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--color-white)', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => showToast('Exporting project summary PDF...', 'info')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export Summary
          </button>
        </div>
      </section>

      {/* Project Navigation Tabs */}
      <div className="project-tabs-container">
        <nav className="project-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`project-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="project-overview-grid">
          {/* Left Column */}
          <div className="flex-col gap-6">
            {/* Progress Card */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Project Execution & Progress</div>
                  <div className="card-subtitle">Task completion and milestone velocity</div>
                </div>
                <span className={`badge ${project.progress >= 70 ? 'badge-success' : 'badge-neutral'} font-bold`}>
                  {project.progress}% Completed
                </span>
              </div>
              <div className="card-body">
                <div className="progress-container" style={{ marginBottom: '1.5rem' }}>
                  <div className="progress-bar-wrap" style={{ height: '10px' }}>
                    <div className="progress-bar-fill primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="project-progress-breakdown">
                  <div className="breakdown-box">
                    <span className="breakdown-num">{project.tasksCompleted || 0} / {project.tasksTotal || 0}</span>
                    <span className="breakdown-label">Tasks Completed</span>
                  </div>
                  <div className="breakdown-box">
                    <span className="breakdown-num">{project.milestonesCompleted || 0} / {project.milestonesTotal || 0}</span>
                    <span className="breakdown-label">Milestones Reached</span>
                  </div>
                  <div className="breakdown-box">
                    <span className="breakdown-num">{project.workersOnSite || 0}</span>
                    <span className="breakdown-label">Site Personnel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview Card */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Budget Allocation & Cost Governance</div>
                  <div className="card-subtitle">Committed Purchase Orders vs Incurred Invoices</div>
                </div>
                <span className="badge badge-neutral">INR (₹ Crores)</span>
              </div>
              <div className="card-body">
                <div className="budget-metrics-grid">
                  <div className="budget-metric-card">
                    <span className="bm-label">Allocated Budget</span>
                    <span className="bm-val">{budgetCr}</span>
                  </div>
                  <div className="budget-metric-card">
                    <span className="bm-label">Incurred Cost</span>
                    <span className="bm-val" style={{ color: 'var(--color-primary-brown)' }}>{spentCr}</span>
                  </div>
                  <div className="budget-metric-card">
                    <span className="bm-label">Committed POs</span>
                    <span className="bm-val" style={{ color: 'var(--color-accent)' }}>{committedCr}</span>
                  </div>
                  <div className="budget-metric-card">
                    <span className="bm-label">Available Balance</span>
                    <span className="bm-val" style={{ color: 'var(--color-success)' }}>{remainingCr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Scope & Description */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Project Scope & Specifications</div>
              </div>
              <div className="card-body">
                <p>{project.description}</p>
                <div className="flex gap-4" style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  <span>📅 Commenced: <strong>{project.startDate}</strong></span>
                  <span>📅 Target Completion: <strong>{project.deadline}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-col gap-6">
            {/* Site Operations Team */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Site Leadership</div>
                <button type="button" className="btn btn-ghost btn-sm text-primary" onClick={() => setActiveTab('team')}>
                  View All ({project.team?.length || 1}) →
                </button>
              </div>
              <div className="card-body">
                <div className="team-mini-list">
                  {project.team?.map((member, idx) => (
                    <div key={idx} className="team-member-item">
                      <div className="team-member-avatar">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="team-member-info">
                        <div className="team-member-name">{member.name}</div>
                        <div className="team-member-role">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Issues */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Active Site Issues</div>
                <span className="badge badge-warning">{project.issues?.length || 0} Open</span>
              </div>
              <div className="card-body">
                {(!project.issues || project.issues.length === 0) ? (
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>No open blockers reported on this site.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {project.issues.map((iss) => (
                      <div key={iss.id} style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-dark" style={{ fontSize: '0.85rem' }}>{iss.title}</span>
                          <StatusBadge status={iss.priority} />
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          Assigned to {iss.assignee} • {iss.date}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Activity Log</div>
              </div>
              <div className="card-body">
                <div className="timeline-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {project.recentActivities?.map((act, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <div className="font-semibold text-dark">{act.user}</div>
                      <div className="text-muted">{act.action}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '0.1rem' }}>{act.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks */}
      {activeTab === 'tasks' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Project Tasks & Deliverables</div>
              <div className="card-subtitle">Work execution assigned for {project.name}</div>
            </div>
            <Link to={`/tasks?project=${project.id}`} className="btn btn-primary btn-sm">
              View in Tasks & Milestones Module →
            </Link>
          </div>
          <div className="card-body">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No Specific Tasks Found</div>
                <div className="empty-state-desc">Create tasks to track sub-contractor activities and structural progress.</div>
                <Link to={`/tasks?project=${project.id}`} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                  + Create Task in Module
                </Link>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none' }}>
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Assignee</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id}>
                        <td className="font-semibold text-dark">{t.title}</td>
                        <td>{t.assignee}</td>
                        <td><StatusBadge status={t.priority} /></td>
                        <td>{t.dueDate}</td>
                        <td>{t.progress}%</td>
                        <td><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Milestones */}
      {activeTab === 'milestones' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Key Baseline Milestones</div>
              <div className="card-subtitle">Critical path gates and engineering deliverables for {project.name}</div>
            </div>
            <Link to={`/tasks?project=${project.id}`} className="btn btn-primary btn-sm">
              Manage in Tasks & Milestones →
            </Link>
          </div>
          <div className="card-body">
            {milestones.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No Milestones Recorded</div>
                <div className="empty-state-desc">Establish baseline engineering gates and completion targets for this site.</div>
                <Link to={`/tasks?project=${project.id}`} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                  + Add Milestone
                </Link>
              </div>
            ) : (
              <div className="milestones-timeline">
                {milestones.map((m) => (
                  <div key={m.id} className="milestone-timeline-item">
                    <div className={`milestone-bullet ${m.status === 'Completed' ? 'completed' : 'active'}`} />
                    <div className="milestone-timeline-content">
                      <div className="flex items-center justify-between">
                        <div className="milestone-timeline-title font-bold text-dark">{m.title}</div>
                        <StatusBadge status={m.status} />
                      </div>
                      {m.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-body)', margin: '0.25rem 0' }}>
                          {m.description}
                        </p>
                      )}
                      <div className="milestone-timeline-meta" style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        📅 Target: <strong>{m.dueDate}</strong> • 👤 Lead: {m.responsible}
                      </div>
                      <div className="progress-bar-wrap" style={{ height: '5px', marginTop: '0.45rem' }}>
                        <div
                          className="progress-bar-fill primary"
                          style={{ width: `${m.progress}%`, backgroundColor: m.progress === 100 ? 'var(--color-success)' : undefined }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Team */}
      {activeTab === 'team' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Site Operations Team</div>
              <div className="card-subtitle">Engineers, supervisors, contractors, and inspectors assigned to this site</div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => showToast('Team member assignment form opened', 'info')}
            >
              + Assign Member
            </button>
          </div>
          <div className="card-body">
            <div className="team-mini-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {project.team?.map((member, idx) => (
                <div key={idx} className="card" style={{ padding: '1rem', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="team-member-avatar" style={{ width: '44px', height: '44px', fontSize: '1rem' }}>
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-dark">{member.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{member.role}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>{member.phone || '+91 98765 43210'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs (Materials, Procurement, Expenses, Documents, Site Reports) */}
      {['materials', 'procurement', 'expenses', 'documents', 'site-reports'].includes(activeTab) && (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">
                {activeTab === 'materials' && '📦'}
                {activeTab === 'procurement' && '🛒'}
                {activeTab === 'expenses' && '💰'}
                {activeTab === 'documents' && '📄'}
                {activeTab === 'site-reports' && '📋'}
              </div>
              <div className="empty-state-title">
                {activeTab === 'materials' && 'Bill of Quantities & Material Indents'}
                {activeTab === 'procurement' && 'Procurement & Purchase Orders'}
                {activeTab === 'expenses' && 'Site Expenses & Cost Disbursements'}
                {activeTab === 'documents' && 'Architectural CAD Plans & Municipal Drawings'}
                {activeTab === 'site-reports' && 'Daily Site Field Logs'}
              </div>
              <div className="empty-state-desc">
                Live telemetry and records for {project.name} are accessible across dedicated operational views.
              </div>
              <Link
                to={
                  activeTab === 'site-reports'
                    ? '/site-reports'
                    : activeTab === 'procurement'
                    ? '/approvals'
                    : '/dashboard'
                }
                className="btn btn-primary btn-sm"
              >
                Go to {activeTab.replace('-', ' ').toUpperCase()} Module →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
        onProjectUpdated={() => loadProjectData()}
      />
    </>
  );
}
