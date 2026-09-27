import React, { useState, useEffect, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Folder,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Boxes,
  FileText,
  ChevronRight,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Layers,
  Calendar,
  Filter,
  Users,
  HardHat,
  Thermometer,
  Wind,
  Activity,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import PageLoader from '../components/common/PageLoader';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const outletContext = useOutletContext() || {};
  const {
    openCreateProjectModal = () => {},
    openQuickReportModal = () => {},
    openQuickPOModal = () => {}
  } = outletContext;

  const role = currentUser?.role || 'Project Manager';
  const isClient = role.toLowerCase() === 'client';
  const isAdmin = role.toLowerCase() === 'admin';

  // Global Project Filter state ('ALL' or project ID / name)
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [siteReports, setSiteReports] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [statsRes, prjRes, repRes, mlsRes, appRes, stockRes, issuesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getProjects(),
        api.getRecentSiteReports(),
        api.getUpcomingMilestones(),
        api.getPendingApprovals(),
        api.getLowStockMaterials(),
        api.getIssues()
      ]);

      if (statsRes?.success && statsRes.data) setStats(statsRes.data);
      if (prjRes?.success && Array.isArray(prjRes.data)) setProjects(prjRes.data.slice(0, 8));
      if (repRes?.success && Array.isArray(repRes.data)) setSiteReports(repRes.data);
      if (mlsRes?.success && Array.isArray(mlsRes.data)) setMilestones(mlsRes.data);
      if (appRes?.success && Array.isArray(appRes.data)) setApprovals(appRes.data);
      if (stockRes?.success && Array.isArray(stockRes.data)) setLowStock(stockRes.data);
      if (issuesRes?.success && Array.isArray(issuesRes.data)) setIssues(issuesRes.data);
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
      showToast(res.message || `Approval ${action}d successfully`, action === 'approve' ? 'success' : 'info');
      setApprovals((prev) => prev.filter((a) => a.id !== id && a._id !== id));
      if (stats) {
        setStats((prev) => ({
          ...prev,
          pendingApprovals: Math.max(0, (prev.pendingApprovals || 3) - 1)
        }));
      }
    } else {
      showToast(res.message || 'Action failed', 'danger');
    }
  };

  // Benchmark default projects with rich operational attributes
  const allProjects = useMemo(() => {
    if (projects.length > 0) {
      return projects.map((p, idx) => ({
        ...p,
        id: p.id || p._id || `PRJ-10${idx + 1}`,
        stage: p.stage || (idx === 0 ? '18th Floor Superstructure' : idx === 1 ? 'Villa Superstructure' : idx === 2 ? 'Curtain Glazing & MEP' : 'Substructure Raft'),
        variance: p.variance || (idx === 0 ? '+3d Ahead' : idx === 1 ? 'On Schedule' : idx === 2 ? '-5d Variance' : 'On Schedule'),
        varianceType: p.varianceType || (idx === 0 ? 'ahead' : idx === 1 ? 'ontrack' : idx === 2 ? 'behind' : 'ontrack'),
        workersOnSite: p.workersOnSite || (idx === 0 ? 142 : idx === 1 ? 98 : idx === 2 ? 210 : 85),
        location: p.location || (idx % 2 === 0 ? 'Worli, Mumbai' : 'Whitefield, Bengaluru'),
        weather: idx % 2 === 0 ? '31°C Clear' : '27°C Partly Cloudy'
      }));
    }
    return [
      {
        id: 'PRJ-101',
        name: 'Skyline Heights',
        client: 'Apex Developers',
        location: 'Worli, Mumbai',
        manager: 'Kashish Patel',
        progress: 78,
        status: 'On Track',
        stage: '18th Floor RCC Superstructure',
        variance: '+3d Ahead',
        varianceType: 'ahead',
        workersOnSite: 142,
        weather: '31°C Clear',
        budget: 185000000
      },
      {
        id: 'PRJ-102',
        name: 'Green Valley Residency',
        client: 'Godrej Properties',
        location: 'Whitefield, Bengaluru',
        manager: 'Kashish Patel',
        progress: 64,
        status: 'On Track',
        stage: 'Villa Phase 1 Superstructure',
        variance: 'On Schedule',
        varianceType: 'ontrack',
        workersOnSite: 98,
        weather: '27°C Partly Cloudy',
        budget: 120000000
      },
      {
        id: 'PRJ-103',
        name: 'Metro Commercial Complex',
        client: 'Prestige Group',
        location: 'BKC, Mumbai',
        manager: 'Vikram Malhotra',
        progress: 51,
        status: 'At Risk',
        stage: 'Curtain Glazing & MEP',
        variance: '-5d Variance',
        varianceType: 'behind',
        workersOnSite: 210,
        weather: '30°C Clear',
        budget: 240000000
      },
      {
        id: 'PRJ-104',
        name: 'Coastal Infrastructure Hub',
        client: 'L&T Infrastructure',
        location: 'Navi Mumbai',
        manager: 'Sanjay Verma',
        progress: 35,
        status: 'Active',
        stage: 'Substructure Raft Foundation',
        variance: 'On Schedule',
        varianceType: 'ontrack',
        workersOnSite: 85,
        weather: '32°C Sunny',
        budget: 152000000
      }
    ];
  }, [projects]);

  // Selected project object if filter is applied
  const activeSelectedProject = useMemo(() => {
    if (selectedProjectId === 'ALL') return null;
    return allProjects.find((p) => p.id === selectedProjectId || p.name === selectedProjectId) || null;
  }, [selectedProjectId, allProjects]);

  // Benchmark enriched milestones
  const allMilestones = useMemo(() => {
    if (milestones.length > 0) return milestones;
    return [
      {
        id: 'MLS-102',
        title: '18th Floor Slab Concrete Casting & Curing',
        project: 'Skyline Heights',
        projectId: 'PRJ-101',
        responsible: 'Sanjay Verma',
        dueDate: 'Due in 8 days',
        targetDate: '04 Oct 2026',
        prerequisite: 'Prerequisite: Lab Cube Test Passed',
        progress: 65,
        status: 'In Progress'
      },
      {
        id: 'MLS-104',
        title: 'Villa Phase 1 Structural Superstructure Complete',
        project: 'Green Valley Residency',
        projectId: 'PRJ-102',
        responsible: 'Kashish Patel',
        dueDate: 'Due in 14 days',
        targetDate: '10 Oct 2026',
        prerequisite: 'Prerequisite: Column Rebar Inspection Cleared',
        progress: 40,
        status: 'In Progress'
      },
      {
        id: 'MLS-105',
        title: 'Curtain Glazing Wind Load Lab Certification',
        project: 'Metro Commercial Complex',
        projectId: 'PRJ-103',
        responsible: 'Vikram Malhotra',
        dueDate: 'Due in 22 days',
        targetDate: '18 Oct 2026',
        prerequisite: 'Prerequisite: Facade Anchor Pull-Out Verified',
        progress: 80,
        status: 'In Progress'
      },
      {
        id: 'MLS-101',
        title: 'Substructure & Raft Foundation Sign-Off',
        project: 'Skyline Heights',
        projectId: 'PRJ-101',
        responsible: 'Kashish Patel',
        dueDate: 'Completed',
        targetDate: '20 Sep 2026',
        prerequisite: 'Prerequisite: Geotech Bearing Capacity Certified',
        progress: 100,
        status: 'Completed'
      }
    ];
  }, [milestones]);

  // Benchmark enriched site reports
  const allSiteReports = useMemo(() => {
    if (siteReports.length > 0) return siteReports;
    return [
      {
        id: 'REP-901',
        supervisor: 'Sanjay Verma',
        project: 'Skyline Heights',
        projectId: 'PRJ-101',
        weather: 'Clear, 31°C',
        workersPresent: 142,
        tradeBreakdown: '92 Masons, 34 Barbenders, 16 MEP Specialists',
        workPackage: '#ConcretePour',
        verifiedByCRE: true,
        workCompleted: 'Reinforcement bar tying for 18th floor edge beams. Poured 4 columns on North Wing.',
        date: 'Today, 04:30 PM',
        issues: 'None reported.'
      },
      {
        id: 'REP-902',
        supervisor: 'Sanjay Verma',
        project: 'Skyline Heights',
        projectId: 'PRJ-101',
        weather: 'Partly Cloudy, 29°C',
        workersPresent: 138,
        tradeBreakdown: '85 Masons, 35 Plumbers, 18 Electricians',
        workPackage: '#PlumbingTest',
        verifiedByCRE: true,
        workCompleted: 'Mechanical plumbing line pressure test on floor 14. Completed conduit routing.',
        date: 'Yesterday, 05:15 PM',
        issues: 'Minor delay in aggregate delivery due to traffic checkpoint.'
      },
      {
        id: 'REP-903',
        supervisor: 'Rajesh Sharma',
        project: 'Green Valley Residency',
        projectId: 'PRJ-102',
        weather: 'Sunny, 28°C',
        workersPresent: 98,
        tradeBreakdown: '60 Excavators, 28 Concrete Workers, 10 Operators',
        workPackage: '#FoundationPour',
        verifiedByCRE: false,
        workCompleted: 'Completed exterior boundary wall foundation casting for villas 14 through 18.',
        date: '14 Sep 2026',
        issues: 'None reported.'
      },
      {
        id: 'REP-904',
        supervisor: 'Vikram Malhotra',
        project: 'Metro Commercial Complex',
        projectId: 'PRJ-103',
        weather: 'Clear, 30°C',
        workersPresent: 210,
        tradeBreakdown: '140 Glaziers, 50 Duct Installers, 20 Engineers',
        workPackage: '#FacadeGlazing',
        verifiedByCRE: true,
        workCompleted: 'Glazing unit installation completed on South Elevation (Floors 8-12).',
        date: '13 Sep 2026',
        issues: 'Crane inspection certified.'
      }
    ];
  }, [siteReports]);

  // Benchmark approvals
  const allApprovals = useMemo(() => {
    if (approvals.length > 0) return approvals;
    return [
      {
        id: 'APP-401',
        title: 'UltraTech OPC 53 Grade Cement (800 Bags)',
        project: 'Skyline Heights',
        projectId: 'PRJ-101',
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        amount: '₹3,12,000',
        vendor: 'UltraTech Cement Authorized Dealer'
      },
      {
        id: 'APP-402',
        title: 'Tata Tiscon Fe 500D TMT Rebar (25 Tons)',
        project: 'Skyline Heights',
        projectId: 'PRJ-101',
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        amount: '₹15,50,000',
        vendor: 'Tata Steel Distributor'
      },
      {
        id: 'APP-403',
        title: 'Kirloskar 125 kVA DG Set Fuel Top-Up (1200L)',
        project: 'Skyline Heights',
        projectId: 'PRJ-101',
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        amount: '₹1,08,000',
        vendor: 'Indian Oil Commercial Outlets'
      },
      {
        id: 'APP-404',
        title: 'Basement Dewatering Submersible Pump Replacement',
        project: 'Green Valley Residency',
        projectId: 'PRJ-102',
        requestedBy: 'Rajesh Sharma (Site Lead)',
        amount: '₹85,000',
        vendor: 'Crompton Industrial Solutions'
      }
    ];
  }, [approvals]);

  // Filtered views based on Global Project Filter
  const filteredProjects = useMemo(() => {
    if (selectedProjectId === 'ALL') return allProjects;
    return allProjects.filter((p) => p.id === selectedProjectId || p.name === selectedProjectId);
  }, [allProjects, selectedProjectId]);

  const filteredSiteReports = useMemo(() => {
    if (selectedProjectId === 'ALL') return allSiteReports.slice(0, 4);
    const matched = allSiteReports.filter((r) => r.projectId === selectedProjectId || r.project === activeSelectedProject?.name);
    return matched.length > 0 ? matched : allSiteReports.slice(0, 2);
  }, [allSiteReports, selectedProjectId, activeSelectedProject]);

  const filteredMilestones = useMemo(() => {
    if (selectedProjectId === 'ALL') return allMilestones.slice(0, 4);
    const matched = allMilestones.filter((m) => m.projectId === selectedProjectId || m.project === activeSelectedProject?.name);
    return matched.length > 0 ? matched : allMilestones.slice(0, 2);
  }, [allMilestones, selectedProjectId, activeSelectedProject]);

  const filteredApprovals = useMemo(() => {
    if (selectedProjectId === 'ALL') return allApprovals;
    const matched = allApprovals.filter((a) => a.projectId === selectedProjectId || a.project === activeSelectedProject?.name);
    return matched.length > 0 ? matched : allApprovals.slice(0, 2);
  }, [allApprovals, selectedProjectId, activeSelectedProject]);

  // Dynamically calculate scoped operational counts
  const totalWorkforceCount = useMemo(() => {
    if (activeSelectedProject) return activeSelectedProject.workersOnSite || 142;
    return allProjects.reduce((acc, p) => acc + (p.workersOnSite || 120), 0);
  }, [activeSelectedProject, allProjects]);

  const activeProjectsCount = filteredProjects.length;
  const onTrackCount = filteredProjects.filter((p) => p.status === 'On Track' || p.progress >= 50).length;
  const openIssuesCount = activeSelectedProject ? 2 : (issues.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed').length || 8);
  const criticalIssuesCount = activeSelectedProject ? 1 : (issues.filter((i) => (i.priority === 'Critical' || i.priority === 'High') && i.status !== 'Resolved').length || 2);
  const pendingApprovalsCount = filteredApprovals.length;
  const lowStockCount = activeSelectedProject ? 1 : (lowStock.length > 0 ? lowStock.length : (stats?.lowStockItems ?? 3));
  const overdueTasksCount = activeSelectedProject ? (activeSelectedProject.varianceType === 'behind' ? 1 : 0) : (stats?.overdueTasks ?? 0);
  const verifiedMilestonesCount = filteredMilestones.filter((m) => m.status === 'Completed' || m.progress === 100).length || 12;

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return (
      <PageLoader
        text="Loading Operations Overview..."
        subtext="Synchronizing project health, field reports & alerts"
      />
    );
  }

  return (
    <div id="dashboard-main-content">
      {/* ====================================================================
          1. PAGE HEADER (STREAMLINED & ROLE-AWARE)
          ==================================================================== */}
      <section className="welcome-banner" aria-label="Executive Overview and Quick Actions">
        <div className="welcome-content">
          <div className="welcome-date">
            <Calendar size={13} />
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="welcome-title">
            {isClient
              ? `Welcome, ${currentUser?.name || 'Client Representative'}`
              : `Good Morning, ${currentUser?.name?.split(' ')[0] || 'Kashish'}`}
          </h1>
          <p className="welcome-subtitle">
            {isClient
              ? 'Client Operations Overview: Real-time project progress, verified site milestones, and active deliveries.'
              : activeSelectedProject
              ? `Filtered Command View: Live telemetry for ${activeSelectedProject.name} (${activeSelectedProject.location}).`
              : 'Construction operations overview across all active projects.'}
          </p>
        </div>

        {/* Action toolbar for operations roles */}
        {!isClient && (
          <div className="welcome-actions" role="toolbar" aria-label="Quick operations actions">
            <button
              type="button"
              className="btn btn-accent btn-sm"
              onClick={openCreateProjectModal}
              aria-label="Create a new construction project"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New Project</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={openQuickReportModal}
              aria-label="Submit daily site progress report"
            >
              <FileText size={15} strokeWidth={2} />
              <span>Log Daily Report</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-glass btn-sm"
              onClick={openQuickPOModal}
              aria-label="Raise material purchase requisition"
            >
              <Boxes size={15} strokeWidth={2} />
              <span>Raise Requisition</span>
            </button>
          </div>
        )}
      </section>

      {/* ====================================================================
          2. GLOBAL PROJECT FILTER BAR & ENVIRONMENTAL SAFETY INDICATOR
          ==================================================================== */}
      <section className="dashboard-filter-bar" aria-label="Global Project Filter and Environmental Safety Telemetry">
        <div className="filter-bar-left">
          <div className="filter-bar-label">
            <Filter size={15} strokeWidth={2.2} />
            <span>Project Scope:</span>
          </div>
          <select
            className="project-filter-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            aria-label="Filter entire dashboard by active construction project"
          >
            <option value="ALL">All Active Projects ({allProjects.length} Sites)</option>
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} • {p.location}
              </option>
            ))}
          </select>

          {selectedProjectId !== 'ALL' && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={() => setSelectedProjectId('ALL')}
              title="Reset filter to show all active projects"
            >
              <X size={12} strokeWidth={2.5} />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* Environmental & Safety Indicator */}
        <div className="environmental-safety-bar">
          <div className="env-metric-item" title="Site Temperature & Conditions">
            <Thermometer size={14} style={{ color: '#B98958' }} />
            <span>
              {activeSelectedProject ? activeSelectedProject.weather : '🌤 31°C Clear'}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="env-metric-item" title="Concrete Curing Index">
            <Activity size={14} style={{ color: '#547AA5' }} />
            <span>Curing Index: <strong>Optimal</strong></span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="safety-pill" title="Jobsite Occupational Health & Safety Streak">
            <ShieldCheck size={14} strokeWidth={2.2} />
            <span>Zero Lost-Time Incidents (142 Days)</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. ENHANCED OPERATIONAL KPI ROW (4 DENSE CARDS)
          ==================================================================== */}
      <section aria-label="Operational Key Performance Indicators">
        <h2 className="sr-only">Key Performance Indicators</h2>
        <div id="kpi-cards-grid" className="kpi-grid">
          {/* KPI 1: Active Projects or Selected Stage */}
          <div className="stat-card" role="region" aria-label="Active Construction Projects">
            <div className="stat-card-header">
              <span className="stat-label">
                {activeSelectedProject ? 'Selected Site Stage' : 'Active Projects'}
              </span>
              <div className="stat-icon primary" aria-hidden="true">
                <Folder size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="stat-value" style={{ fontSize: activeSelectedProject ? '1.35rem' : '1.85rem' }}>
              {activeSelectedProject ? activeSelectedProject.name : `${activeProjectsCount} Sites`}
            </div>
            <div className="stat-footer">
              <span className="stat-trend up">
                <CheckCircle2 size={12} strokeWidth={2.5} />
                {activeSelectedProject ? activeSelectedProject.stage : `${onTrackCount} On Track`}
              </span>
              <span>{activeSelectedProject ? 'Current Package' : 'Operational sites'}</span>
            </div>
          </div>

          {/* KPI 2: Field Workforce Active Today */}
          <div className="stat-card" role="region" aria-label="Field Workforce Attendance">
            <div className="stat-card-header">
              <span className="stat-label">Active Workforce Today</span>
              <div className="stat-icon success" aria-hidden="true">
                <HardHat size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="stat-value">{totalWorkforceCount.toLocaleString()}</div>
            <div className="stat-footer">
              <span className="stat-trend success font-semibold">
                ● 94% Present
              </span>
              <span>{activeSelectedProject ? `On-site at ${activeSelectedProject.name}` : `Across ${allProjects.length} sites`}</span>
            </div>
          </div>

          {/* KPI 3: Open Issues & Quality Observations */}
          <div className="stat-card" role="region" aria-label="Open Construction Issues">
            <div className="stat-card-header">
              <span className="stat-label">Open Quality Issues</span>
              <div className="stat-icon warning" aria-hidden="true">
                <AlertTriangle size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="stat-value">{openIssuesCount}</div>
            <div className="stat-footer">
              <span className="stat-trend warning font-semibold">
                {criticalIssuesCount} High Priority
              </span>
              <span>Avg resolution: 2.4d</span>
            </div>
          </div>

          {/* KPI 4: Pending Approvals (or Milestones Verified for Client) */}
          <div className="stat-card" role="region" aria-label={isClient ? 'Verified Milestones' : 'Commercial Approvals Queue'}>
            <div className="stat-card-header">
              <span className="stat-label">{isClient ? 'Milestones Verified' : 'Commercial Approvals'}</span>
              <div className="stat-icon info" aria-hidden="true">
                {isClient ? <ShieldCheck size={18} strokeWidth={2} /> : <Clock size={18} strokeWidth={2} />}
              </div>
            </div>
            <div className="stat-value">{isClient ? verifiedMilestonesCount : `${pendingApprovalsCount} Pending`}</div>
            <div className="stat-footer">
              <span className="stat-trend neutral font-semibold">
                {isClient ? '100% Quality Pass' : 'Action Required'}
              </span>
              <span>{isClient ? 'Quality sign-offs' : 'Commercial queue'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. MAIN OPERATIONAL COMMAND GRID (FOCUSED 2-COLUMN LAYOUT)
          ==================================================================== */}
      <section className="dashboard-sections-grid" aria-label="Operational Command Center">
        <h2 className="sr-only">Operations Command Center</h2>

        {/* LEFT COLUMN: Project Performance Table & Recent Site Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* [A] PROJECT PERFORMANCE TABLE */}
          <div className="card" role="region" aria-label="Project Performance Table">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Folder size={18} strokeWidth={2} aria-hidden="true" />
                  Project Performance
                </h3>
                <p className="card-subtitle">
                  {activeSelectedProject
                    ? `Detailed status for ${activeSelectedProject.name}`
                    : 'Active construction sites, current stage & schedule variances'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link to="/projects" className="btn btn-ghost btn-sm font-semibold text-primary" aria-label="View all active construction projects">
                  View All Projects →
                </Link>
              </div>
            </div>

            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="table-custom">
                <caption className="sr-only">Summary of active projects with construction stage and schedule variance</caption>
                <thead>
                  <tr>
                    <th scope="col">Project & Stage</th>
                    <th scope="col">Site Lead</th>
                    <th scope="col" style={{ minWidth: '130px' }}>Progress</th>
                    <th scope="col">Schedule Variance</th>
                    <th scope="col">Status</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => {
                    const statusStr = p.status || (p.progress >= 60 ? 'On Track' : p.progress >= 45 ? 'At Risk' : 'Active');
                    const isRowSelected = activeSelectedProject && activeSelectedProject.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        style={{
                          backgroundColor: isRowSelected ? '#FDFBF7' : undefined,
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td>
                          <div className="font-semibold text-dark">{p.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>
                            {p.client} • {p.location}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span className="stage-badge">{p.stage}</span>
                            <span className="manpower-count-pill">👷 {p.workersOnSite} on site</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.84rem' }}>{p.manager}</td>
                        <td>
                          <div className="project-progress-bar-container">
                            <div
                              className="project-progress-track"
                              role="progressbar"
                              aria-valuenow={p.progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                              aria-label={`Progress for ${p.name}: ${p.progress}%`}
                            >
                              <div className="project-progress-fill" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="font-semibold" style={{ fontSize: '0.8rem', minWidth: '32px' }}>
                              {p.progress}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`variance-pill ${
                              p.varianceType === 'ahead'
                                ? 'variance-ahead'
                                : p.varianceType === 'behind'
                                ? 'variance-behind'
                                : 'variance-ontrack'
                            }`}
                          >
                            {p.variance}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <StatusBadge status={statusStr} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Link
                              to={`/projects/${p.id}`}
                              className="btn btn-ghost btn-sm text-primary font-semibold"
                              aria-label={`Open details for project ${p.name}`}
                            >
                              Open →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* [B] RECENT SITE ACTIVITY FEED */}
          <div className="card" role="region" aria-label="Recent Site Activity Feed">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <FileText size={18} strokeWidth={2} aria-hidden="true" />
                  Recent Site Activity
                </h3>
                <p className="card-subtitle">Field updates, trade work packages & daily inspections</p>
              </div>
              <Link to="/site-reports" className="btn btn-ghost btn-sm font-semibold text-primary" aria-label="View all field site reports">
                View All Reports →
              </Link>
            </div>

            <div className="card-body">
              <div className="activity-feed-list">
                {filteredSiteReports.map((report) => (
                  <div key={report.id} className="activity-feed-item">
                    <div className="activity-feed-icon" aria-hidden="true">
                      <FileText size={16} strokeWidth={2} />
                    </div>
                    <div className="activity-feed-content">
                      <div className="activity-feed-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className="activity-feed-site">{report.project}</span>
                          {report.workPackage && (
                            <span className="work-package-tag">{report.workPackage}</span>
                          )}
                          {report.verifiedByCRE && (
                            <span className="cre-verified-badge" title="Verified by Chief Resident Engineer">
                              <CheckCircle2 size={11} strokeWidth={2.5} />
                              Verified by CRE
                            </span>
                          )}
                        </div>
                        <span className="activity-feed-time">{report.date}</span>
                      </div>
                      <div className="activity-feed-desc">
                        {report.workCompleted}
                      </div>
                      <div className="activity-feed-meta">
                        <span>👷 Supervisor: <strong>{report.supervisor}</strong></span>
                        <span>•</span>
                        <span>🌤 {report.weather}</span>
                        <span>•</span>
                        <span style={{ color: '#6B4935', fontWeight: 600 }}>{report.workersPresent} Workers On-Site</span>
                        {report.tradeBreakdown && (
                          <>
                            <span>•</span>
                            <span className="text-muted" style={{ fontStyle: 'italic' }}>({report.tradeBreakdown})</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Operational Alerts, Upcoming Milestones & Approvals Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* [A] OPERATIONAL ALERTS CARD */}
          <div className="card" role="region" aria-label="Operational Alerts and Triage">
            <div className="card-header">
              <div>
                <h3 className="card-title" style={{ color: '#172333' }}>
                  <AlertTriangle size={18} strokeWidth={2} style={{ color: '#C58A3A' }} aria-hidden="true" />
                  Operational Alerts
                </h3>
                <p className="card-subtitle">Priority triage requiring management action</p>
              </div>
            </div>

            <div className="card-body">
              <div className="operational-alerts-list">
                {/* 1. Open Issues Alert (High Priority Red) */}
                <Link to="/issues" className="operational-alert-item alert-danger" title="Resolve High Priority Issues">
                  <div className="alert-item-left">
                    <div className="alert-item-icon" aria-hidden="true">
                      <AlertTriangle size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="alert-item-title">Open Quality & Site Issues</div>
                      <div className="alert-item-desc">{criticalIssuesCount} high-priority issues require inspection</div>
                    </div>
                  </div>
                  <span className="alert-item-badge">Resolve Issue →</span>
                </Link>

                {/* 2. Low Stock Alert (Moderate Amber) */}
                <Link to="/inventory" className="operational-alert-item alert-warning" title="Replenish Jobsite Inventory">
                  <div className="alert-item-left">
                    <div className="alert-item-icon" aria-hidden="true">
                      <Boxes size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="alert-item-title">Material Stock Shortage</div>
                      <div className="alert-item-desc">{lowStockCount} items below threshold buffer</div>
                    </div>
                  </div>
                  <span className="alert-item-badge">Reorder Stock →</span>
                </Link>

                {/* 3. Pending Approvals Alert (Internal operations only) */}
                {!isClient && (
                  <Link to="/approvals" className="operational-alert-item alert-info" title="Review Commercial Requisitions">
                    <div className="alert-item-left">
                      <div className="alert-item-icon" aria-hidden="true">
                        <Clock size={16} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div className="alert-item-title">Pending Commercial Requisitions</div>
                        <div className="alert-item-desc">{pendingApprovalsCount} purchase orders awaiting review</div>
                      </div>
                    </div>
                    <span className="alert-item-badge">Review PO →</span>
                  </Link>
                )}

                {/* 4. Critical Path Schedule Alert */}
                <Link to="/tasks" className={`operational-alert-item ${overdueTasksCount > 0 ? 'alert-danger' : 'alert-success'}`} title="View Tasks Schedule">
                  <div className="alert-item-left">
                    <div className="alert-item-icon" aria-hidden="true">
                      <CheckCircle2 size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="alert-item-title">Critical Path Schedule</div>
                      <div className="alert-item-desc">
                        {overdueTasksCount > 0
                          ? `${overdueTasksCount} overdue tasks affecting critical path`
                          : 'All milestones operating within float tolerance'}
                      </div>
                    </div>
                  </div>
                  <span className="alert-item-badge">
                    {overdueTasksCount > 0 ? `${overdueTasksCount} Overdue →` : 'On Schedule →'}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* [B] UPCOMING MILESTONES CARD */}
          <div className="card" role="region" aria-label="Upcoming Project Milestones">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <CheckCircle2 size={18} strokeWidth={2} style={{ color: '#5F8A68' }} aria-hidden="true" />
                  Upcoming Milestones
                </h3>
                <p className="card-subtitle">Critical handover dates & quality inspection gates</p>
              </div>
              <Link to="/tasks" className="btn btn-ghost btn-sm font-semibold text-primary" aria-label="View all project milestones">
                View All →
              </Link>
            </div>

            <div className="card-body">
              <div className="milestones-feed-list">
                {filteredMilestones.map((m) => (
                  <div key={m.id} className="milestones-feed-item">
                    <div className="milestones-feed-header">
                      <div className="milestones-feed-title">{m.title}</div>
                      <span className={`milestones-feed-due ${m.status === 'Completed' ? 'completed' : ''}`}>
                        {m.dueDate}
                      </span>
                    </div>
                    <div className="milestones-feed-meta">
                      <strong>{m.project}</strong> • Target: {m.targetDate || 'Oct 2026'} • Lead: {m.responsible}
                    </div>
                    <div className="milestones-progress-wrap">
                      <div
                        className="project-progress-track"
                        role="progressbar"
                        aria-valuenow={m.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style={{ height: '5px' }}
                      >
                        <div
                          className="project-progress-fill"
                          style={{
                            width: `${m.progress}%`,
                            background: m.status === 'Completed' ? '#5F8A68' : 'linear-gradient(90deg, #6B4935 0%, #B98958 100%)'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#4B5563' }}>
                        {m.progress}%
                      </span>
                    </div>
                    {m.prerequisite && (
                      <div className="prerequisite-tag">
                        {m.prerequisite}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* [C] COMMERCIAL APPROVALS REVIEW (ADMIN & PM PERSONAS ONLY) */}
          {!isClient && filteredApprovals.length > 0 && (
            <div className="card" role="region" aria-label="Commercial Approvals Review">
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <Clock size={18} strokeWidth={2} style={{ color: '#6B4935' }} aria-hidden="true" />
                    Approvals Queue
                  </h3>
                  <p className="card-subtitle">Requisitions & variations requiring review</p>
                </div>
                <Link to="/approvals" className="btn btn-ghost btn-sm font-semibold text-primary">
                  Queue ({filteredApprovals.length}) →
                </Link>
              </div>

              <div className="card-body">
                <div className="approval-list">
                  {filteredApprovals.slice(0, 3).map((a) => (
                    <div key={a.id || a._id} className="approval-item">
                      <div className="approval-info">
                        <div className="approval-title">{a.title}</div>
                        <div className="approval-meta">
                          <strong>{a.project || a.projectName}</strong> • <span className="text-muted">{a.requestedBy}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span className="approval-amount">{a.amount}</span>
                        <div className="approval-actions" role="group" aria-label={`Actions for ${a.title}`}>
                          <button
                            type="button"
                            className="btn-reject"
                            onClick={() => handleApproval(a.id || a._id, 'reject')}
                            title="Reject request"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="btn-approve"
                            onClick={() => handleApproval(a.id || a._id, 'approve')}
                            title="Approve immediately"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
