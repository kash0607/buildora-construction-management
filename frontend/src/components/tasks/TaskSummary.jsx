import React from 'react';
import {
  Folder,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag
} from 'lucide-react';

/**
 * TaskSummary
 * Compact, lightweight horizontal KPI summary row for construction tasks & milestones.
 * 5 cards: Total Tasks, Completed, In Progress, Overdue, Milestones
 */
export default function TaskSummary({
  stats = {},
  totalMilestonesCount = 12,
  upcomingMilestonesCount = 4,
  activeFilter = 'All',
  activeMainTab = 'tasks',
  onSelectFilter,
  onSelectMilestonesTab
}) {
  const {
    total = 48,
    inProgress = 10,
    completed = 32,
    overdue = 6
  } = stats;

  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 66;
  const inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 21;
  const overduePercent = total > 0 ? Math.round((overdue / total) * 100) : 12;

  const isMilestonesTab = activeMainTab === 'milestones' || activeFilter === 'Milestones';

  const handleCardClick = (filterValue) => {
    if (filterValue === 'Milestones') {
      if (onSelectMilestonesTab) {
        onSelectMilestonesTab();
      }
    } else {
      if (onSelectFilter) {
        onSelectFilter(filterValue);
      }
    }
  };

  return (
    <div className="task-kpi-summary-row" role="region" aria-label="Tasks and Milestones KPI Summary">
      {/* 1. Total Tasks */}
      <div
        className={`task-kpi-card ${!isMilestonesTab && activeFilter === 'All' ? 'active-kpi' : ''}`}
        onClick={() => handleCardClick('All')}
        role="button"
        tabIndex={0}
        aria-label="Filter: Total Tasks"
      >
        <div className="kpi-card-header">
          <span className="kpi-card-label">Total Tasks</span>
          <div className="kpi-card-icon icon-neutral" aria-hidden="true">
            <Folder size={15} strokeWidth={2} />
          </div>
        </div>
        <div className="kpi-card-value">{total}</div>
        <div className="kpi-card-subtext">Across all projects</div>
      </div>

      {/* 2. Completed */}
      <div
        className={`task-kpi-card ${!isMilestonesTab && activeFilter === 'Completed' ? 'active-kpi' : ''}`}
        onClick={() => handleCardClick('Completed')}
        role="button"
        tabIndex={0}
        aria-label="Filter: Completed Tasks"
      >
        <div className="kpi-card-header">
          <span className="kpi-card-label">Completed</span>
          <div className="kpi-card-icon icon-success" aria-hidden="true">
            <CheckCircle2 size={15} strokeWidth={2} />
          </div>
        </div>
        <div className="kpi-card-value">{completed}</div>
        <div className="kpi-card-subtext">{completedPercent}% completion</div>
      </div>

      {/* 3. In Progress */}
      <div
        className={`task-kpi-card ${!isMilestonesTab && activeFilter === 'In Progress' ? 'active-kpi' : ''}`}
        onClick={() => handleCardClick('In Progress')}
        role="button"
        tabIndex={0}
        aria-label="Filter: In Progress Tasks"
      >
        <div className="kpi-card-header">
          <span className="kpi-card-label">In Progress</span>
          <div className="kpi-card-icon icon-info" aria-hidden="true">
            <Clock size={15} strokeWidth={2} />
          </div>
        </div>
        <div className="kpi-card-value">{inProgress}</div>
        <div className="kpi-card-subtext">{inProgressPercent}% in progress</div>
      </div>

      {/* 4. Overdue */}
      <div
        className={`task-kpi-card ${!isMilestonesTab && activeFilter === 'Overdue' ? 'active-kpi' : ''}`}
        onClick={() => handleCardClick('Overdue')}
        role="button"
        tabIndex={0}
        aria-label="Filter: Overdue Tasks"
      >
        <div className="kpi-card-header">
          <span className="kpi-card-label">Overdue</span>
          <div className="kpi-card-icon icon-danger" aria-hidden="true">
            <AlertTriangle size={15} strokeWidth={2} />
          </div>
        </div>
        <div className="kpi-card-value" style={{ color: overdue > 0 ? '#B85C55' : undefined }}>
          {overdue}
        </div>
        <div className="kpi-card-subtext">{overduePercent}% overdue</div>
      </div>

      {/* 5. Milestones */}
      <div
        className={`task-kpi-card ${isMilestonesTab ? 'active-kpi' : ''}`}
        onClick={() => handleCardClick('Milestones')}
        role="button"
        tabIndex={0}
        aria-label="Switch to Milestones Gateway"
      >
        <div className="kpi-card-header">
          <span className="kpi-card-label">Milestones</span>
          <div className="kpi-card-icon icon-accent" aria-hidden="true">
            <Flag size={15} strokeWidth={2} />
          </div>
        </div>
        <div className="kpi-card-value">{totalMilestonesCount}</div>
        <div className="kpi-card-subtext">{upcomingMilestonesCount} upcoming</div>
      </div>
    </div>
  );
}
