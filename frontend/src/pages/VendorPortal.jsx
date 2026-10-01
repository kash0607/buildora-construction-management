import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import FormModal from '../components/common/FormModal';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function VendorPortal() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dispatch Modal
  const [selectedPO, setSelectedPO] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    dispatchNotes: '',
    trackingRef: '',
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getPurchaseOrders();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch {
      showToast('Error loading vendor orders', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openDispatch = (po) => {
    setSelectedPO(po);
    setDispatchForm({
      dispatchNotes: 'Consignment dispatched via fleet carrier',
      trackingRef: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    setShowDispatchModal(true);
  };

  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!selectedPO) return;

    const res = await api.updatePurchaseOrderStatus(
      selectedPO.poNumber || selectedPO._id,
      selectedPO.status === 'Issued' ? 'Issued' : selectedPO.status,
      `Vendor Dispatch confirmed. Tracking: ${dispatchForm.trackingRef}. Notes: ${dispatchForm.dispatchNotes}`
    );

    if (res.success) {
      showToast('Dispatch status recorded and transmitted to site team!', 'success');
      setShowDispatchModal(false);
      loadOrders();
    } else {
      showToast(res.message || 'Dispatch update failed', 'danger');
    }
  };

  const pendingCount = orders.filter((o) => ['Issued', 'Partially Delivered'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const totalValue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  return (
    <div className="vendor-portal-page" style={{ padding: '0 0.5rem' }}>
      <PageHeader
        title="Vendor Partner Portal"
        subtitle={`Supplier Console for ${currentUser?.name || 'Authorized Supplier'}. View assigned purchase contracts, confirm dispatches, and track receiving receipts.`}
        breadcrumbs={[{ label: 'Supplier Workspace' }, { label: 'Assigned Purchase Orders' }]}
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard
          title="Assigned Orders Value"
          value={formatCurrency(totalValue, true)}
          subtitle={`${orders.length} contractual orders`}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
        />
        <StatCard
          title="Awaiting Dispatch / Delivery"
          value={pendingCount}
          subtitle="Orders in fulfillment pipeline"
          trendType={pendingCount > 0 ? 'negative' : 'positive'}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          title="Delivered & Accepted"
          value={deliveredCount}
          subtitle="Fully fulfilled contracts"
          trendType="positive"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
      </div>

      <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: 'var(--color-text-dark)' }}>
          Assigned Purchase Orders
        </h3>

        <DataTable
          loading={loading}
          data={orders}
          columns={[
            { key: 'poNumber', header: 'PO Number', sortable: true, width: '120px' },
            { key: 'title', header: 'Scope & Description', sortable: true },
            { key: 'projectName', header: 'Destination Project', sortable: true },
            {
              key: 'items',
              header: 'Contracted Items',
              render: (items) => (
                <div style={{ fontSize: '0.82rem' }}>
                  {items?.[0] ? `${items[0].quantity} ${items[0].unit} of ${items[0].name}` : '—'}
                </div>
              ),
            },
            {
              key: 'grandTotal',
              header: 'Order Value',
              sortable: true,
              render: (val) => <span style={{ fontWeight: 700 }}>{formatCurrency(val)}</span>,
            },
            {
              key: 'deliveryDate',
              header: 'Due Delivery',
              sortable: true,
              render: (val) => formatDate(val),
            },
            {
              key: 'status',
              header: 'Fulfillment Status',
              sortable: true,
              render: (val) => <StatusBadge status={val} />,
            },
            {
              key: 'actions',
              header: 'Dispatch Action',
              render: (_, row) => (
                <div>
                  {['Issued', 'Partially Delivered'].includes(row.status) && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                      onClick={() => openDispatch(row)}
                    >
                      Update Dispatch
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* MODAL: Update Dispatch */}
      <FormModal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        title={`Confirm Consignment Dispatch — ${selectedPO?.poNumber || ''}`}
        subtitle="Transmit dispatch notice, carrier details, and tracking reference to Buildora site receivers"
      >
        <form onSubmit={handleConfirmDispatch}>
          <div style={{ backgroundColor: 'var(--color-warm-sand)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem' }}>
            <div><strong>PO:</strong> {selectedPO?.title}</div>
            <div><strong>Destination:</strong> {selectedPO?.projectName}</div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Carrier / Tracking Reference *</label>
            <input
              type="text"
              className="form-control"
              value={dispatchForm.trackingRef}
              onChange={(e) => setDispatchForm({ ...dispatchForm, trackingRef: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Dispatch Notice / Driver Contact</label>
            <textarea
              className="form-control"
              rows={3}
              value={dispatchForm.dispatchNotes}
              onChange={(e) => setDispatchForm({ ...dispatchForm, dispatchNotes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowDispatchModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Transmit Dispatch Notice
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
