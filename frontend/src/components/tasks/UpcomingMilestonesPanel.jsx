import React from 'react';
import { Flag, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

/**
 * UpcomingMilestonesPanel
 * Right-column compact panel displaying the next critical project milestones.
 */
export default function UpcomingMilestonesPanel({
  milestones = [],
  projects = [],
  onViewAll,
  onOpenMilestone
}) {
  const displayMilestones = milestones.slice(0, 5);

  const getProjectName = (projIdOrName) => {
    if (!projIdOrName) return 'Project Site';
    const found = projects.find(
      (p) => p.id === projIdOrName || p._id === projIdOrName || p.name === projIdOrName
    );
    return found ? found.name : projIdOrName;
  };

  const formatReadableDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    try {
      const parts = String(dateStr).split('T')[0].split('-');
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
    <div className="card task-side-card" role="region" aria-label="Upcoming Project Milestones">
      <div className="task-side-card-header">
        <div className="side-card-title-group">
          <Flag size={16} className="text-accent" aria-hidden="true" />
          <h3 className="side-card-title">Upcoming Milestones</h3>
        </div>
        {onViewAll && (
          <button
            type="button"
            className="btn-view-all-link"
            onClick={onViewAll}
            title="Switch to Milestones tab"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      <div className="task-side-card-body">
        {displayMilestones.length === 0 ? (
          <p className="side-empty-text">No active upcoming milestones.</p>
        ) : (
          <div className="milestones-timeline-list">
            {displayMilestones.map((m, index) => {
              const statusStr = m.status || 'Upcoming';
              return (
                <div
                  key={m.id || index}
                  className="milestone-timeline-item"
                  onClick={() => onOpenMilestone && onOpenMilestone(m)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="milestone-timeline-indicator">
                    <div className={`timeline-dot ${statusStr === 'Completed' ? 'is-complete' : ''}`} />
                    {index < displayMilestones.length - 1 && <div className="timeline-connector" />}
                  </div>

                  <div className="milestone-timeline-content">
                    <div className="milestone-item-top">
                      <span className="milestone-item-title" title={m.title}>
                        {m.title}
                      </span>
                    </div>

                    <div className="milestone-item-meta">
                      <span className="milestone-item-project">
                        {getProjectName(m.projectId || m.project)}
                      </span>
                    </div>

                    <div className="milestone-item-footer">
                      <span className="milestone-item-date">
                        {formatReadableDate(m.dueDate)}
                      </span>
                      <StatusBadge status={statusStr} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
