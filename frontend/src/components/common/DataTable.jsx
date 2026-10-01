import React, { useState, useMemo } from 'react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyMessage = 'No records found matching the current criteria.',
  emptyAction,
  onRowClick,
  keyField = '_id',
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !Array.isArray(data)) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortOrder]);

  if (loading) {
    return <LoadingState type="table" rows={5} />;
  }

  if (!loading && (!data || data.length === 0)) {
    return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }

  return (
    <div className={`table-responsive ${className}`} style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-warm-sand)', borderBottom: '2px solid var(--color-border)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '0.85rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--color-text-muted)',
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  width: col.width || 'auto',
                }}
                onClick={() => handleSort(col.key, col.sortable)}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>{col.header}</span>
                  {col.sortable && sortKey === col.key && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-brown)' }}>
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowKey = row[keyField] || row.id || index;
            return (
              <tr
                key={rowKey}
                style={{
                  borderBottom: '1px solid var(--color-border-subtle)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 150ms ease',
                }}
                className="table-row-hover"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '0.85rem 1rem',
                      fontSize: '0.88rem',
                      color: 'var(--color-text-body)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.render ? col.render(row[col.key], row, index) : (row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
