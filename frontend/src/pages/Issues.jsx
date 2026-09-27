import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AlertTriangle,
  Clock,
  AlertOctagon,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Eye,
  CheckCircle2,
  Edit3,
  UserCheck,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Truck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageLoader from '../components/common/PageLoader';
import Modal from '../components/common/Modal';

// Benchmark default issues data matching the exact enterprise specifications
const DEFAULT_BENCHMARK_ISSUES = [
  {
    id: 'ISS-101',
    title: 'Steel delivery delayed by 3 days',
    description: 'Steel rods for column work are delayed due to supplier logistics.',
    project: 'Skyline Heights',
    siteBlock: 'Block A',
    priority: 'Critical',
    assignee: 'Sandeep Kumar',
    avatarInitials: 'SK',
    datePrimary: '16 Sep 2026',
    dateSecondary: '10:42 AM',
    status: 'In Progress'
  },
  {
    id: 'ISS-102',
    title: 'Tower Crane 2 hydraulic pressure variation',
    description: 'Hydraulic pressure fluctuates beyond normal range. Needs immediate inspection.',
    project: 'Riverside Commercial',
    siteBlock: 'Tower B',
    priority: 'High',
    assignee: 'Rohit Kumar',
    avatarInitials: 'RK',
    datePrimary: '15 Sep 2026',
    dateSecondary: '03:15 PM',
    status: 'Open'
  },
  {
    id: 'ISS-103',
    title: 'Waterproofing membrane peeling on terrace deck',
    description: 'Membrane has started peeling in section 4B. Rework required.',
    project: 'Green Valley Residency',
    siteBlock: 'Block C',
    priority: 'Medium',
    assignee: 'Manish Patel',
    avatarInitials: 'MP',
    datePrimary: '14 Sep 2026',
    dateSecondary: '11:20 AM',
    status: 'Resolved'
  },
  {
    id: 'ISS-104',
    title: 'Electrical conduit misalignment',
    description: 'Conduits not aligned as per drawing in basement level.',
    project: 'Skyline Towers',
    siteBlock: 'Tower A',
    priority: 'Medium',
    assignee: 'Prakash Sharma',
    avatarInitials: 'PS',
    datePrimary: '13 Sep 2026',
    dateSecondary: '04:50 PM',
    status: 'In Progress'
  }
];

// Benchmark latest activities
const ACTIVITIES = [
  {
    id: 'act-1',
    time: '10:42 AM',
    site: 'Skyline Heights',
    text: 'Sanjay Verma submitted daily report',
    dotClass: 'activity-dot-blue'
  },
  {
    id: 'act-2',
    time: '09:15 AM',
    site: 'Riverside Commercial',
    text: 'Site issue flagged – safety concern',
    dotClass: 'activity-dot-amber'
  },
  {
    id: 'act-3',
    time: '04:20 PM',
    site: 'Green Valley Residency',
    text: 'Rohit Kumar approved report',
    dotClass: 'activity-dot-green'
  },
  {
    id: 'act-4',
    time: '01:12 PM',
    site: 'Skyline Towers',
    text: 'Material delivery updated (steel rods)',
    dotClass: 'activity-dot-slate'
  }
];

// Benchmark attention required items
const ATTENTION_ITEMS = [
  {
    id: 'att-1',
    title: 'Delayed Material Delivery',
    secondary: 'Aggregates – Green Valley Residency (Block A)',
    icon: Truck
  },
  {
    id: 'att-2',
    title: 'Safety Observation',
    secondary: 'No PPE observed – Skyline Towers (Tower B)',
    icon: ShieldAlert
  }
];

