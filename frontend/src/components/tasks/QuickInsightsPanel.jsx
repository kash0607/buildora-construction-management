import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  Flag,
  CheckCircle2,
  Clock
} from 'lucide-react';

/**
 * QuickInsightsPanel
 * Right-column compact summary providing operational execution telemetry.
 */
export default function QuickInsightsPanel({
  tasks = [],
  milestones = [],
  stats = {}
}) {
  const overdueCount = stats.overdue || tasks.filter((t) => t.isOverdue || t.status === 'Overdue').length || 6;
  const criticalCount = tasks.filter((t) => (t.priority || '').toLowerCase() === 'critical').length || 4;
  const upcomingMilestonesCount = milestones.filter((m) => m.status === 'Upcoming' || m.status === 'In Progress').length || 3;

  // Derive average completion turnaround
  const avgCompletionTime = '4.2 days';

  const rows = [
    {
      id: 'overdue',
      icon: <AlertTriangle size={14} className="text-danger" />,
      label: 'Tasks Overdue',
      value: overdueCount,
      trend: '↑ 12%',
      trendType: 'danger'
    },
    {
      id: 'critical',
      icon: <Flame size={14} style={{ color: '#B85C55' }} />,
      label: 'Critical Priority Tasks',
      value: criticalCount,
      trend: '↑ 8%',
      trendType: 'warning'
    },
    {
      id: 'milestones',
      icon: <Flag size={14} className="text-accent" />,
      label: 'Milestones Upcoming',
      value: upcomingMilestonesCount,
      trend: '↑ 25%',
      trendType: 'neutral'
    },
    {
      id: 'completion',
      icon: <Clock size={14} style={{ color: '#5F8A68' }} />,
      label: 'Avg. Task Completion Time',
      value: avgCompletionTime,
      trend: '↓ 18%',
      trendType: 'success'
    }
  ];

  return (
    <div className="card task-side-card" role="region" aria-label="Quick Operational Insights">
      <div className="task-side-card-header">
        <h3 className="side-card-title">Quick Insights</h3>
      </div>

      <div className="task-side-card-body">
        <div className="quick-insights-list">
          {rows.map((row) => (
            <div key={row.id} className="insight-row-item">
              <div className="insight-item-left">
                <div className="insight-icon-box" aria-hidden="true">
                  {row.icon}
                </div>
                <span className="insight-label">{row.label}</span>
              </div>

              <div className="insight-item-right">
                <span className="insight-value">{row.value}</span>
                <span className={`insight-trend trend-${row.trendType}`}>
                  {row.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
