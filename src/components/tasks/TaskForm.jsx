import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Link2, AlertCircle } from 'lucide-react';

/**
 * TaskForm
 * Structured, accessible modal form for creating or editing tasks.
 * Organized into clear semantic construction operational sections:
 * 1. Basic Info
 * 2. Assignment & Status
 * 3. Schedule Timeline
 * 4. Completion Progress
 * 5. Prerequisite Dependencies
 */
export default function TaskForm({
  isOpen,
  onClose,
  editingTask = null,
  projects = [],
  allTasks = [],
  onSubmitTask
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDueStr = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const initialForm = {
    title: '',
    description: '',
    projectId: projects[0]?.id || 'PRJ-101',
    project: projects[0]?.name || 'Skyline Heights',
    assignee: 'Sanjay Verma',
    priority: 'Medium',
    status: 'To Do',
    startDate: todayStr,
    dueDate: defaultDueStr,
    progress: 0,
    dependencies: []
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        projectId: editingTask.projectId || projects[0]?.id || 'PRJ-101',
        project: editingTask.project || projects[0]?.name || 'Skyline Heights',
        assignee: editingTask.assignee || 'Sanjay Verma',
        priority: editingTask.priority || 'Medium',
        status: editingTask.status === 'Not Started' ? 'To Do' : (editingTask.status || 'To Do'),
        startDate: editingTask.startDate || todayStr,
        dueDate: editingTask.dueDate || defaultDueStr,
        progress: editingTask.progress !== undefined ? editingTask.progress : 0,
        dependencies: Array.isArray(editingTask.dependencies) ? editingTask.dependencies : []
      });
    } else {
      setFormData({
        ...initialForm,
        projectId: projects[0]?.id || 'PRJ-101',
        project: projects[0]?.name || 'Skyline Heights'
      });
    }
    setErrors({});
  }, [editingTask, isOpen, projects]);

  // Handle status change with smart progress adjustment
  const handleStatusChange = (newStatus) => {
    let newProgress = formData.progress;
    if (newStatus === 'Completed') {
      newProgress = 100;
    } else if (newStatus === 'To Do' && newProgress === 100) {
      newProgress = 0;
    }
    setFormData({ ...formData, status: newStatus, progress: newProgress });
  };

  // Handle progress change with smart status adjustment
  const handleProgressChange = (newProgressVal) => {
    const val = Math.max(0, Math.min(100, parseInt(newProgressVal, 10) || 0));
    let newStatus = formData.status;
    if (val === 100) {
      newStatus = 'Completed';
    } else if (val > 0 && formData.status === 'To Do') {
      newStatus = 'In Progress';
    } else if (val === 0 && formData.status === 'Completed') {
      newStatus = 'To Do';
    }
    setFormData({ ...formData, progress: val, status: newStatus });
  };

  // Project change resets dependencies
  const handleProjectChange = (projectId) => {
    const selected = projects.find((p) => p.id === projectId);
    setFormData({
      ...formData,
      projectId,
      project: selected ? selected.name : formData.project,
      dependencies: []
    });
  };

  // Toggle dependency
  const handleToggleDependency = (taskId) => {
    const current = formData.dependencies || [];
    if (current.includes(taskId)) {
      setFormData({ ...formData, dependencies: current.filter((id) => id !== taskId) });
    } else {
      setFormData({ ...formData, dependencies: [...current, taskId] });
    }
  };

  // Form submission validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!formData.title.trim()) {
      validationErrors.title = 'Task title is required.';
    }
    if (!formData.projectId) {
      validationErrors.projectId = 'Project assignment is required.';
    }
    if (formData.startDate && formData.dueDate && formData.dueDate < formData.startDate) {
      validationErrors.dueDate = 'Target due date cannot be earlier than start date.';
    }
    if (formData.progress < 0 || formData.progress > 100) {
      validationErrors.progress = 'Progress must be between 0 and 100.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmitTask(formData);
  };

  // Filter available candidate tasks for dependencies
  const availablePrerequisites = allTasks.filter(
    (t) => t.projectId === formData.projectId && (!editingTask || t.id !== editingTask.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? `Edit Task: ${editingTask.id} · ${editingTask.title}` : 'Create New Work Package / Task'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="task-form-modal-body">
          {/* Group 1: Basic Information */}
          <div className="task-form-section">
            <h5 className="form-section-title">1. Basic Information</h5>

            {/* Task Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title-input">
                Task Title <span className="required-mark">*</span>
              </label>
              <input
                id="task-title-input"
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="e.g. 18th Floor Slab Rebar Shuttering"
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
              <label className="form-label" htmlFor="task-desc-input">
                Engineering Scope & Specifications
              </label>
              <textarea
                id="task-desc-input"
                className="form-control"
                rows="2"
                placeholder="Detail contractor scope, materials grade, non-destructive test criteria..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Project Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-project-select">
                Target Project <span className="required-mark">*</span>
              </label>
              <select
                id="task-project-select"
                className="form-control"
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Group 2: Assignment & Workflow Status */}
          <div className="task-form-section">
            <h5 className="form-section-title">2. Assignment & Status</h5>
            <div className="form-row-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee-input">
                  Assignee / Site Supervisor
                </label>
                <input
                  id="task-assignee-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sanjay Verma"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-priority-select">
                  Priority Rating
                </label>
                <select
                  id="task-priority-select"
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-status-select">
                  Operational Status
                </label>
                <select
                  id="task-status-select"
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">In Review</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Group 3: Schedule Timeline */}
          <div className="task-form-section">
            <h5 className="form-section-title">3. Schedule Dates</h5>
            <div className="form-row-grid two-col">
              <div className="form-group">
                <label className="form-label" htmlFor="task-start-input">
                  Start Date
                </label>
                <input
                  id="task-start-input"
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-due-input">
                  Target Due Date <span className="required-mark">*</span>
                </label>
                <input
                  id="task-due-input"
                  type="date"
                  className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    if (errors.dueDate) setErrors({ ...errors, dueDate: null });
                  }}
                  required
                />
                {errors.dueDate && <span className="field-error-text">{errors.dueDate}</span>}
              </div>
            </div>
          </div>

          {/* Group 4: Progress Tracker */}
          <div className="task-form-section">
            <div className="flex items-center justify-between">
              <h5 className="form-section-title" style={{ margin: 0 }}>
                4. Execution Progress
              </h5>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control text-center"
                  style={{ width: '68px', padding: '0.2rem', height: '28px', fontSize: '0.85rem' }}
                  value={formData.progress}
                  onChange={(e) => handleProgressChange(e.target.value)}
                />
                <span className="text-xs font-semibold">%</span>
              </div>
            </div>

            <div style={{ marginTop: '0.6rem' }}>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="task-progress-range-slider"
                value={formData.progress}
                onChange={(e) => handleProgressChange(e.target.value)}
                aria-label="Progress percentage"
              />
              <div className="flex justify-between text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                <span>0% (Not Started)</span>
                <span>50% (In Mid-Execution)</span>
                <span>100% (Certified Complete)</span>
              </div>
            </div>
          </div>

          {/* Group 5: Prerequisite Dependencies */}
          <div className="task-form-section">
            <div className="flex items-center justify-between">
              <h5 className="form-section-title" style={{ margin: 0 }}>
                5. Prerequisite Dependencies
              </h5>
              <span className="text-xs text-muted">
                {formData.dependencies?.length || 0} selected
              </span>
            </div>
            <p className="text-xs text-muted" style={{ margin: '0.35rem 0 0.6rem' }}>
              Select tasks that must complete before this work commences on <strong>{formData.project}</strong>:
            </p>

            <div className="prereq-picker-box">
              {availablePrerequisites.length === 0 ? (
                <div className="prereq-empty-message">
                  No other tasks available in this project to link as prerequisites.
                </div>
              ) : (
                availablePrerequisites.map((cand) => {
                  const isChecked = formData.dependencies?.includes(cand.id);
                  return (
                    <label
                      key={cand.id}
                      className={`prereq-checkbox-label ${isChecked ? 'is-selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDependency(cand.id)}
                      />
                      <span className="prereq-task-id">{cand.id}</span>
                      <span className="prereq-task-title">{cand.title}</span>
                      <span className="prereq-task-status">
                        <StatusBadge status={cand.status} />
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer flex items-center justify-between">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            {editingTask ? 'Save Task Changes' : 'Create Task Deliverable'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
