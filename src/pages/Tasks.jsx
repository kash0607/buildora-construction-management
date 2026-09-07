import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export default function Tasks() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    project: 'Skyline Heights',
    assignee: 'Sanjay Verma',
    priority: 'High',
    status: 'To Do',
    dueDate: '2026-09-30',
    progress: 0
  });

  const loadData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        api.getTasks(),
        api.getUpcomingMilestones()
      ]);
      if (tRes.success) setTasks(tRes.data);
      if (mRes.success) setMilestones(mRes.data);
    } catch {
      showToast('Error loading tasks', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const res = await api.createTask(newTask);
    if (res.success) {
      showToast('Task added to schedule!', 'success');
      setNewTask({
        title: '',
        project: 'Skyline Heights',
        assignee: 'Sanjay Verma',
        priority: 'High',
        status: 'To Do',
        dueDate: '2026-09-30',
        progress: 0
      });
      setIsCreateOpen(false);
      loadData();
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const res = await api.updateTaskStatus(taskId, newStatus);
    if (res.success) {
      showToast(`Task moved to ${newStatus}`, 'info');
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, progress: newStatus === 'Completed' ? 100 : t.progress } : t))
      );
    }
  };

  const columns = ['To Do', 'In Progress', 'Review', 'Completed'];

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Tasks & Milestone Schedules...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="projects-header">
        <div className="projects-header-text">
          <h1>Tasks & Milestones</h1>
          <p>Schedule task execution, critical path dependencies, and milestone tracking.</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Create Task
          </button>
        </div>
      </div>

      <div className="projects-controls-bar">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-dark" style={{ fontSize: '0.9rem' }}>
            Active Tasks: <strong>{tasks.length}</strong>
          </span>
        </div>

        <div className="view-switcher-group">
          <button
            type="button"
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            Kanban Board
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}
        >
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div
                key={col}
                className="card"
                style={{ background: 'var(--color-warm-sand)', border: '1px solid var(--color-border)' }}
              >
                <div
                  className="card-header"
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--color-warm-beige)',
                    borderBottom: '1px solid var(--color-border)'
                  }}
                >
                  <span className="font-bold text-dark" style={{ fontSize: '0.9rem' }}>
                    {col}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="card-body" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '300px' }}>
                  {colTasks.length === 0 ? (
                    <div className="text-muted" style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.8rem' }}>
                      No tasks in {col}
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="card"
                        style={{
                          padding: '0.85rem',
                          background: 'var(--color-white)',
                          boxShadow: 'var(--shadow-sm)',
                          border: '1px solid var(--color-border-subtle)'
                        }}
                      >
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>{t.project}</span>
                          <StatusBadge status={t.priority} />
                        </div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>{t.title}</h4>
                        <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                          👤 {t.assignee} • 📅 {t.dueDate}
                        </div>
                        <div className="progress-bar-wrap" style={{ height: '5px', marginBottom: '0.6rem' }}>
                          <div className="progress-bar-fill primary" style={{ width: `${t.progress}%` }} />
                        </div>

                        {/* Move Status quick trigger */}
                        <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Move:</span>
                          <select
                            style={{ fontSize: '0.72rem', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            value={t.status}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          >
                            {columns.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="font-semibold text-dark">{t.title}</td>
                    <td>{t.project}</td>
                    <td>{t.assignee}</td>
                    <td><StatusBadge status={t.priority} /></td>
                    <td>{t.dueDate}</td>
                    <td>{t.progress}%</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <select
                        style={{ fontSize: '0.75rem', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      >
                        {columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Milestones Schedule Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Active Milestone Deliverables</div>
            <div className="card-subtitle">Major engineering gateways tracked across all sites</div>
          </div>
        </div>
        <div className="card-body">
          <div className="milestones-timeline">
            {milestones.map((m) => (
              <div key={m.id} className="milestone-timeline-item">
                <div className={`milestone-bullet ${m.status === 'Completed' ? 'completed' : 'active'}`} />
                <div className="milestone-timeline-content">
                  <div className="flex items-center justify-between">
                    <div className="milestone-timeline-title">{m.title}</div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{m.dueDate}</span>
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

      {/* Create Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Task Title <span className="required-mark">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Electrical Conduit Rough-in Floor 8"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project</label>
                <select
                  className="form-control"
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                >
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Metro Commercial Complex">Metro Commercial Complex</option>
                  <option value="Green Valley Residency">Green Valley Residency</option>
                  <option value="Riverside Villas & Club">Riverside Villas & Club</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <input
                  type="text"
                  className="form-control"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row three-col">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
