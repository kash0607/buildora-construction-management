import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import FilterBar from '../components/common/FilterBar';
import SearchBar from '../components/common/SearchBar';
import { formatDate } from '../utils/formatters';

export default function AuditLogs() {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        action: actionFilter,
        entity: entityFilter,
        search,
      });
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch {
      showToast('Error loading audit trail', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, entityFilter]);

  const actionOptions = [
    { value: 'All', label: 'All Actions' },
    { value: 'CREATE', label: 'CREATE' },
    { value: 'UPDATE', label: 'UPDATE' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'APPROVE', label: 'APPROVE' },
    { value: 'RECEIVE', label: 'RECEIVE' },
    { value: 'PAY', label: 'PAY' },
  ];

  const getActionBadgeColor = (act) => {
    switch (act) {
      case 'CREATE':
        return { bg: 'var(--color-info-bg)', color: 'var(--color-info)' };
      case 'APPROVE':
      case 'RECEIVE':
      case 'PAY':
        return { bg: 'var(--color-success-bg)', color: 'var(--color-success)' };
      case 'DELETE':
      case 'REJECT':
        return { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
      default:
        return { bg: 'var(--color-warm-beige)', color: 'var(--color-dark-brown)' };
    }
  };

  return (
    <div className="audit-logs-page" style={{ padding: '0 0.5rem' }}>
      <PageHeader
        title="Enterprise Audit Trail & Governance"
        subtitle="Immutable chronological ledger recording all critical mutations, financial disbursements, stock receipts, and approvals."
        breadcrumbs={[{ label: 'Admin Governance' }, { label: 'Audit Trail' }]}
      />

      <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <FilterBar options={actionOptions} activeValue={actionFilter} onChange={setActionFilter} />
          <SearchBar value={search} onChange={setSearch} placeholder="Search user, entity ID, or project..." onClear={() => setSearch('')} />
        </div>

        <DataTable
          loading={loading}
          data={logs}
          columns={[
            {
              key: 'createdAt',
              header: 'Timestamp',
              sortable: true,
              render: (val) => (
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  {val ? new Date(val).toLocaleString('en-GB') : '—'}
                </span>
              ),
            },
            {
              key: 'userName',
              header: 'User & Role',
              sortable: true,
              render: (val, row) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{val}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{row.userRole}</div>
                </div>
              ),
            },
            {
              key: 'action',
              header: 'Action',
              sortable: true,
              render: (val) => {
                const style = getActionBadgeColor(val);
                return (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      backgroundColor: style.bg,
                      color: style.color,
                    }}
                  >
                    {val}
                  </span>
                );
              },
            },
            { key: 'entity', header: 'Entity', sortable: true },
            { key: 'entityId', header: 'Entity Reference', sortable: true },
            { key: 'projectId', header: 'Project ID', sortable: true },
            {
              key: 'details',
              header: 'Audit Details',
              render: (d) => (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                  {d && typeof d === 'object' ? JSON.stringify(d).substring(0, 60) + (JSON.stringify(d).length > 60 ? '...' : '') : String(d || '—')}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
