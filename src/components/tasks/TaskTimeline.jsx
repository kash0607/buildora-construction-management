import React, { useMemo } from 'react';
import { Calendar, AlertTriangle, Link2 } from 'lucide-react';

/**
 * TaskTimeline
 * Gantt-style operational schedule visualizer.
 * Resilient date mapping across project work packages, with fallbacks for
 * partial or invalid dates, progress fill overlay, and status color coding.
 */
export default function TaskTimeline({
  tasks = [],
  milestones = [],
  todayStr,
  onOpenDetails
}) {
  // Compute timeline boundaries dynamically based on task dates
  const { minTime, maxTime, totalSpan, timelineTicks } = useMemo(() => {
    let earliest = new Date('2026-08-01').getTime();
    let latest = new Date('2026-10-31').getTime();

    tasks.forEach((t) => {
      if (t.startDate) {
        const s = new Date(t.startDate).getTime();
        if (!isNaN(s) && s < earliest) earliest = s;
      }
      if (t.dueDate) {
        const d = new Date(t.dueDate).getTime();
        if (!isNaN(d) && d > latest) latest = d;
      }
    });

    // Add 5 days buffer on both sides
    const bufferedMin = earliest - 5 * 86400000;
    const bufferedMax = latest + 5 * 86400000;
    const span = bufferedMax - bufferedMin;

    // Build timeline scale ticks
    const ticks = [
      { label: 'Aug 2026', time: new Date('2026-08-01').getTime() },
      { label: 'Mid Aug', time: new Date('2026-08-15').getTime() },
      { label: 'Sep 2026', time: new Date('2026-09-01').getTime() },
      { label: 'Mid Sep', time: new Date('2026-09-15').getTime() },
      { label: 'Oct 2026', time: new Date('2026-10-01').getTime() },
      { label: 'Mid Oct', time: new Date('2026-10-15').getTime() }
    ].filter((tick) => tick.time >= bufferedMin && tick.time <= bufferedMax);

    return {
      minTime: bufferedMin,
      maxTime: bufferedMax,
      totalSpan: span,
      timelineTicks: ticks
    };
  }, [tasks]);

  return (
    <div className="task-timeline-view" role="region" aria-label="Task Schedule Timeline">
      {/* Header Info & Legend */}
      <div className="timeline-top-controls">
        <div>
          <h3 className="timeline-title">Operational Schedule Timeline</h3>
          <p className="timeline-subtitle">
            Gantt schedule mapping site execution durations, prerequisite relationships, and progress gates.
          </p>
        </div>

        {/* Legend */}
        <div className="timeline-legend-bar">
          <div className="timeline-legend-item">
            <span className="legend-dot dot-todo" />
            <span>To Do</span>
          </div>
          <div className="timeline-legend-item">
            <span className="legend-dot dot-inprogress" />
            <span>In Progress</span>
          </div>
          <div className="timeline-legend-item">
            <span className="legend-dot dot-review" />
            <span>In Review</span>
          </div>
          <div className="timeline-legend-item">
            <span className="legend-dot dot-blocked" />
            <span>Blocked</span>
          </div>
          <div className="timeline-legend-item">
            <span className="legend-dot dot-completed" />
            <span>Completed</span>
          </div>
          <div className="timeline-legend-item">
            <span className="legend-dot dot-overdue" />
            <span>Overdue</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      {tasks.length === 0 ? (
        <div className="timeline-empty-card">
          <p className="empty-title">No schedule items match your current filter</p>
          <p className="empty-subtitle">Select different filters or create a new task with schedule dates.</p>
        </div>
      ) : (
        <div className="gantt-chart-viewport">
          {/* Header Row */}
          <div className="gantt-header-strip">
            <div className="gantt-header-col-task">Work Package / Deliverable</div>
            <div className="gantt-header-col-scale">
              {timelineTicks.map((tick) => {
                const leftPct = ((tick.time - minTime) / totalSpan) * 100;
                return (
                  <span
                    key={tick.label}
                    className="gantt-tick-label"
                    style={{ left: `${Math.max(1, Math.min(92, leftPct))}%` }}
                  >
                    {tick.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Rows List */}
          <div className="gantt-rows-container">
            {tasks.map((task) => {
              const isOverdue =
                task.isOverdue ||
                (task.dueDate && task.dueDate < todayStr && task.status !== 'Completed');

              // Parse dates safely with fallbacks
              let startT = task.startDate ? new Date(task.startDate).getTime() : minTime + 10 * 86400000;
              let dueT = task.dueDate ? new Date(task.dueDate).getTime() : startT + 14 * 86400000;

              if (isNaN(startT)) startT = minTime;
              if (isNaN(dueT)) dueT = startT + 10 * 86400000;
              if (dueT <= startT) dueT = startT + 5 * 86400000;

              // Calculate percentages
              let leftPct = Math.max(1, Math.min(90, ((startT - minTime) / totalSpan) * 100));
              let widthPct = Math.max(7, Math.min(98 - leftPct, ((dueT - startT) / totalSpan) * 100));

              let statusStyleClass = 'bar-todo';
              if (isOverdue) statusStyleClass = 'bar-overdue';
              else if (task.status === 'Completed') statusStyleClass = 'bar-completed';
              else if (task.status === 'Review') statusStyleClass = 'bar-review';
              else if (task.status === 'In Progress') statusStyleClass = 'bar-inprogress';
              else if (task.status === 'Blocked') statusStyleClass = 'bar-blocked';

              return (
                <div key={task.id} className="gantt-item-row">
                  {/* Left Column: Task Name, Project, Assignee */}
                  <div className="gantt-row-left-cell">
                    <span
                      className="gantt-item-title"
                      onClick={() => onOpenDetails(task)}
                      title={task.title}
                      role="button"
                      tabIndex={0}
                    >
                      {task.title}
                    </span>
                    <div className="gantt-item-meta">
                      <span className="meta-project">{task.project}</span>
                      <span className="meta-sep">•</span>
                      <span className="meta-assignee">{task.assignee}</span>
                      {task.dependencies?.length > 0 && (
                        <>
                          <span className="meta-sep">•</span>
                          <span className="meta-dep flex items-center gap-0.5">
                            <Link2 size={10} />
                            {task.dependencies[0]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Track & Bar */}
                  <div className="gantt-row-right-track">
                    <div
                      className={`gantt-schedule-bar ${statusStyleClass}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`
                      }}
                      onClick={() => onOpenDetails(task)}
                      title={`${task.title} (${task.startDate || '—'} → ${task.dueDate || '—'}) — Progress: ${task.progress}%`}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className="gantt-progress-overlay"
                        style={{ width: `${task.progress}%` }}
                      />
                      <span className="gantt-bar-text">
                        {task.progress}% · {task.dueDate ? task.dueDate.slice(5) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