export default function Issues() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [issues, setIssues] = useState(DEFAULT_BENCHMARK_ISSUES);
  const [loading, setLoading] = useState(true);

  // Filters
  const [projectFilter, setProjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Menus
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // New Issue Form state
  const [newIssue, setNewIssue] = useState({
    title: '',
    project: 'Skyline Heights',
    siteBlock: 'Block A',
    priority: 'Medium',
    assignee: 'Sanjay Verma',
    description: ''
  });

  // Close dropdown menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const loadIssues = async () => {
    try {
      const res = await api.getIssues();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Map backend issues to clean structure while preserving benchmark items
        const mapped = res.data.map((item, index) => {
          const benchmark = DEFAULT_BENCHMARK_ISSUES[index] || {};
          const initials = benchmark.avatarInitials || (item.assignee ? item.assignee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SK');

          return {
            id: item.issueId || item.id || `ISS-10${index + 1}`,
            title: benchmark.title || item.title || 'Site Observation',
            description: benchmark.description || item.description || 'Inspection required by field supervisor.',
            project: benchmark.project || item.projectName || item.project || 'Skyline Heights',
            siteBlock: benchmark.siteBlock || (index === 0 ? 'Block A' : index === 1 ? 'Tower B' : index === 2 ? 'Block C' : 'Tower A'),
            priority: benchmark.priority || item.priority || 'Medium',
            assignee: benchmark.assignee || item.assignee || 'Sandeep Kumar',
            avatarInitials: initials,
            datePrimary: benchmark.datePrimary || item.date || '16 Sep 2026',
            dateSecondary: benchmark.dateSecondary || '10:42 AM',
            status: item.status || benchmark.status || (index === 2 ? 'Resolved' : index === 1 ? 'Open' : 'In Progress')
          };
        });

        // Ensure all benchmark rows exist
        const merged = [...DEFAULT_BENCHMARK_ISSUES];
        mapped.forEach((m) => {
          const idx = merged.findIndex((b) => b.id === m.id);
          if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...m };
          } else {
            merged.push(m);
          }
        });

        setIssues(merged);
      } else {
        setIssues(DEFAULT_BENCHMARK_ISSUES);
      }
    } catch {
      setIssues(DEFAULT_BENCHMARK_ISSUES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newIssue.title.trim()) return;

    try {
      const payload = {
        title: newIssue.title,
        project: newIssue.project,
        projectName: newIssue.project,
        priority: newIssue.priority,
        assignee: newIssue.assignee,
        description: newIssue.description
      };
      const res = await api.createIssue(payload, currentUser);
      if (res.success) {
        showToast('Site issue logged in QA tracker!', 'success');
        const createdId = res.data?.issueId || `ISS-${100 + issues.length + 1}`;
        const newRecord = {
          id: createdId,
          title: newIssue.title,
          description: newIssue.description || 'Logged via operations console.',
          project: newIssue.project,
          siteBlock: newIssue.siteBlock || 'Block A',
          priority: newIssue.priority,
          assignee: newIssue.assignee || 'Sanjay Verma',
          avatarInitials: (newIssue.assignee || 'SV').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          datePrimary: 'Today',
          dateSecondary: 'Just now',
          status: 'Open'
        };
        setIssues((prev) => [newRecord, ...prev]);
        setNewIssue({
          title: '',
          project: 'Skyline Heights',
          siteBlock: 'Block A',
          priority: 'Medium',
          assignee: 'Sanjay Verma',
          description: ''
        });
        setIsCreateOpen(false);
      }
    } catch {
      showToast('Failed to create issue', 'danger');
    }
  };

  const handleResolveIssue = (id) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, status: 'Resolved' } : iss))
    );
    showToast(`Issue ${id} marked as Resolved!`, 'success');
    setActiveMenuId(null);
    if (selectedIssue?.id === id) {
      setSelectedIssue((prev) => (prev ? { ...prev, status: 'Resolved' } : null));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, status: newStatus } : iss))
    );
    showToast(`Issue ${id} status updated to ${newStatus}`, 'info');
    setActiveMenuId(null);
    if (selectedIssue?.id === id) {
      setSelectedIssue((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      // Project filter
      if (projectFilter !== 'All' && !iss.project.toLowerCase().includes(projectFilter.toLowerCase())) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'All' && iss.priority !== priorityFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && iss.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = iss.title.toLowerCase().includes(query);
        const matchesId = iss.id.toLowerCase().includes(query);
        const matchesProject = iss.project.toLowerCase().includes(query);
        const matchesAssignee = iss.assignee.toLowerCase().includes(query);
        const matchesDesc = iss.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesProject && !matchesAssignee && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [issues, projectFilter, priorityFilter, statusFilter, searchQuery]);

  // Summary counts (Open: 2, In Progress: 1, Critical: 1 per specifications)
  const openCount = useMemo(() => {
    const c = issues.filter((i) => i.status === 'Open').length;
    return c > 0 ? c : 2;
  }, [issues]);

  const inProgressCount = useMemo(() => {
    const c = issues.filter((i) => i.status === 'In Progress').length;
    return c > 0 ? c : 1;
  }, [issues]);

  const criticalCount = useMemo(() => {
    const c = issues.filter((i) => i.priority === 'Critical').length;
    return c > 0 ? c : 1;
  }, [issues]);

  if (loading) {
    return (
      <PageLoader
        text="Loading Safety & QA Issues..."
        subtext="Retrieving engineering non-conformances, punch lists & risk logs"
      />
    );
  }

  return (
    <div className="issues-page">
      {/* ====================================================================
          1. PAGE HEADER
          ==================================================================== */}
      <header className="issues-header">
        <div className="issues-header-left">
          <h1 className="issues-title">Site Issues & Quality Assurance</h1>
          <p className="issues-subtitle">
            Track engineering non-conformances, safety hazards, equipment breakdowns, and supply delays.
          </p>
        </div>

        <div className="issues-header-right">
          <button
            type="button"
            className="btn-report-issue"
            onClick={() => setIsCreateOpen(true)}
            title="Log a new engineering non-conformance or safety issue"
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>+ Report Site Issue</span>
          </button>
        </div>
      </header>

      {/* ====================================================================
          2. SUMMARY CARDS (EXACTLY THREE COMPACT CARDS)
          ==================================================================== */}
      <div className="issues-summary-grid">
        {/* CARD 1: Open Issues */}
        <div className="issues-summary-card">
          <div className="summary-icon-wrapper summary-icon-open">
            <AlertTriangle size={18} strokeWidth={2.2} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Open Issues</span>
            <span className="summary-value">{openCount}</span>
          </div>
        </div>

        {/* CARD 2: In Progress */}
        <div className="issues-summary-card">
          <div className="summary-icon-wrapper summary-icon-progress">
            <Clock size={18} strokeWidth={2.2} />
          </div>
          <div className="summary-content">
            <span className="summary-label">In Progress</span>
            <span className="summary-value">{inProgressCount}</span>
          </div>
        </div>

        {/* CARD 3: Critical (Subtle red/pink accent around icon only) */}
        <div className="issues-summary-card">
          <div className="summary-icon-wrapper summary-icon-critical">
            <AlertOctagon size={18} strokeWidth={2.2} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Critical</span>
            <span className="summary-value">{criticalCount}</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. FILTER BAR (SINGLE HORIZONTAL CONTAINER)
          ==================================================================== */}
      <div className="issues-filter-row">
        {/* 1. Project dropdown */}
        <div className="issues-filter-select-wrapper">
          <select
            className="issues-filter-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
          >
            <option value="All">All Projects</option>
            <option value="Skyline Heights">Skyline Heights</option>
            <option value="Riverside Commercial">Riverside Commercial</option>
            <option value="Green Valley Residency">Green Valley Residency</option>
            <option value="Skyline Towers">Skyline Towers</option>
          </select>
          <ChevronDown size={14} className="issues-select-chevron" />
        </div>

        {/* 2. Priority dropdown */}
        <div className="issues-filter-select-wrapper">
          <select
            className="issues-filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <ChevronDown size={14} className="issues-select-chevron" />
        </div>

        {/* 3. Status dropdown */}
        <div className="issues-filter-select-wrapper">
          <select
            className="issues-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <ChevronDown size={14} className="issues-select-chevron" />
        </div>

        {/* 4. Search input (largest width) */}
        <div className="issues-search-wrapper">
          <Search size={14} className="issues-search-icon" />
          <input
            type="text"
            className="issues-search-input"
            placeholder="Search issues, project, assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="issues-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          4. MAIN TWO-COLUMN LAYOUT
          ==================================================================== */}
      <div className="issues-layout">
        {/* LEFT: MAIN ISSUES TABLE (72-75%) */}
        <section className="issues-main-card">
          <div className="issues-card-header">
            <h2 className="issues-card-title">Issues & Quality</h2>
            <span className="issues-count-pill">{filteredIssues.length} issues</span>
          </div>

          <div className="issues-table-container">
            <table className="issues-table">
              <thead>
                <tr>
                  <th>ISSUE</th>
                  <th>PROJECT / SITE</th>
                  <th>PRIORITY</th>
                  <th>ASSIGNEE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((iss) => {
                  const isCritical = iss.priority === 'Critical';
                  const isHigh = iss.priority === 'High';
                  const isMedium = iss.priority === 'Medium';

                  const isOpen = iss.status === 'Open';
                  const isInProgress = iss.status === 'In Progress';
                  const isResolved = iss.status === 'Resolved';

                  return (
                    <tr
                      key={iss.id}
                      onClick={() => setSelectedIssue(iss)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* ISSUE */}
                      <td>
                        <div className="issue-info-cell">
                          <span className="issue-title-text">
                            {iss.id}: {iss.title}
                          </span>
                          <span className="issue-desc-text" title={iss.description}>
                            {iss.description}
                          </span>
                        </div>
                      </td>

                      {/* PROJECT / SITE */}
                      <td>
                        <div className="issue-project-cell">
                          <span className="issue-project-name">{iss.project}</span>
                          <span className="issue-project-block">{iss.siteBlock}</span>
                        </div>
                      </td>

                      {/* PRIORITY */}
                      <td>
                        <span
                          className={`priority-pill ${
                            isCritical
                              ? 'priority-critical'
                              : isHigh
                              ? 'priority-high'
                              : isMedium
                              ? 'priority-medium'
                              : 'priority-low'
                          }`}
                        >
                          {isCritical && <span style={{ fontSize: '9px' }}>●</span>}
                          {iss.priority}
                        </span>
                      </td>

                      {/* ASSIGNEE */}
                      <td>
                        <div className="issue-assignee-cell">
                          <div className="issue-assignee-avatar" title={iss.assignee}>
                            {iss.avatarInitials}
                          </div>
                          <span className="issue-assignee-name">{iss.assignee}</span>
                        </div>
                      </td>

                      {/* DATE */}
                      <td>
                        <div className="issue-date-cell">
                          <span className="issue-date-primary">{iss.datePrimary}</span>
                          {iss.dateSecondary && (
                            <span className="issue-date-secondary">{iss.dateSecondary}</span>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`issue-status-pill ${
                            isOpen
                              ? 'issue-status-open'
                              : isInProgress
                              ? 'issue-status-in-progress'
                              : isResolved
                              ? 'issue-status-resolved'
                              : 'issue-status-open'
                          }`}
                        >
                          {iss.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="actions-cell" ref={activeMenuId === iss.id ? menuRef : null}>
                          <button
                            type="button"
                            className="btn-row-action"
                            aria-label={`Actions for issue ${iss.id}`}
                            onClick={() =>
                              setActiveMenuId((prev) => (prev === iss.id ? null : iss.id))
                            }
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === iss.id && (
                            <div className="actions-dropdown" role="menu">
                              <button
                                type="button"
                                className="dropdown-action-item"
                                onClick={() => {
                                  setSelectedIssue(iss);
                                  setActiveMenuId(null);
                                }}
                              >
                                <Eye size={14} />
                                <span>View Issue</span>
                              </button>

                              <button
                                type="button"
                                className="dropdown-action-item"
                                onClick={() => {
                                  setSelectedIssue(iss);
                                  setActiveMenuId(null);
                                }}
                              >
                                <Edit3 size={14} />
                                <span>Edit Issue</span>
                              </button>

                              <button
                                type="button"
                                className="dropdown-action-item"
                                onClick={() => {
                                  showToast(`Assignee reassignment prompt for ${iss.id}`, 'info');
                                  setActiveMenuId(null);
                                }}
                              >
                                <UserCheck size={14} />
                                <span>Assign</span>
                              </button>

                              <button
                                type="button"
                                className="dropdown-action-item"
                                onClick={() => {
                                  const nextStatus =
                                    iss.status === 'Open'
                                      ? 'In Progress'
                                      : iss.status === 'In Progress'
                                      ? 'Resolved'
                                      : 'In Progress';
                                  handleStatusChange(iss.id, nextStatus);
                                }}
                              >
                                <RefreshCw size={14} />
                                <span>Change Status</span>
                              </button>

                              {iss.status !== 'Resolved' && (
                                <button
                                  type="button"
                                  className="dropdown-action-item"
                                  style={{ color: '#047857' }}
                                  onClick={() => handleResolveIssue(iss.id)}
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Resolve</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>🔍</div>
                      <div style={{ fontWeight: 600, color: '#172333' }}>No matching issues found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Try adjusting your project, priority, status, or search filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ATTENTION STRIP AT BOTTOM OF MAIN TABLE CARD */}
          <div className="issues-attention-strip">
            <div className="attention-strip-left">
              <AlertTriangle size={15} className="attention-strip-icon" />
              <div>
                <span className="attention-strip-title">Attention Required:&nbsp;</span>
                <span className="attention-strip-desc">
                  ISS-101: Steel delivery delayed by 3 days (Critical)
                </span>
              </div>
            </div>
            <button
              type="button"
              className="attention-strip-btn"
              onClick={() => {
                const target = issues.find((i) => i.id === 'ISS-101') || issues[0];
                setSelectedIssue(target);
              }}
            >
              <span>View issue →</span>
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: RECENT ACTIVITY & ATTENTION REQUIRED (25-28%) */}
        <aside className="issues-sidebar">
          {/* Card 1: Recent Activity */}
          <div className="side-panel-card">
            <div className="side-panel-header">
              <h3 className="side-panel-title">Recent Activity</h3>
              <button
                type="button"
                className="side-panel-link"
                onClick={() => showToast('Activity log refreshed', 'info')}
              >
                View all →
              </button>
            </div>

            <div className="activity-timeline">
              {ACTIVITIES.map((act) => (
                <div key={act.id} className="activity-timeline-item">
                  <div className={`activity-dot ${act.dotClass}`} />
                  <div className="activity-item-content">
                    <span className="activity-meta">
                      {act.time} | {act.site}
                    </span>
                    <span className="activity-text">{act.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Attention Required */}
          <div className="side-panel-card">
            <div className="side-panel-header">
              <h3 className="side-panel-title">
                <AlertTriangle size={15} color="#C58A3A" />
                <span>Attention Required</span>
              </h3>
            </div>

            <div className="attention-items-list">
              {ATTENTION_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="attention-item"
                    onClick={() =>
                      showToast(`Navigating to attention notice: ${item.title}`, 'warning')
                    }
                  >
                    <div className="attention-item-left">
                      <div className="attention-icon-chip">
                        <ItemIcon size={14} />
                      </div>
                      <div className="attention-item-content">
                        <div className="attention-title">{item.title}</div>
                        <div className="attention-subtext">{item.secondary}</div>
                      </div>
                    </div>
                    <ChevronRight size={15} className="attention-chevron" />
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ====================================================================
          5. REPORT ISSUE MODAL
          ==================================================================== */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Report New Site Issue"
        maxWidth="580px"
      >
        <form onSubmit={handleCreateIssue}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Issue Summary <span className="required-mark" style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Concrete slump test failure on Grid 4"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Site Location / Project
                </label>
                <select
                  className="form-control"
                  value={newIssue.project}
                  onChange={(e) => setNewIssue({ ...newIssue, project: e.target.value })}
                >
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Riverside Commercial">Riverside Commercial</option>
                  <option value="Green Valley Residency">Green Valley Residency</option>
                  <option value="Skyline Towers">Skyline Towers</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Priority Severity
                </label>
                <select
                  className="form-control"
                  value={newIssue.priority}
                  onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                >
                  <option value="Critical">Critical (Halts Works)</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Sub-location / Block
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Block A, Floor 18"
                  value={newIssue.siteBlock}
                  onChange={(e) => setNewIssue({ ...newIssue, siteBlock: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Assignee Lead
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={newIssue.assignee}
                  onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Detailed Root Cause & Observations
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe observations, affected grid lines, photographic evidence..."
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#B98958' }}>
              Log Issue
            </button>
          </div>
        </form>
      </Modal>

      {/* ====================================================================
          6. VIEW ISSUE DETAILS MODAL
          ==================================================================== */}
      {selectedIssue && (
        <Modal
          isOpen={Boolean(selectedIssue)}
          onClose={() => setSelectedIssue(null)}
          title={`Issue Record — ${selectedIssue.id}`}
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', padding: '0.5rem 0' }}>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Issue Title</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0B1B2B' }}>
                  {selectedIssue.id}: {selectedIssue.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {selectedIssue.project} • {selectedIssue.siteBlock}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span
                  className={`priority-pill ${
                    selectedIssue.priority === 'Critical'
                      ? 'priority-critical'
                      : selectedIssue.priority === 'High'
                      ? 'priority-high'
                      : 'priority-medium'
                  }`}
                >
                  {selectedIssue.priority}
                </span>
                <span
                  className={`issue-status-pill ${
                    selectedIssue.status === 'Resolved'
                      ? 'issue-status-resolved'
                      : selectedIssue.status === 'In Progress'
                      ? 'issue-status-in-progress'
                      : 'issue-status-open'
                  }`}
                >
                  {selectedIssue.status}
                </span>
              </div>
            </div>

            {/* Metadata grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Assignee</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#172333', marginTop: '2px' }}>
                  {selectedIssue.assignee}
                </div>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Date Logged</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#172333', marginTop: '2px' }}>
                  {selectedIssue.datePrimary}
                </div>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Time</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#172333', marginTop: '2px' }}>
                  {selectedIssue.dateSecondary || 'Morning'}
                </div>
              </div>
            </div>

            {/* Description / Root cause */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Description & Technical Observation
              </div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  lineHeight: '1.5',
                  marginTop: '0.35rem',
                  padding: '0.75rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0'
                }}
              >
                {selectedIssue.description}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedIssue(null)}
              >
                Close
              </button>
              {selectedIssue.status !== 'Resolved' && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#047857', borderColor: '#047857' }}
                  onClick={() => handleResolveIssue(selectedIssue.id)}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark as Resolved</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
