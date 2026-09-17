import React from 'react';
import { Link2, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * DependencyIndicator
 * Renders dependency and blocker information with construction realism.
 * - Shows whether prerequisites are satisfied or blocking
 * - Compact and easily scannable
 */
export default function DependencyIndicator({
  dependencies = [],
  allTasks = [],
  status = '',
  compact = false,
  onSelectTask
}) {
  if (!dependencies || dependencies.length === 0) {
    if (status === 'Blocked') {
      return (
        <span className="dependency-blocker-chip inline-flex items-center gap-1 text-xs text-danger font-semibold">
          <AlertCircle size={12} />
          Site Blocker
        </span>
      );
    }
    return null;
  }

  // Resolve dependencies
  const resolved = dependencies.map((depId) => {
    const found = allTasks.find((t) => t.id === depId);
    return {
      id: depId,
      title: found?.title || depId,
      status: found?.status || 'Unknown',
      isComplete: found?.status === 'Completed'
    };
  });

  const hasIncomplete = resolved.some((d) => !d.isComplete);
  const incompleteDeps = resolved.filter((d) => !d.isComplete);

  // Compact inline badge for cards or table cells
  if (compact) {
    if (status === 'Blocked') {
      return (
        <div className="task-dependency-pill blocked" title={`Waiting on: ${incompleteDeps.map((d) => `${d.id} (${d.title})`).join(', ')}`}>
          <AlertCircle size={12} className="dep-icon" />
          <span>Blocked · Waiting for {incompleteDeps[0]?.id || 'prerequisite'}</span>
          {incompleteDeps.length > 1 && <span className="dep-extra">+{incompleteDeps.length - 1}</span>}
        </div>
      );
    }

    if (!hasIncomplete) {
      return (
        <div className="task-dependency-pill satisfied" title="All prerequisites satisfied">
          <CheckCircle2 size={12} className="dep-icon" />
          <span>Prerequisites clear ({dependencies.length})</span>
        </div>
      );
    }

    return (
      <div className="task-dependency-pill pending" title={`Requires: ${incompleteDeps.map((d) => d.id).join(', ')}`}>
        <Link2 size={12} className="dep-icon" />
        <span>Prereq: {incompleteDeps[0]?.id}</span>
        {incompleteDeps.length > 1 && <span className="dep-extra">+{incompleteDeps.length - 1}</span>}
      </div>
    );
  }

  // Full detailed display (for TaskDetails or expanded views)
  return (
    <div className="dependency-detail-stack">
      <div className="dependency-summary-header flex items-center justify-between text-xs">
        <span className="font-semibold text-muted flex items-center gap-1">
          <Link2 size={13} />
          Prerequisite Chain ({dependencies.length})
        </span>
        {hasIncomplete ? (
          <span className="text-warning text-xs font-semibold flex items-center gap-1">
            <AlertCircle size={12} />
            {incompleteDeps.length} pending
          </span>
        ) : (
          <span className="text-success text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} />
            All prerequisites satisfied
          </span>
        )}
      </div>

      <div className="dependency-items-list mt-2 flex flex-col gap-1.5">
        {resolved.map((dep) => (
          <div
            key={dep.id}
            className={`dependency-item-row ${dep.isComplete ? 'is-complete' : 'is-pending'}`}
            onClick={() => onSelectTask && onSelectTask(dep.id)}
            role={onSelectTask ? 'button' : undefined}
            tabIndex={onSelectTask ? 0 : undefined}
            title={onSelectTask ? `View ${dep.id}` : undefined}
          >
            <div className="dep-id-badge">{dep.id}</div>
            <div className="dep-title-text truncate">{dep.title}</div>
            <div className="dep-status-pill">
              {dep.isComplete ? (
                <span className="text-success flex items-center gap-1 text-xs">
                  <CheckCircle2 size={12} /> Done
                </span>
              ) : (
                <span className="text-warning flex items-center gap-1 text-xs">
                  <AlertCircle size={12} /> {dep.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
