import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function TaskTable({
  tasks = [],
  allTasks = [],
  projects = [],
  todayStr,
  onOpenDetails,
  onOpenEdit,
  onOpenArchive,
  onOpenCreateTask,
  onStatusChange
}) {
  const [activeMenuTaskId, setActiveMenuTaskId] = useState(null);
  const menuRef = useRef(null);

  const getProjectName = (projIdOrName) => {
    if (!projIdOrName) return 'Main Site';
    const found = projects.find(
      (p) => p.id === projIdOrName || p._id === projIdOrName || p.name === projIdOrName
    );
    return found ? found.name : projIdOrName;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuTaskId(null);
      }
    }
    if (activeMenuTaskId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuTaskId]);

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

  // Helper for priority badge styling
  const renderPriorityBadge = (priority) => {
    const p = (priority || 'Medium').toLowerCase();
    let badgeClass = 'priority-pill-medium';
    if (p === 'critical') badgeClass = 'priority-pill-critical';
    else if (p === 'high') badgeClass = 'priority-pill-high';
    else if (p === 'low') badgeClass = 'priority-pill-low';

    return <span className={`priority-pill ${badgeClass}`}>{priority || 'Medium'}</span>;
  };

  // Helper for status badge styling
  const renderStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    let badgeClass = 'status-pill-pending';
    if (s === 'completed') badgeClass = 'status-pill-completed';
    else if (s === 'in progress') badgeClass = 'status-pill-progress';
    else if (s === 'overdue') badgeClass = 'status-pill-overdue';
    else if (s === 'blocked') badgeClass = 'status-pill-blocked';
    else if (s === 'review') badgeClass = 'status-pill-review';

    return <span className={`status-pill ${badgeClass}`}>{status || 'Pending'}</span>;
  };

  return (
    <div className="task-table-card" role="region" aria-label="Task Management Table">
      <div className="task-table-wrapper">
        <table className="task-table-clean">
          <thead>
            <tr>
              <th className="th-task">TASK / MILESTONE</th>
              <th className="th-project">PROJECT / SITE</th>
              <th className="th-assignee">ASSIGNEE</th>
              <th className="th-priority">PRIORITY</th>
              <th className="th-status">STATUS</th>
              <th className="th-progress">PROGRESS</th>
              <th className="th-due">DUE DATE</th>
              <th className="th-actions text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty-cell">
                  <div className="empty-tasks-box">
                    <p className="empty-title">No matching tasks found</p>
                    <p className="empty-desc">
                      Try adjusting filters or search query, or add a new site task.
                    </p>
                    {onOpenCreateTask && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.65rem' }}
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

                const initials = task.assignee
                  ? task.assignee
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'UN';

                const isMenuOpen = activeMenuTaskId === task.id;

                return (
                  <tr key={task.id} className={`task-row-clean ${isOverdue ? 'is-overdue' : ''}`}>
                    {/* 1. Task Title & 1-line description */}
                    <td className="td-task">
                      <div className="task-title-group">
                        <span
                          className="task-main-title"
                          onClick={() => onOpenDetails(task)}
                          role="button"
                          tabIndex={0}
                          title={task.title}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="task-short-desc" title={task.description}>
                            {task.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Project / Site */}
                    <td className="td-project">
                      <div className="project-cell-group">
                        <span className="project-title" title={getProjectName(task.projectId || task.project)}>
                          {getProjectName(task.projectId || task.project)}
                        </span>
                        {task.siteBlock && (
                          <span className="project-site-sub">{task.siteBlock}</span>
                        )}
                      </div>
                    </td>

                    {/* 3. Assignee Avatar + Name */}
                    <td className="td-assignee">
                      <div className="assignee-cell-group">
                        <div className="assignee-avatar-circle" title={task.assignee || 'Unassigned'}>
                          {initials}
                        </div>
                        <div className="assignee-name-group">
                          <span className="assignee-name">{task.assignee || 'Unassigned'}</span>
                          {task.role && <span className="assignee-role-sub">{task.role}</span>}
                        </div>
                      </div>
                    </td>

                    {/* 4. Priority Badge */}
                    <td className="td-priority">
                      {renderPriorityBadge(task.priority)}
                    </td>

                    {/* 5. Status Badge */}
                    <td className="td-status">
                      {renderStatusBadge(task.status)}
                    </td>

                    {/* 6. Subtle Progress Bar */}
                    <td className="td-progress">
                      <div className="progress-inline-group">
                        <div className="progress-line-track">
                          <div
                            className={`progress-line-fill ${task.progress === 100 || task.status === 'Completed' ? 'fill-completed' : ''}`}
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="progress-percent-text">{task.progress || 0}%</span>
                      </div>
                    </td>

                    {/* 7. Due Date */}
                    <td className="td-due">
                      {isOverdue ? (
                        <span className="due-date-overdue" title={`Overdue since ${task.dueDate}`}>
                          Overdue · {formatReadableDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="due-date-clean">
                          {formatReadableDate(task.dueDate)}
                        </span>
                      )}
                    </td>

                    {/* 8. Actions (Compact ••• overflow menu) */}
                    <td className="td-actions text-right">
                      <div className="action-menu-anchor" style={{ position: 'relative' }}>
                        <button
                          type="button"
                          className="btn-overflow-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTaskId(isMenuOpen ? null : task.id);
                          }}
                          aria-label={`Actions for ${task.title}`}
                          title="Actions menu"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {isMenuOpen && (
                          <div className="overflow-dropdown-menu" ref={menuRef}>
                            <button
                              type="button"
                              className="menu-item-row"
                              onClick={() => {
                                setActiveMenuTaskId(null);
                                onOpenDetails(task);
                              }}
                            >
                              <Eye size={14} />
                              <span>View Details</span>
                            </button>

                            <button
                              type="button"
                              className="menu-item-row"
                              onClick={() => {
                                setActiveMenuTaskId(null);
                                onOpenEdit(task);
                              }}
                            >
                              <Edit3 size={14} />
                              <span>Edit Task</span>
                            </button>

                            {onStatusChange && task.status !== 'Completed' && (
                              <button
                                type="button"
                                className="menu-item-row text-success"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  onStatusChange(task.id, 'Completed');
                                }}
                              >
                                <CheckCircle2 size={14} />
                                <span>Mark Completed</span>
                              </button>
                            )}

                            {onStatusChange && task.status !== 'In Progress' && task.status !== 'Completed' && (
                              <button
                                type="button"
                                className="menu-item-row text-info"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  onStatusChange(task.id, 'In Progress');
                                }}
                              >
                                <Clock size={14} />
                                <span>Start Work</span>
                              </button>
                            )}

                            <div className="menu-divider" />

                            <button
                              type="button"
                              className="menu-item-row text-danger"
                              onClick={() => {
                                setActiveMenuTaskId(null);
                                onOpenArchive(task, 'task');
                              }}
                            >
                              <Trash2 size={14} />
                              <span>Delete / Archive</span>
                            </button>
                          </div>
                        )}
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
