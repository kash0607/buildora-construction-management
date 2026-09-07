import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import QuickPOModal from '../components/modals/QuickPOModal';

export default function Approvals() {
  const { showToast } = useToast();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPOOpen, setIsPOOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');

  const loadApprovals = async () => {
    try {
      const res = await api.getAllApprovals();
      if (res.success) {
        setApprovals(res.data);
      }
    } catch {
      showToast('Error loading approvals', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAction = async (id, action) => {
    const res = await api.handleApprovalAction(id, action);
    if (res.success) {
      showToast(res.message, action === 'approve' ? 'success' : 'info');
      loadApprovals();
    }
  };

  const filteredApprovals = approvals.filter((a) => {
    if (filterType !== 'All' && a.status !== filterType) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Approvals & Commercial Gateway...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="projects-header">
        <div className="projects-header-text">
          <h1>Approvals & Commercial Governance</h1>
          <p>Purchase orders, material requisitions, site variance claims, and financial disbursements.</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => setIsPOOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            + New Purchase Request
          </button>
        </div>
      </div>

      <div className="projects-controls-bar">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-dark" style={{ fontSize: '0.9rem' }}>Status Filter:</span>
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <span className="badge badge-neutral">{filteredApprovals.length} Items</span>
      </div>

      <div className="card">
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Request ID & Item</th>
                <th>Project Site</th>
                <th>Type</th>
                <th>Requested By</th>
                <th>Value</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-bold text-dark">{item.id}: {item.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Vendor: {item.vendor || 'Pending'}</div>
                  </td>
                  <td>{item.project}</td>
                  <td>
                    <span className="badge badge-neutral">{item.type}</span>
                  </td>
                  <td>{item.requestedBy}</td>
                  <td className="font-bold text-dark">{item.amount}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {item.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleAction(item.id, 'reject')}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleAction(item.id, 'approve')}
                        >
                          Approve ✓
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {item.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuickPOModal
        isOpen={isPOOpen}
        onClose={() => setIsPOOpen(false)}
        onPOSubmitted={() => loadApprovals()}
      />
    </>
  );
}
