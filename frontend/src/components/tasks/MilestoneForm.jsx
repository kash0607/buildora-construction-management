import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

/**
 * MilestoneForm
 * Modal form for creating and editing critical path milestones.
 */
export default function MilestoneForm({
  isOpen,
  onClose,
  editingMilestone = null,
  projects = [],
  allTasks = [],
  onSubmitMilestone
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDueStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const initialForm = {
    title: '',
    description: '',
    projectId: projects[0]?.id || 'PRJ-101',
    project: projects[0]?.name || 'Skyline Heights',
    dueDate: defaultDueStr,
    status: 'Upcoming',
    progress: 0,
    responsible: 'Kashish Patel',
    relatedTaskIds: []
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingMilestone) {
      setFormData({
        title: editingMilestone.title || '',
        description: editingMilestone.description || '',
        projectId: editingMilestone.projectId || projects[0]?.id || 'PRJ-101',
        project: editingMilestone.project || projects[0]?.name || 'Skyline Heights',
        dueDate: editingMilestone.dueDate || defaultDueStr,
        status: editingMilestone.status || 'Upcoming',
        progress: editingMilestone.progress !== undefined ? editingMilestone.progress : 0,
        responsible: editingMilestone.responsible || 'Kashish Patel',
        relatedTaskIds: editingMilestone.relatedTaskIds || []
      });
    } else {
      setFormData({
        ...initialForm,
        projectId: projects[0]?.id || 'PRJ-101',
        project: projects[0]?.name || 'Skyline Heights'
      });
    }
    setErrors({});
  }, [editingMilestone, isOpen, projects]);

  const handleStatusChange = (newStatus) => {
    let newProgress = formData.progress;
    if (newStatus === 'Completed') newProgress = 100;
    setFormData({ ...formData, status: newStatus, progress: newProgress });
  };

  const handleProgressChange = (val) => {
    const p = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    let newStatus = formData.status;
    if (p === 100) newStatus = 'Completed';
    else if (p > 0 && formData.status === 'Upcoming') newStatus = 'In Progress';
    setFormData({ ...formData, progress: p, status: newStatus });
  };

  const handleToggleTask = (taskId) => {
    const cur = formData.relatedTaskIds || [];
    if (cur.includes(taskId)) {
      setFormData({ ...formData, relatedTaskIds: cur.filter((id) => id !== taskId) });
    } else {
      setFormData({ ...formData, relatedTaskIds: [...cur, taskId] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!formData.title.trim()) {
      validationErrors.title = 'Milestone title is required.';
    }
    if (formData.progress < 0 || formData.progress > 100) {
      validationErrors.progress = 'Progress must be between 0 and 100.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmitMilestone(formData);
  };

  const projectTasks = allTasks.filter((t) => t.projectId === formData.projectId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMilestone ? `Edit Milestone: ${editingMilestone.id}` : 'Create Baseline Project Milestone'}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="task-form-modal-body">
          {/* Milestone Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="mls-title">
              Milestone Title <span className="required-mark">*</span>
            </label>
            <input
              id="mls-title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Tower A - 18th Floor Slab Casting"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              required
            />
            {errors.title && <span className="field-error-text">{errors.title}</span>}
          </div>

          {/* Scope / Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="mls-desc">
              Deliverable Scope & Benchmark Criteria
            </label>
            <textarea
              id="mls-desc"
              className="form-control"
              rows="2"
              placeholder="Engineering gateway requirements, quality compliance checks..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Project & Responsible Lead */}
          <div className="form-row-grid two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="mls-project">
                Target Project
              </label>
              <select
                id="mls-project"
                className="form-control"
                value={formData.projectId}
                onChange={(e) => {
                  const sel = projects.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    projectId: e.target.value,
                    project: sel ? sel.name : formData.project,
                    relatedTaskIds: []
                  });
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mls-responsible">
                Responsible Lead
              </label>
              <input
                id="mls-responsible"
                type="text"
                className="form-control"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              />
            </div>
          </div>

          {/* Date, Status, Progress */}
          <div className="form-row-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="mls-due">
                Target Due Date
              </label>
              <input
                id="mls-due"
                type="date"
                className="form-control"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mls-status">
                Status
              </label>
              <select
                id="mls-status"
                className="form-control"
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mls-progress">
                Progress: {formData.progress}%
              </label>
              <input
                id="mls-progress"
                type="number"
                min="0"
                max="100"
                className="form-control"
                value={formData.progress}
                onChange={(e) => handleProgressChange(e.target.value)}
              />
            </div>
          </div>

          {/* Linked Tasks */}
          <div className="form-group">
            <label className="form-label">
              Linked Work Deliverables ({formData.relatedTaskIds?.length || 0} selected)
            </label>
            <div className="prereq-picker-box" style={{ maxHeight: '110px' }}>
              {projectTasks.length === 0 ? (
                <div className="prereq-empty-message">No tasks in this project to link.</div>
              ) : (
                projectTasks.map((t) => {
                  const isChecked = formData.relatedTaskIds?.includes(t.id);
                  return (
                    <label key={t.id} className={`prereq-checkbox-label ${isChecked ? 'is-selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTask(t.id)}
                      />
                      <span className="prereq-task-id">{t.id}</span>
                      <span className="prereq-task-title">{t.title}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer flex items-center justify-between">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {editingMilestone ? 'Save Milestone' : 'Create Milestone'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
