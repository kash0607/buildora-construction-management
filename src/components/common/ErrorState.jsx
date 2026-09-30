import React from 'react';

export default function ErrorState({
  title = 'Unable to load content',
  message = 'An unexpected network or server error occurred while retrieving this data.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`error-state-card ${className}`}
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-danger-bg)',
        border: '1px solid var(--color-danger-border)',
        borderRadius: 'var(--radius-lg)',
        margin: '1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>

      <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-danger)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 1.25rem 0', color: 'var(--color-text-body)', fontSize: '0.88rem', maxWidth: '420px', lineHeight: 1.4 }}>
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onRetry}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          Retry Request
        </button>
      )}
    </div>
  );
}
