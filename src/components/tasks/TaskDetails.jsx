import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import DependencyIndicator from './DependencyIndicator';
import {
  Calendar,
  Clock,
  User,
  Building,
  Flag,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Trash2,
  ArrowRight
} from 'lucide-react';

/**
 * TaskDetails
 * Comprehensive operational view for inspecting a task's full specification,
 * assignee, timeline dates, progress, prerequisite chain status, and quick actions.
 */
export default function TaskDetails({
  isOpen,
  onClose,
  task,
  allTasks = [],
  todayStr,
  onOpenEdit,
  onOpenArchive,
  onStatusChange
}) {
  if (!task) return null;

  const isOverdue =
    task.isOverdue ||
    (task.dueDate && task.dueDate < todayStr && task.status !== 'Completed');

  const STATUS_OPTIONS = ['To Do', 'In Progress', 'Review', 'Blocked', 'Completed'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Task Specification: ${task.id}`}
      maxWidth="680px"
    >
      <div className="task-details-modal-body">
        {/* 1. Overdue Critical Alert Banner */}
        {isOverdue && (
          <div className="task-overdue-alert-banner" role="alert">
            <AlertTriangle size={18} className="alert-icon" />
            <div>
              <strong>Schedule Slippage Warning:</strong> Target completion date was{' '}
              <strong>{task.dueDate}</strong>. Immediate supervisory attention requested.
            </div>
          </div>
        )}

        {/* 2. Top Header: Project & Title */}
        <div className="task-detail-header-block">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="task-detail-project-tag">
              <Building size={12} />
              {task.project} ({task.projectId})
            </span>
            <StatusBadge status={task.status} />
            <StatusBadge status={task.priority} />
          </div>

          <h3 className="task-detail-title-text">{task.title}</h3>

          <p className="task-detail-scope-text">
            {task.description || 'No specific engineering scope or contractor notes provided.'}
          </p>
        </div>

        {/* 3. Core Operational Metrics Grid */}
        <div className="task-detail-spec-grid">
          <div className="spec-card">
            <span className="spec-label">Assignee / Lead</span>
            <div className="spec-value flex items-center gap-1.5">
              <div className="spec-avatar">
                {task.assignee
                  ? task.assignee
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                  : 'U'}
              </div>
              <span>{task.assignee || 'Unassigned'}</span>
            </div>
          </div>

          <div className="spec-card">
            <span className="spec-label">Target Completion</span>
            <div className={`spec-value flex items-center gap-1.5 ${isOverdue ? 'text-danger font-bold' : ''}`}>
              <Calendar size={14} className="text-muted" />
              <span>{task.dueDate || '—'}</span>
            </div>
          </div>

          <div className="spec-card">
            <span className="spec-label">Start Date</span>
            <div className="spec-value flex items-center gap-1.5">
              <Clock size={14} className="text-muted" />
              <span>{task.startDate || '—'}</span>
            </div>
          </div>

          <div className="spec-card">
            <span className="spec-label">Quick Workflow Move</span>
            <select
              className="form-control spec-select"
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              aria-label="Update task status"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Execution Progress Section */}
        <div className="task-detail-progress-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted">Execution & Verification Progress</span>
            <span
              className={`text-sm font-bold ${task.progress === 100 ? 'text-success' : 'text-primary'}`}
            >
              {task.progress}%
            </span>
          </div>
          <div className="detail-progress-track">
            <div
              className={`detail-progress-fill ${task.progress === 100 ? 'is-complete' : ''}`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* 5. Prerequisite Dependencies Section */}
        <div className="task-detail-deps-card">
          <DependencyIndicator
            dependencies={task.dependencies}
            allTasks={allTasks}
            status={task.status}
            compact={false}
            onSelectTask={(depId) => {
              const found = allTasks.find((t) => t.id === depId);
              if (found && onOpenEdit) {
                // If needed, could switch viewed task
              }
            }}
          />
        </div>

        {/* 6. Audit Timestamps */}
        <div className="task-detail-audit-footer">
          <span>Created: {task.createdAt || 'N/A'}</span>
          <span>Last Updated: {task.updatedAt || 'N/A'}</span>
        </div>
      </div>

      {/* Modal Actions Footer */}
      <div className="modal-footer flex items-center justify-between">
        <button
          type="button"
          className="btn btn-outline btn-sm text-danger"
          style={{ borderColor: 'var(--color-danger-border)' }}
          onClick={() => {
            onClose();
            onOpenArchive(task, 'task');
          }}
        >
          <Trash2 size={13} />
          <span>Archive Task</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              onClose();
              onOpenEdit(task);
            }}
          >
            <Edit3 size={13} />
            <span>Edit Specifications</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
