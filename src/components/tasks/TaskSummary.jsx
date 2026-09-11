import React from 'react';
import {
  ListFilter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';

/**
 * TaskSummary
 * Human-designed operational summary area for construction project management.
 * Answers key operational questions without generic AI card bloat:
 * - Active tasks
 * - In progress works
 * - Under review / inspection
 * - Overdue deliverables
 * - Blocked works
 * - Upcoming milestone gateways
 */
export default function TaskSummary({
  stats = {},
  upcomingMilestonesCount = 0,
  activeFilter = 'All',
  onSelectFilter
}) {
  const {
    total = 0,
    toDo = 0,
    inProgress = 0,
    review = 0,
    completed = 0,
    overdue = 0,
    blocked = 0
  } = stats;

  const activeTotal = total - completed;

  const handleStatClick = (filterValue) => {
    if (onSelectFilter) {
      onSelectFilter(filterValue);
    }
  };

  return (
    <div className="task-ops-summary-strip" role="region" aria-label="Operational Task Summary">
      {/* 1. Active Schedule */}
      <div
        className={`ops-summary-col ${activeFilter === 'All' ? 'is-active' : ''}`}
        onClick={() => handleStatClick('All')}
        role="button"
        tabIndex={0}
        title="Show all tasks"
      >
        <div className="ops-stat-icon icon-neutral">
          <ListFilter size={17} />
        </div>
        <div className="ops-stat-body">
          <div className="ops-stat-metric-row">
            <span className="ops-stat-number">{activeTotal}</span>
            <span className="ops-stat-sub">/ {total} total</span>
          </div>
          <div className="ops-stat-label">Active Tasks</div>
          <div className="ops-stat-subtext">{toDo} to commence</div>
        </div>
      </div>

      <div className="ops-summary-divider" aria-hidden="true" />

      {/* 2. In Progress */}
      <div
        className={`ops-summary-col ${activeFilter === 'In Progress' ? 'is-active' : ''}`}
        onClick={() => handleStatClick('In Progress')}
        role="button"
        tabIndex={0}
        title="Filter by In Progress"
      >
        <div className="ops-stat-icon icon-progress">
          <Clock size={17} />
        </div>
        <div className="ops-stat-body">
          <div className="ops-stat-metric-row">
            <span className="ops-stat-number text-info">{inProgress}</span>
          </div>
          <div className="ops-stat-label">In Progress</div>
          <div className="ops-stat-subtext">Executing on site</div>
        </div>
      </div>

      <div className="ops-summary-divider" aria-hidden="true" />

      {/* 3. Under Review / QA Inspection */}
      <div
        className={`ops-summary-col ${activeFilter === 'Review' ? 'is-active' : ''}`}
        onClick={() => handleStatClick('Review')}
        role="button"
        tabIndex={0}
        title="Filter by In Review"
      >
        <div className="ops-stat-icon icon-review">
          <FileCheck2 size={17} />
        </div>
        <div className="ops-stat-body">
          <div className="ops-stat-metric-row">
            <span className="ops-stat-number text-accent">{review}</span>
          </div>
          <div className="ops-stat-label">In Review</div>
          <div className="ops-stat-subtext">QA & sign-off gates</div>
        </div>
      </div>

      <div className="ops-summary-divider" aria-hidden="true" />

      {/* 4. Overdue Tasks */}
      <div
        className={`ops-summary-col ${activeFilter === 'Overdue' ? 'is-active' : ''}`}
        onClick={() => handleStatClick('Overdue')}
        role="button"
        tabIndex={0}
        title="Filter by Overdue tasks"
      >
        <div className="ops-stat-icon icon-overdue">
          <AlertTriangle size={17} />
        </div>
        <div className="ops-stat-body">
          <div className="ops-stat-metric-row">
            <span className={`ops-stat-number ${overdue > 0 ? 'text-danger font-bold' : ''}`}>
              {overdue}
            </span>
          </div>
          <div className="ops-stat-label">Overdue</div>
          <div className="ops-stat-subtext">
            {overdue > 0 ? 'Past target schedule' : 'Zero schedule slip'}
          </div>
        </div>
      </div>

      <div className="ops-summary-divider" aria-hidden="true" />

      {/* 5. Blocked Tasks */}
      <div
        className={`ops-summary-col ${activeFilter === 'Blocked' ? 'is-active' : ''}`}
        onClick={() => handleStatClick('Blocked')}
        role="button"
        tabIndex={0}
        title="Filter by Blocked tasks"
      >
        <div className="ops-stat-icon icon-blocked">
          <Flag size={17} />
        </div>
        <div className="ops-stat-body">
          <div className="ops-stat-metric-row">
            <span className={`ops-stat-number ${blocked > 0 ? 'text-warning' : ''}`}>
              {blocked}
            </span>
          </div>
          <div className="ops-stat-label">Blocked</div>
          <div className="ops-stat-subtext">Awaiting clearance</div>
        </div>
      </div>

      <div className="ops-summary-divider" aria-hidden="true" />

      {/* 6. Upcoming Milestones */}
      <div className="ops-summary-col non-interactive" title="Upcoming project milestones">
        <div className="ops-stat-icon icon-milestone">
          <CalendarCheck size={17} />
        </div>
        <div className="ops-stat-body">
          <div className="ops-stat-metric-row">
            <span className="ops-stat-number text-primary">{upcomingMilestonesCount}</span>
          </div>
          <div className="ops-stat-label">Milestones</div>
          <div className="ops-stat-subtext">Active gateways</div>
        </div>
      </div>
    </div>
  );
}
