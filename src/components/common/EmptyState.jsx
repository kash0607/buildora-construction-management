import React from 'react';

export default function EmptyState({
  title = 'No records found',
  message = 'There are no items matching your criteria or currently available in the database.',
  icon,
  action,
  className = '',
}) {
  return (
    <div
      className={`empty-state-card ${className}`}
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)',
        margin: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-warm-sand)',
          color: 'var(--color-secondary-brown)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        {icon || (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="m9 16 3-3 3 3" />
          </svg>
        )}
      </div>

      <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-dark)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 1.25rem 0', color: 'var(--color-text-muted)', fontSize: '0.88rem', maxWidth: '420px', lineHeight: 1.5 }}>
        {message}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}
