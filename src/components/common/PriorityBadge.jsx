import React from 'react';

const PRIORITY_MAP = {
  Urgent: { className: 'badge-danger', dotColor: 'var(--color-danger)' },
  Critical: { className: 'badge-danger', dotColor: 'var(--color-danger)' },
  High: { className: 'badge-warning', dotColor: 'var(--color-warning)' },
  Normal: { className: 'badge-neutral', dotColor: 'var(--color-secondary-brown)' },
  Medium: { className: 'badge-neutral', dotColor: 'var(--color-secondary-brown)' },
  Low: { className: 'badge-neutral', dotColor: 'var(--color-text-muted)' },
};

export default function PriorityBadge({ priority = 'Medium', className = '' }) {
  const config = PRIORITY_MAP[priority] || PRIORITY_MAP.Medium;

  return (
    <span className={`badge ${config.className} ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          display: 'inline-block',
        }}
      />
      {priority}
    </span>
  );
}
