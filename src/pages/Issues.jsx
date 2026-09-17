import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export default function Issues() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [newIssue, setNewIssue] = useState({
    title: '',
    project: 'Skyline Heights',
    priority: 'Medium',
    assignee: 'Sanjay Verma',
    description: ''
  });

  const loadIssues = async () => {
    try {
      const res = await api.getIssues();
      if (res.success) {
        setIssues(res.data);
      }
    } catch {
      showToast('Error loading issues', 'danger');
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

    const res = await api.createIssue(newIssue, currentUser);
    if (res.success) {
      showToast('Issue logged in QA tracker!', 'success');
      setNewIssue({
        title: '',
        project: 'Skyline Heights',
        priority: 'Medium',
        assignee: 'Sanjay Verma',
        description: ''
      });
      setIsCreateOpen(false);
      loadIssues();
    }
  };

  const filteredIssues = issues.filter((i) => {
    if (priorityFilter !== 'All' && i.priority !== priorityFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Site Quality & Issue Tracker...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="projects-header">
        <div className="projects-header-text">
          <h1>Site Issues & Quality Assurance</h1>
          <p>Track engineering non-conformances, safety hazards, equipment breakdowns, and supply delays.</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Report Site Issue
          </button>
        </div>
      </div>

      <div className="projects-controls-bar">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-dark" style={{ fontSize: '0.9rem' }}>
            Filter by Priority:
          </span>
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <span className="badge badge-neutral">{filteredIssues.length} Issues Tracked</span>
      </div>

      <div className="card">
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Issue ID & Description</th>
                <th>Project Site</th>
                <th>Priority</th>
                <th>Assignee Lead</th>
                <th>Date Logged</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((iss) => (
                <tr key={iss.id}>
                  <td>
                    <div className="font-bold text-dark">{iss.id}: {iss.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{iss.description}</div>
                  </td>
                  <td>{iss.project}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><StatusBadge status={iss.priority} /></td>
                  <td>{iss.assignee}</td>
                  <td className="text-muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{iss.date}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><StatusBadge status={iss.status} /></td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-primary font-semibold"
                      onClick={() => showToast(`Issue ${iss.id} marked as resolved!`, 'success')}
                    >
                      Resolve ✓
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Issue Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Report New Site Issue">
        <form onSubmit={handleCreateIssue}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Issue Summary <span className="required-mark">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Concrete slump test failure on Grid 4"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Site Location / Project</label>
                <select
                  className="form-control"
                  value={newIssue.project}
                  onChange={(e) => setNewIssue({ ...newIssue, project: e.target.value })}
                >
                  <option value="Skyline Heights">Skyline Heights Luxury Towers</option>
                  <option value="Metro Commercial Complex">Metro Commercial Complex</option>
                  <option value="Green Valley Residency">Green Valley Residency</option>
                  <option value="Riverside Villas & Club">Riverside Villas & Club</option>
                  <option value="Horizon Tech Park - Tower C">Horizon Tech Park - Tower C</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Severity</label>
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

            <div className="form-group">
              <label className="form-label">Assignee Lead</label>
              <input
                type="text"
                className="form-control"
                value={newIssue.assignee}
                onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Root Cause & Notes</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe observations, affected grid lines, photographic evidence..."
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Issue
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
