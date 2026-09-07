import React from 'react';

const STATUS_MAP = {
  Active: 'badge-success',
  Planning: 'badge-neutral',
  Delayed: 'badge-danger',
  'On Hold': 'badge-warning',
  Completed: 'badge-info',
  Archived: 'badge-neutral',
  Submitted: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger',
  Pending: 'badge-warning',
  Open: 'badge-neutral',
  'In Progress': 'badge-warning',
  Resolved: 'badge-success',
  Critical: 'badge-danger',
  High: 'badge-danger',
  Medium: 'badge-warning',
  Low: 'badge-neutral',
  'Low Stock': 'badge-danger'
};

export default function StatusBadge({ status, className = '' }) {
  const badgeClass = STATUS_MAP[status] || 'badge-neutral';
  return <span className={`badge ${badgeClass} ${className}`}>{status}</span>;
}
