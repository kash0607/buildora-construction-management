import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import {
  Flag,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Link2
} from 'lucide-react';

/**
 * MilestoneSection
 * Presentation of engineering gateways, baseline sign-offs, and critical path milestones.
 * Clearly separates gateways into Upcoming, In Progress, Delayed/Overdue, and Completed.
 */
export default function MilestoneSection({
  milestones = [],
  projects = [],
  allTasks = [],
  todayStr,
  onOpenCreateMilestone,
  onOpenEditMilestone,
  onOpenArchiveMilestone
}) {
  return (
    <div className="milestones-ops-section" role="region" aria-label="Milestone Deliverables">
      {/* Header */}
      <div className="milestones-ops-header">
        <div className="milestones-title-block">
          <div className="flex items-center gap-2">
            <div className="milestone-flag-icon">
              <Flag size={18} />
            </div>
            <h3 className="milestone-main-heading">Critical Path Milestone Gateways</h3>
          </div>
          <p className="milestone-subtitle">
            Major engineering sign-offs, municipal clearances, and client handovers across project sites.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onOpenCreateMilestone}
        >
          <Plus size={14} />
          <span>New Milestone</span>
        </button>
      </div>

      {/* Gateway Cards List */}
      {milestones.length === 0 ? (
        <div className="milestone-empty-box">
          <p className="empty-title">No milestones found for selected project</p>
          <p className="empty-subtitle">Define baseline delivery gates to track critical handover milestones.</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: '0.75rem' }}
            onClick={onOpenCreateMilestone}
          >
            + Create Baseline Milestone
          </button>
        </div>
      ) : (
        <div className="milestone-gateways-stack">
          {milestones.map((m) => {
            const isDelayed =
              m.status === 'Delayed' ||
              (m.dueDate && m.dueDate < todayStr && m.status !== 'Completed');
            const isCompleted = m.status === 'Completed';

            let stateIndicatorClass = 'state-upcoming';
            if (isCompleted) stateIndicatorClass = 'state-completed';
            else if (isDelayed) stateIndicatorClass = 'state-delayed';
            else if (m.status === 'In Progress') stateIndicatorClass = 'state-progress';

            return (
              <div
                key={m.id}
                className={`milestone-gateway-card ${stateIndicatorClass}`}
              >
                {/* Left Indicator Ribbon */}
                <div className="milestone-ribbon" />

                {/* Main Content */}
                <div className="milestone-card-content">
                  {/* Top Bar: Project & Status Badge */}
                  <div className="milestone-top-meta">
                    <div className="flex items-center gap-2">
                      <span className="milestone-project-badge">{m.project}</span>
                      <span className="milestone-id-text">{m.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isDelayed && (
                        <span className="milestone-delayed-badge">
                          <AlertTriangle size={11} /> Delayed Gateway
                        </span>
                      )}
                      <StatusBadge status={m.status} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="milestone-info-block">
                    <h4 className="milestone-heading">{m.title}</h4>
                    {m.description && (
                      <p className="milestone-description-text">{m.description}</p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="milestone-progress-area">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted font-medium">Gateway Progress</span>
                      <span className={`font-bold ${isCompleted ? 'text-success' : 'text-primary'}`}>
                        {m.progress}%
                      </span>
                    </div>
                    <div className="milestone-track">
                      <div
                        className={`milestone-fill ${isCompleted ? 'is-complete' : ''}`}
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Linked Tasks Chips */}
                  {m.relatedTaskIds && m.relatedTaskIds.length > 0 && (
                    <div className="milestone-linked-tasks">
                      <span className="linked-label flex items-center gap-1">
                        <Link2 size={11} /> Linked Critical Deliverables:
                      </span>
                      <div className="linked-chips-flex">
                        {m.relatedTaskIds.map((tId) => {
                          const taskRef = allTasks.find((t) => t.id === tId);
                          return (
                            <span
                              key={tId}
                              className="milestone-task-chip"
                              title={taskRef ? `${tId}: ${taskRef.title} (${taskRef.status})` : tId}
                            >
                              <strong>{tId}</strong>
                              {taskRef && <span>· {taskRef.title.slice(0, 24)}...</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer: Date, Lead, Actions */}
                  <div className="milestone-card-footer">
                    <div className="milestone-footer-left">
                      <div className="footer-meta-item">
                        <Calendar size={13} className="text-muted" />
                        <span>Due: <strong>{m.dueDate}</strong></span>
                      </div>
                      <div className="footer-meta-item">
                        <User size={13} className="text-muted" />
                        <span>Responsible: <strong>{m.responsible}</strong></span>
                      </div>
                    </div>

                    <div className="milestone-footer-actions">
                      <button
                        type="button"
                        className="milestone-icon-btn"
                        title="Edit Milestone"
                        onClick={() => onOpenEditMilestone(m)}
                        aria-label="Edit Milestone"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        className="milestone-icon-btn delete"
                        title="Archive Milestone"
                        onClick={() => onOpenArchiveMilestone(m, 'milestone')}
                        aria-label="Archive Milestone"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
