import React from 'react';
import {
  Eye,
  Edit3,
  Trash2,
  AlertTriangle,
  Calendar,
  Link2
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import DependencyIndicator from './DependencyIndicator';

/**
 * TaskTable
 * High-density operational table for rapid scanning of construction activities.
 * Focuses on readable alignment, purposeful badges, explicit overdue indicators,
 * and responsive horizontal scroll.
 */
export default function TaskTable({
  tasks = [],
  allTasks = [],
  todayStr,
  onOpenDetails,
  onOpenEdit,
  onOpenArchive,
  onOpenCreateTask
}) {
  const formatReadableDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="task-table-wrapper" role="region" aria-label="Tasks List Table">
      <div className="task-table-scroll-container">
        <table className="task-ops-table">
          <thead>
            <tr>
              <th className="th-task-title">Task & Deliverable</th>
              <th className="th-project">Project</th>
              <th className="th-assignee">Assignee</th>
              <th className="th-priority">Priority</th>
              <th className="th-status">Status</th>
              <th className="th-progress">Progress</th>
              <th className="th-dates">Due Date</th>
              <th className="th-deps">Prerequisites</th>
              <th className="th-actions text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="9" className="task-empty-cell">
                  <div className="task-table-empty">
                    <p className="empty-title">No matching tasks found</p>
                    <p className="empty-subtitle">
                      Try adjusting filters or search query, or add a new task.
                    </p>
                    {onOpenCreateTask && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.75rem' }}
                        onClick={() => onOpenCreateTask()}
                      >
                        + Create New Task
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isOverdue =
                  task.isOverdue ||
                  (task.dueDate && task.dueDate < todayStr && task.status !== 'Completed');

                return (
                  <tr
                    key={task.id}
                    className={`task-row ${isOverdue ? 'row-overdue' : ''} ${task.status === 'Blocked' ? 'row-blocked' : ''}`}
                  >
                    {/* 1. Task Title & Scope Preview */}
                    <td className="td-task-title">
                      <div className="task-title-stack">
                        <span
                          className="task-title-text"
                          onClick={() => onOpenDetails(task)}
                          title="View task details"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') onOpenDetails(task);
                          }}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="task-desc-line" title={task.description}>
                            {task.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Project Name */}
                    <td className="td-project">
                      <span className="task-project-text" title={task.project}>
                        {task.project}
                      </span>
                    </td>

                    {/* 3. Assignee */}
                    <td className="td-assignee">
                      <div className="task-assignee-cell">
                        <div className="task-table-avatar">
                          {task.assignee
                            ? task.assignee
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                            : 'U'}
                        </div>
                        <span className="task-assignee-text">{task.assignee || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* 4. Priority */}
                    <td className="td-priority">
                      <StatusBadge status={task.priority} />
                    </td>

                    {/* 5. Status */}
                    <td className="td-status">
                      <StatusBadge status={task.status} />
                    </td>

                    {/* 6. Progress Bar */}
                    <td className="td-progress">
                      <div className="table-progress-cell">
                        <div className="table-progress-bar">
                          <div
                            className={`table-progress-fill ${task.progress === 100 ? 'is-complete' : ''}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="table-progress-text">{task.progress}%</span>
                      </div>
                    </td>

                    {/* 7. Due Date with Overdue clarity */}
                    <td className="td-dates">
                      {isOverdue ? (
                        <div className="table-overdue-badge" title={`Overdue since ${task.dueDate}`}>
                          <AlertTriangle size={12} />
                          <span>Overdue · {formatReadableDate(task.dueDate)}</span>
                        </div>
                      ) : (
                        <div className="table-date-normal">
                          <Calendar size={12} className="text-muted" />
                          <span>{formatReadableDate(task.dueDate)}</span>
                        </div>
                      )}
                    </td>

                    {/* 8. Dependencies */}
                    <td className="td-deps">
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
                    </td>

                    {/* 9. Actions */}
                    <td className="td-actions text-right">
                      <div className="table-actions-cluster">
                        <button
                          type="button"
                          className="table-action-icon"
                          title="View Details"
                          onClick={() => onOpenDetails(task)}
                          aria-label="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="table-action-icon"
                          title="Edit Task"
                          onClick={() => onOpenEdit(task)}
                          aria-label="Edit Task"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          className="table-action-icon delete"
                          title="Archive Task"
                          onClick={() => onOpenArchive(task, 'task')}
                          aria-label="Archive Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
