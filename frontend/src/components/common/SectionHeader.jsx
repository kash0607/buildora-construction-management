import React from 'react';

export default function SectionHeader({
  title,
  subtitle,
  count,
  actions,
  className = '',
}) {
  return (
    <div
      className={`section-header ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-dark)' }}>
            {title}
          </h2>
          {count !== undefined && (
            <span
              style={{
                backgroundColor: 'var(--color-warm-beige)',
                color: 'var(--color-dark-brown)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
