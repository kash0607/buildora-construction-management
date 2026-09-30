import React from 'react';

export default function FilterBar({
  options = [],
  activeValue,
  onChange,
  className = '',
}) {
  return (
    <div
      className={`filter-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
      }}
    >
      {options.map((option) => {
        const val = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        const count = typeof option === 'object' ? option.count : undefined;
        const isActive = activeValue === val;

        return (
          <button
            key={val}
            type="button"
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.85rem',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              fontWeight: isActive ? 600 : 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => onChange(val)}
          >
            <span>{label}</span>
            {count !== undefined && (
              <span
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--color-warm-beige)',
                  color: isActive ? 'var(--color-white)' : 'var(--color-dark-brown)',
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
