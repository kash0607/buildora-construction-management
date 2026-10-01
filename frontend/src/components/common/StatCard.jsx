import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon,
  onClick,
  className = '',
}) {
  const trendColors = {
    positive: { color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    negative: { color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
    neutral: { color: 'var(--color-text-muted)', bg: 'var(--color-warm-sand)' },
  };

  const trendStyle = trendColors[trendType] || trendColors.neutral;

  return (
    <div
      className={`card stat-card ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-white)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-dark)', marginTop: '0.35rem' }}>
            {value}
          </div>
        </div>
        {icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warm-sand)',
              color: 'var(--color-primary-brown)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8rem' }}>
          {trend && (
            <span
              style={{
                backgroundColor: trendStyle.bg,
                color: trendStyle.color,
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {trend}
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--color-text-muted)' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
