import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { openCreateProjectModal, openQuickReportModal, openQuickPOModal } = useOutletContext();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [siteReports, setSiteReports] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [statsRes, prjRes, repRes, mlsRes, appRes, stockRes, anaRes] = await Promise.all([
        api.getDashboardStats(),
        api.getProjects(),
        api.getRecentSiteReports(),
        api.getUpcomingMilestones(),
        api.getPendingApprovals(),
        api.getLowStockMaterials(),
        api.getAnalyticsSummary()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (prjRes.success) setProjects(prjRes.data.slice(0, 4));
      if (repRes.success) setSiteReports(repRes.data);
      if (mlsRes.success) setMilestones(mlsRes.data);
      if (appRes.success) setApprovals(appRes.data);
      if (stockRes.success) setLowStock(stockRes.data);
      if (anaRes.success) setAnalytics(anaRes.data);
    } catch {
      showToast('Error loading dashboard telemetry', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleDataChange = () => loadDashboardData();
    window.addEventListener('buildora-data-changed', handleDataChange);
    return () => window.removeEventListener('buildora-data-changed', handleDataChange);
  }, []);

  const handleApproval = async (id, action) => {
    const res = await api.handleApprovalAction(id, action);
    if (res.success) {
      showToast(res.message, action === 'approve' ? 'success' : 'info');
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      if (stats) {
        setStats((prev) => ({
          ...prev,
          pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
        }));
      }
    }
  };

  // Chart data setup
  const barChartData = {
    labels: analytics?.expenseTrends?.labels || ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep (Proj)"],
    datasets: [
      {
        label: 'Budget Allocation (₹ Cr)',
        data: analytics?.expenseTrends?.budgeted || [4.2, 4.5, 5.0, 4.8, 5.2, 4.9, 5.5],
        backgroundColor: '#B88A5A',
        borderRadius: 4
      },
      {
        label: 'Incurred Expenditure (₹ Cr)',
        data: analytics?.expenseTrends?.actual || [3.8, 4.1, 4.9, 4.6, 5.4, 4.7, 5.1],
        backgroundColor: '#463326',
        borderRadius: 4
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 12, weight: '500' },
          color: '#4A4642',
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: '#262321',
        titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 6
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#77716B', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(233, 224, 213, 0.6)' },
        ticks: { color: '#77716B', font: { family: 'Inter', size: 11 } }
      }
    }
  };

  const doughnutChartData = {
    labels: analytics?.projectHealth?.labels || ["Completed", "Active On-Track", "Under Review", "Planning"],
    datasets: [
      {
        data: analytics?.projectHealth?.counts || [4, 8, 3, 2],
        backgroundColor: analytics?.projectHealth?.colors || ["#2E7D32", "#6B4F3A", "#D97706", "#8A684C"],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 11, weight: '500' },
          color: '#4A4642',
          padding: 14,
          boxWidth: 10
        }
      }
    },
    cutout: '70%'
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Operations Center Telemetry...</h3>
      </div>
    );
  }

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      {/* Welcome Banner with Wix-inspired Earthy Aesthetic */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            {currentDateFormatted}
          </div>
          <h2 className="welcome-title">Good Morning, {currentUser?.name?.split(' ')[0] || 'Kashish'}</h2>
          <p className="welcome-subtitle">
            12 active construction sites are operational today. 5 urgent purchase requests require your sign-off before 2:00 PM.
          </p>
        </div>

        <div className="welcome-actions">
          <button className="btn btn-secondary btn-sm" onClick={openCreateProjectModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
          <button className="btn btn-accent btn-sm" onClick={openQuickReportModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="12" y2="18"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
            Daily Site Log
          </button>
          <button
            className="btn btn-outline btn-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--color-white)', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={openQuickPOModal}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            Purchase Request
          </button>
        </div>
      </section>

      {/* 6 Key Performance Indicators (KPIs) */}
      <section id="kpi-cards-grid" className="kpi-grid">
        {/* Active Projects */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Projects</span>
            <div className="stat-icon primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
          </div>
          <div className="stat-value">{stats?.activeProjects || 12}</div>
          <div className="stat-footer">
            <span className="stat-trend up">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              +2
            </span>
            <span>sites active this mo.</span>
          </div>
        </div>

        {/* Total Budget */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Portfolio Budget</span>
            <div className="stat-icon info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div className="stat-value">{stats?.totalBudgetFormatted || '₹48.0 Cr'}</div>
          <div className="stat-footer">
            <span className="text-muted">Across 12 major sites</span>
          </div>
        </div>

        {/* Budget Used */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Budget Utilized</span>
            <div className="stat-icon warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
          </div>
          <div className="stat-value">{stats?.budgetUsedFormatted || '₹29.0 Cr'}</div>
          <div className="stat-footer">
            <span className="stat-trend neutral font-semibold">{stats?.budgetPercentage || 60.4}%</span>
            <span>committed to date</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending Approvals</span>
            <div className="stat-icon warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
          </div>
          <div className="stat-value text-primary">{stats?.pendingApprovals ?? approvals.length}</div>
          <div className="stat-footer">
            <span className="stat-trend down font-semibold">5 Urgent</span>
            <span>require PM sign-off</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Overdue Tasks</span>
            <div className="stat-icon danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats?.overdueTasks || 7}</div>
          <div className="stat-footer">
            <span className="stat-trend down">Critical path</span>
            <span>flagged</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Low Stock Alerts</span>
            <div className="stat-icon danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
            </div>
          </div>
          <div className="stat-value">{stats?.lowStockItems || 9}</div>
          <div className="stat-footer">
            <span className="text-muted">Rebar & Cement reorder</span>
          </div>
        </div>
      </section>

      {/* Visual Analytics Charts (2 Columns) */}
      <section className="charts-grid">
        {/* Left Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                Monthly Budget vs. Actual Expenditure
              </div>
              <div className="card-subtitle">Values tracked in Crores (INR) across active fiscal quarters</div>
            </div>
            <div className="badge badge-neutral badge-no-dot">FY 2026-27</div>
          </div>
          <div className="card-body">
            <div className="chart-container-box" style={{ position: 'relative', height: '240px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Right Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Project Progress</div>
              <div className="card-subtitle">Status across all registered projects</div>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container-box" style={{ position: 'relative', height: '240px' }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Operations Grid */}
      <section className="dashboard-sections-grid">
        {/* Left Column: Active Projects Table & Site Feed */}
        <div className="flex-col gap-6">
          {/* Recent Projects Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Projects</div>
                <div className="card-subtitle">Project completion status and budget tracking</div>
              </div>
              <Link to="/projects" className="btn btn-ghost btn-sm font-semibold text-primary">
                View All Projects →
              </Link>
            </div>
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Project & Client</th>
                    <th>Site Lead</th>
                    <th>Progress</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const budgetCr = '₹' + (p.budget / 10000000).toFixed(1) + ' Cr';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="font-semibold text-dark">{p.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.client} • {p.location}</div>
                        </td>
                        <td>{p.manager}</td>
                        <td style={{ minWidth: '140px' }}>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar-wrap" style={{ height: '6px', flex: 1 }}>
                              <div className="progress-bar-fill primary" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="font-semibold" style={{ fontSize: '0.78rem' }}>{p.progress}%</span>
                          </div>
                        </td>
                        <td className="font-semibold">{budgetCr}</td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/projects/${p.id}`} className="btn btn-ghost btn-sm text-primary font-semibold">
                            Open →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Site Operations Feed */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Site Reports</div>
                <div className="card-subtitle">Supervisor field updates submitted in the last 24 hours</div>
              </div>
              <Link to="/site-reports" className="btn btn-ghost btn-sm font-semibold text-primary">
                All Reports →
              </Link>
            </div>
            <div className="card-body">
              <div className="site-activity-feed">
                {siteReports.map((rep) => (
                  <div key={rep.id} className="site-feed-item">
                    <div className="site-feed-avatar">
                      {rep.supervisor.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="site-feed-body">
                      <div className="site-feed-header">
                        <span className="site-feed-author">{rep.supervisor}</span>
                        <span className="site-feed-time">{rep.date}</span>
                      </div>
                      <div className="site-feed-project">
                        <strong>{rep.project}</strong> • {rep.workersPresent} Workers • {rep.weather}
                      </div>
                      <p className="site-feed-text">{rep.workCompleted}</p>
                      {rep.issues && rep.issues !== 'None reported.' && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.2rem' }}>
                          ⚠️ Issue: {rep.issues}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Urgent Approvals, Upcoming Milestones, Low Stock */}
        <div className="flex-col gap-6">
          {/* Urgent Pending Approvals */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-warning)' }}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  Urgent Approvals
                </div>
                <div className="card-subtitle">Purchase orders & expense claims awaiting PM approval</div>
              </div>
              <Link to="/approvals" className="btn btn-ghost btn-sm font-semibold text-primary">
                See All
              </Link>
            </div>
            <div className="card-body">
              <div className="approval-list">
                {approvals.length === 0 ? (
                  <div className="text-muted" style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    ✓ No pending approvals in queue
                  </div>
                ) : (
                  approvals.slice(0, 3).map((a) => (
                    <div key={a.id} className="approval-item">
                      <div className="approval-item-header">
                        <div>
                          <div className="approval-item-title">{a.title}</div>
                          <div className="approval-item-meta">{a.project} • {a.requestedBy}</div>
                        </div>
                        <span className="approval-item-amount">{a.amount}</span>
                      </div>
                      <div className="approval-item-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleApproval(a.id, 'reject')}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleApproval(a.id, 'approve')}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Milestones Timeline */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Key Milestones Schedule</div>
                <div className="card-subtitle">Critical path deadlines within the next 14 days</div>
              </div>
              <Link to="/tasks" className="btn btn-ghost btn-sm font-semibold text-primary">
                Schedule →
              </Link>
            </div>
            <div className="card-body">
              <div className="milestones-timeline">
                {milestones.map((m) => (
                  <div key={m.id} className="milestone-timeline-item">
                    <div className={`milestone-bullet ${m.status === 'Completed' ? 'completed' : 'active'}`} />
                    <div className="milestone-timeline-content">
                      <div className="flex items-center justify-between">
                        <div className="milestone-timeline-title">{m.title}</div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{m.dueDate}</span>
                      </div>
                      <div className="milestone-timeline-meta">{m.project} • {m.responsible}</div>
                      <div className="progress-bar-wrap" style={{ height: '4px', marginTop: '0.4rem' }}>
                        <div className="progress-bar-fill primary" style={{ width: `${m.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Critical Materials */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title" style={{ color: 'var(--color-danger)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Material Depletion Alerts
                </div>
                <div className="card-subtitle">Items below site reorder threshold</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm font-semibold text-primary"
                onClick={openQuickPOModal}
              >
                + Reorder PO
              </button>
            </div>
            <div className="card-body" style={{ padding: '0.75rem 1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {lowStock.map((mat) => (
                  <div
                    key={mat.id}
                    className="flex items-center justify-between"
                    style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}
                  >
                    <div>
                      <div className="font-semibold text-dark" style={{ fontSize: '0.88rem' }}>{mat.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Min Required: {mat.min}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${mat.status === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                        {mat.stock} Left
                      </span>
                      <div>
                        <button
                          type="button"
                          className="text-accent font-semibold"
                          style={{ fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                          onClick={() => {
                            showToast(`Reorder PO generated for ${mat.name}`, 'success');
                            openQuickPOModal();
                          }}
                        >
                          + Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
