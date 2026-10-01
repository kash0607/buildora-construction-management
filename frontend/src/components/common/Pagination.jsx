import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`pagination-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.85rem 0.5rem',
        borderTop: '1px solid var(--color-border-subtle)',
        fontSize: '0.82rem',
        color: 'var(--color-text-muted)',
      }}
    >
      <div>
        Showing <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{startItem}</span> to{' '}
        <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{endItem}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{totalItems}</span> entries
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ padding: '0.2rem 0.5rem', minWidth: '32px' }}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Render only nearby pages if totalPages is large
          if (
            totalPages > 7 &&
            Math.abs(page - currentPage) > 2 &&
            page !== 1 &&
            page !== totalPages
          ) {
            if (page === currentPage - 3 || page === currentPage + 3) {
              return <span key={page} style={{ padding: '0 4px' }}>…</span>;
            }
            return null;
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onPageChange(page)}
              style={{
                padding: '0.2rem 0.55rem',
                minWidth: '32px',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ padding: '0.2rem 0.5rem', minWidth: '32px' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
