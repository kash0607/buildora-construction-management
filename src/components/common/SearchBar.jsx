import React from 'react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search records...',
  className = '',
  onClear,
}) {
  return (
    <div className={`search-bar-wrapper ${className}`} style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
      <svg
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-light)',
          pointerEvents: 'none',
        }}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        className="form-control"
        style={{
          paddingLeft: '36px',
          paddingRight: value ? '32px' : '12px',
          height: '38px',
          fontSize: '0.88rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-border)',
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: '1rem',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
