import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import EditProjectModal from '../components/modals/EditProjectModal';
import Modal from '../components/common/Modal';

export default function Projects() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and view mode
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [managerFilter, setManagerFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [archivingProject, setArchivingProject] = useState(null);

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      if (res.success) {
        setProjects(res.data);
      }
    } catch {
      showToast('Error loading projects list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();

    const handleDataChange = () => loadProjects();
    window.addEventListener('buildora-data-changed', handleDataChange);
    return () => window.removeEventListener('buildora-data-changed', handleDataChange);
  }, []);

  // Filter options derived from project data
  const managers = useMemo(() => {
    const list = [...new Set(projects.map((p) => p.manager).filter(Boolean))];
    return list;
  }, [projects]);

  const locations = useMemo(() => {
    const list = [
      ...new Set(
        projects
          .map((p) => (p.location.includes(',') ? p.location.split(',')[1].trim() : p.location.trim()))
          .filter(Boolean)
      )
    ];
    return list;
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.manager.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'All' && p.status !== statusFilter) {
        return false;
      }

      // Manager
      if (managerFilter !== 'All' && p.manager !== managerFilter) {
        return false;
      }

      // Location
      if (locationFilter !== 'All' && !p.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [projects, search, statusFilter, managerFilter, locationFilter]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setManagerFilter('All');
    setLocationFilter('All');
  };

  const handleArchiveConfirm = async () => {
    if (!archivingProject) return;
    const res = await api.archiveProject(archivingProject.id);
    if (res.success) {
      showToast(`Project "${archivingProject.name}" has been archived.`, 'info');
      setArchivingProject(null);
      loadProjects();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Projects Portfolio...</h3>
      </div>
    );
  }

  return (
    <>
      {/* Projects Page Header */}
      <div className="projects-header">
        <div className="projects-header-text">
          <h1>Projects Directory</h1>
          <p>Manage construction projects, timelines, budgets and engineering teams.</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Create Project
          </button>
        </div>
      </div>

      {/* Controls, Search & Filter Bar */}
      <div className="projects-controls-bar">
        <div className="projects-search-filter-group">
          {/* Search Input */}
          <div className="search-box" style={{ display: 'flex' }}>
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search projects, clients, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '260px' }}
            />
          </div>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>

          {/* Manager Filter */}
          <select
            className="filter-select"
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
          >
            <option value="All">All Managers</option>
            {managers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            className="filter-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="All">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {/* Reset Action */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={resetFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        </div>

        {/* View Switcher */}
        <div className="view-switcher-group">
          <button
            type="button"
            className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            title="Card View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            Cards
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
            Table
          </button>
        </div>
      </div>

      {/* Dynamic Projects Content */}
      <div id="projects-display-container">
        {filteredProjects.length === 0 ? (
          <div className="empty-state" style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <div className="empty-state-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
            <div className="empty-state-title">No Projects Found</div>
            <div className="empty-state-desc">No construction projects match your search or filter criteria. Try adjusting your query or create a new project.</div>
            <div className="flex gap-3">
              <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
                Reset Filters
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsCreateOpen(true)}>
                + Create Project
              </button>
            </div>
          </div>
        ) : viewMode === 'card' ? (
          <div className="projects-cards-grid">
            {filteredProjects.map((p) => {
              const budgetCr = '₹' + (p.budget / 10000000).toFixed(1) + ' Cr';
              const spentCr = '₹' + ((p.actualCost || 0) / 10000000).toFixed(1) + ' Cr';

              return (
                <div key={p.id} className="project-card">
                  <div className="project-card-image-wrap">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="project-card-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="project-card-status-overlay">
                      <StatusBadge status={p.status} />
                    </div>
                  </div>

                  <div className="project-card-body">
                    <div className="project-card-title-group">
                      <h3 className="project-card-title">{p.name}</h3>
                      <div className="project-card-client-loc">
                        <span>🏢 {p.client}</span> • <span>📍 {p.location}</span>
                      </div>
                    </div>

                    <div className="project-card-progress-section">
                      <div className="flex items-center justify-between" style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                        <span className="text-muted">Completion</span>
                        <span className="font-bold text-dark">{p.progress}%</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill primary" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>

                    <div className="project-card-stats-grid">
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Total Budget</div>
                        <div className="font-bold text-dark" style={{ fontSize: '0.88rem' }}>{budgetCr}</div>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Incurred</div>
                        <div className="font-bold text-dark" style={{ fontSize: '0.88rem' }}>{spentCr}</div>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Workforce</div>
                        <div className="font-bold text-dark" style={{ fontSize: '0.88rem' }}>{p.workersOnSite || 0} Men</div>
                      </div>
                    </div>

                    <div className="project-card-footer">
                      <div className="project-card-lead">
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>Lead PM:</span>
                        <span className="font-semibold text-dark" style={{ fontSize: '0.78rem', marginLeft: '0.25rem' }}>
                          {p.manager}
                        </span>
                      </div>

                      <div className="project-card-actions">
                        <button
                          type="button"
                          className="btn-icon-sm"
                          title="Edit Project"
                          onClick={() => setEditingProject(p)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button
                          type="button"
                          className="btn-icon-sm"
                          title="Archive Project"
                          onClick={() => setArchivingProject(p)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" x2="14" y1="12" y2="12"/></svg>
                        </button>
                        <Link to={`/projects/${p.id}`} className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                          Open →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Project & Client</th>
                    <th>Site Location</th>
                    <th>Project Manager</th>
                    <th>Target Handover</th>
                    <th>Progress</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => {
                    const budgetCr = '₹' + (p.budget / 10000000).toFixed(1) + ' Cr';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="font-semibold text-dark">{p.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.client}</div>
                        </td>
                        <td>{p.location}</td>
                        <td>{p.manager}</td>
                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>{p.deadline}</td>
                        <td style={{ minWidth: '130px' }}>
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="btn-icon-sm"
                              title="Edit Project"
                              onClick={() => setEditingProject(p)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <Link to={`/projects/${p.id}`} className="btn btn-ghost btn-sm text-primary font-semibold">
                              Open Workspace →
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
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={() => loadProjects()}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onProjectUpdated={() => loadProjects()}
      />

      {/* Archive Project Confirmation Modal */}
      <Modal
        isOpen={!!archivingProject}
        onClose={() => setArchivingProject(null)}
        title="Archive Construction Project"
        maxWidth="480px"
      >
        <div className="modal-body">
          <p>
            Are you sure you want to archive <strong>{archivingProject?.name}</strong>?
          </p>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Archiving moves the project off active telemetry while retaining historical site logs, financial audit trails, and document vaults.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={() => setArchivingProject(null)}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleArchiveConfirm}>
            Archive Project
          </button>
        </div>
      </Modal>
    </>
  );
}
