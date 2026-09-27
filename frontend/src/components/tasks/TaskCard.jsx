import React from 'react';
import {
  Calendar,
  AlertTriangle,
  Edit3,
  Trash2,
  Eye,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import DependencyIndicator from './DependencyIndicator';

/**
 * TaskCard
 * Polished Kanban task card for construction operations.
 * Strong title hierarchy, scannable badges, explicit overdue indicators,
 * progress bar, blocker reason, and quick status workflow transitions.
 */
export default function TaskCard({
  task,
  allTasks = [],
  todayStr,
  onOpenDetails,
  onOpenEdit,
  onOpenArchive,
  onStatusChange,
  statusColumns = []
}) {
  const isOverdue = task.isOverdue || (task.dueDate && task.dueDate < todayStr && task.status !== 'Completed');

  // Format date readable: e.g. "Sep 8"
  const formatReadableDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formattedDueDate = formatReadableDate(task.dueDate);

  return (
    <div
      className={`task-kanban-card ${isOverdue ? 'is-card-overdue' : ''} ${task.status === 'Blocked' ? 'is-card-blocked' : ''}`}
      role="article"
      aria-label={`Task ${task.title}`}
    >
      {/* Top Meta: Project Pill & Priority */}
      <div className="kanban-card-header">
        <span className="kanban-project-tag" title={task.project}>
          {task.project}
        </span>
        <StatusBadge status={task.priority} />
      </div>

      {/* Title - Strongest visual anchor */}
      <h4
        className="kanban-task-title"
        onClick={() => onOpenDetails(task)}
        title="View task specifications"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onOpenDetails(task);
        }}
      >
        {task.title}
      </h4>

      {/* Description Snippet if available */}
      {task.description && (
        <p className="kanban-task-desc" title={task.description}>
          {task.description}
        </p>
      )}

      {/* Execution Progress Bar */}
      <div className="kanban-progress-track">
        <div className="kanban-progress-label">
          <span>Progress</span>
          <span className="font-semibold">{task.progress}%</span>
        </div>
        <div className="kanban-progress-bar">
          <div
            className={`kanban-progress-fill ${task.progress === 100 ? 'is-complete' : ''}`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Dependency / Blocker Row */}
      {(task.dependencies?.length > 0 || task.status === 'Blocked') && (
        <div className="kanban-card-dependency-box">
          <DependencyIndicator
            dependencies={task.dependencies}
            allTasks={allTasks}
            status={task.status}
            compact={true}
            onSelectTask={(depId) => {
              const dep = allTasks.find((t) => t.id === depId);
              if (dep && onOpenDetails) onOpenDetails(dep);
            }}
          />
        </div>
      )}

      {/* Assignee & Due Date Meta */}
      <div className="kanban-card-footer">
        <div className="kanban-assignee-info" title={`Assigned to ${task.assignee || 'Unassigned'}`}>
          <div className="kanban-avatar-circle">
            {task.assignee ? task.assignee.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'U'}
          </div>
          <span className="kanban-assignee-name">{task.assignee || 'Unassigned'}</span>
        </div>

        {/* Due Date Indicator */}
        {isOverdue ? (
          <span className="kanban-overdue-pill" title={`Overdue since ${task.dueDate}`}>
            <AlertTriangle size={11} />
            <span>Overdue · {formattedDueDate}</span>
          </span>
        ) : (
          <span className="kanban-date-text" title={`Target due date: ${task.dueDate}`}>
            <Calendar size={11} />
            <span>{formattedDueDate}</span>
          </span>
        )}
      </div>

      {/* Quick Move & Action Bar */}
      <div className="kanban-card-actions-bar">
        <div className="kanban-move-control">
          <label htmlFor={`move-status-${task.id}`} className="sr-only">Move Status</label>
          <select
            id={`move-status-${task.id}`}
            className="kanban-move-select"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            title="Move to another status column"
          >
            {statusColumns.map((col) => (
              <option key={col} value={col}>
                Move: {col}
              </option>
            ))}
          </select>
        </div>

        <div className="kanban-icon-actions">
          <button
            type="button"
            className="kanban-action-btn"
            onClick={() => onOpenDetails(task)}
            title="View Details"
            aria-label="View Details"
          >
            <Eye size={13} />
          </button>
          <button
            type="button"
            className="kanban-action-btn"
            onClick={() => onOpenEdit(task)}
            title="Edit Task"
            aria-label="Edit Task"
          >
            <Edit3 size={13} />
          </button>
          <button
            type="button"
            className="kanban-action-btn delete-btn"
            onClick={() => onOpenArchive(task, 'task')}
            title="Archive Task"
            aria-label="Archive Task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
