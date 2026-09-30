import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  actions,
  children,
}) {
  return (
    <div className="page-header" style={{ marginBottom: '1.75rem' }}>
      {breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" style={{ marginBottom: '0.5rem' }}>
          <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {breadcrumbs.map((bc, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {index > 0 && <span>/</span>}
                {bc.href ? (
                  <a href={bc.href} style={{ color: 'var(--color-primary-brown)', textDecoration: 'none' }}>
                    {bc.label}
                  </a>
                ) : (
                  <span style={{ color: 'var(--color-text-dark)', fontWeight: 500 }}>{bc.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="page-subtitle" style={{ margin: '0.35rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>

      {children && <div style={{ marginTop: '1rem' }}>{children}</div>}
    </div>
  );
}
