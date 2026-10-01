import React from 'react';

const STATUS_MAP = {
  // General & Projects
  Active: 'badge-success',
  Planning: 'badge-neutral',
  Delayed: 'badge-danger',
  'On Hold': 'badge-warning',
  Completed: 'badge-success',
  Archived: 'badge-neutral',

  // Tasks
  'To Do': 'badge-neutral',
  'Not Started': 'badge-neutral',
  'In Progress': 'badge-info',
  Review: 'badge-warning',
  Blocked: 'badge-danger',
  Overdue: 'badge-danger',

  // Approvals & Workflows
  Draft: 'badge-neutral',
  Pending: 'badge-warning',
  'Pending Approval': 'badge-warning',
  'Under Review': 'badge-warning',
  Submitted: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger',
  Converted: 'badge-info',
  Cancelled: 'badge-neutral',

  // Procurement & Delivery
  Issued: 'badge-info',
  'Partially Delivered': 'badge-warning',
  Delivered: 'badge-success',
  Passed: 'badge-success',
  'Partially Rejected': 'badge-warning',

  // Stock
  'In Stock': 'badge-success',
  'Low Stock': 'badge-danger',
  'Out of Stock': 'badge-danger',

  // Finance
  Paid: 'badge-success',
  Unpaid: 'badge-warning',
  Failed: 'badge-danger',

  // Documents & Photos
  Internal: 'badge-neutral',
  'Client Visible': 'badge-info',
  'Client Approved': 'badge-success',

  // Issues
  Open: 'badge-neutral',
  Resolved: 'badge-success',
  Closed: 'badge-neutral',
};

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;
  const badgeClass = STATUS_MAP[status] || 'badge-neutral';
  return <span className={`badge ${badgeClass} ${className}`}>{status}</span>;
}
