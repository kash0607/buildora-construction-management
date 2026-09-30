import React from 'react';

export default function LoadingState({
  message = 'Loading data...',
  rows = 4,
  type = 'table', // 'table' | 'cards' | 'spinner'
}) {
  if (type === 'spinner') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid var(--color-warm-beige)', borderTopColor: 'var(--color-primary-brown)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>{message}</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', padding: '1rem 0' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <div style={{ width: '40%', height: '14px', backgroundColor: 'var(--color-warm-beige)', borderRadius: '4px', marginBottom: '1rem' }} />
            <div style={{ width: '80%', height: '22px', backgroundColor: 'var(--color-warm-sand)', borderRadius: '4px', marginBottom: '0.75rem' }} />
            <div style={{ width: '60%', height: '14px', backgroundColor: 'var(--color-warm-sand)', borderRadius: '4px' }} />
          </div>
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div style={{ padding: '1rem 0', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: '40px', backgroundColor: 'var(--color-warm-sand)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '48px',
            backgroundColor: i % 2 === 0 ? 'var(--color-white)' : 'var(--color-warm-sand)',
            borderBottom: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '4px',
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
