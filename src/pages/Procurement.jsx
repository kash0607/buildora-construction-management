import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import FilterBar from '../components/common/FilterBar';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import FormModal from '../components/common/FormModal';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Procurement() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'requests' | 'deliveries' | 'vendors'
  const [loading, setLoading] = useState(true);

  // Data states
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showPOModal, setShowPOModal] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedPOForDelivery, setSelectedPOForDelivery] = useState(null);

  // New PO Form
  const [poForm, setPoForm] = useState({
    title: '',
    project: '',
    vendor: '',
    deliveryDate: '',
    itemName: '',
    quantity: 100,
    unitPrice: 350,
    unit: 'bags',
    notes: '',
  });

  // New PR Form
  const [prForm, setPrForm] = useState({
    title: '',
    project: '',
    requiredDate: '',
    priority: 'Medium',
    itemName: '',
    quantity: 50,
    estimatedRate: 400,
    unit: 'bags',
    notes: '',
  });

  // New Vendor Form
  const [vendorForm, setVendorForm] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    contactPerson: '',
    categories: 'Structural Steel & Rebar',
    taxId: '',
    paymentTerms: 'Net 30 Days',
  });

  // Delivery Receiving Form
  const [deliveryForm, setDeliveryForm] = useState({
    challanNumber: '',
    vehicleNumber: '',
    receivedQty: 0,
    acceptedQty: 0,
    rejectedQty: 0,
    qualityStatus: 'Passed',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [oRes, rRes, dRes, vRes, pRes] = await Promise.all([
        api.getPurchaseOrders(),
        api.getProcurementRequests(),
        api.getDeliveries(),
        api.getVendors(),
        api.getProjects(),
      ]);

      if (oRes.success) setOrders(oRes.data || []);
      if (rRes.success) setRequests(rRes.data || []);
      if (dRes.success) setDeliveries(dRes.data || []);
      if (vRes.success) setVendors(vRes.data || []);
      if (pRes.success) setProjects(pRes.data || []);
    } catch {
      showToast('Error loading procurement data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!poForm.title || !poForm.project || !poForm.vendor || !poForm.deliveryDate) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    const payload = {
      title: poForm.title,
      project: poForm.project,
      vendor: poForm.vendor,
      deliveryDate: poForm.deliveryDate,
      items: [
        {
          name: poForm.itemName || 'Construction Material',
          quantity: Number(poForm.quantity),
          unitPrice: Number(poForm.unitPrice),
          unit: poForm.unit,
        },
      ],
      notes: poForm.notes,
    };

    const res = await api.createPurchaseOrder(payload);
    if (res.success) {
      showToast(res.message || 'PO issued successfully', 'success');
      setShowPOModal(false);
      setPoForm({
        title: '',
        project: '',
        vendor: '',
        deliveryDate: '',
        itemName: '',
        quantity: 100,
        unitPrice: 350,
        unit: 'bags',
        notes: '',
      });
      loadData();
    } else {
      showToast(res.message || 'Failed to create PO', 'danger');
    }
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!prForm.title || !prForm.project || !prForm.requiredDate) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    const payload = {
      title: prForm.title,
      project: prForm.project,
      requiredDate: prForm.requiredDate,
      priority: prForm.priority,
      items: [
        {
          name: prForm.itemName || 'Requested Materials',
          quantity: Number(prForm.quantity),
          estimatedRate: Number(prForm.estimatedRate),
          unit: prForm.unit,
        },
      ],
      notes: prForm.notes,
    };

    const res = await api.createProcurementRequest(payload);
    if (res.success) {
      showToast(res.message || 'Purchase Request submitted', 'success');
      setShowPRModal(false);
      setPrForm({
        title: '',
        project: '',
        requiredDate: '',
        priority: 'Medium',
        itemName: '',
        quantity: 50,
        estimatedRate: 400,
        unit: 'bags',
        notes: '',
      });
      loadData();
    } else {
      showToast(res.message || 'Failed to submit request', 'danger');
    }
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!vendorForm.name || !vendorForm.email) {
      showToast('Vendor name and email are required', 'warning');
      return;
    }

    const res = await api.createVendor(vendorForm);
    if (res.success) {
      showToast('Vendor registered successfully', 'success');
      setShowVendorModal(false);
      setVendorForm({
        name: '',
        code: '',
        email: '',
        phone: '',
        contactPerson: '',
        categories: 'Structural Steel & Rebar',
        taxId: '',
        paymentTerms: 'Net 30 Days',
      });
      loadData();
    } else {
      showToast(res.message || 'Failed to register vendor', 'danger');
    }
  };

  const openDeliveryModal = (po) => {
    setSelectedPOForDelivery(po);
    const item = po.items?.[0] || {};
    const remaining = Math.max(0, (item.quantity || 0) - (item.receivedQuantity || 0));
    setDeliveryForm({
      challanNumber: `DC-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleNumber: 'MH-04-AZ-4921',
      receivedQty: remaining,
      acceptedQty: remaining,
      rejectedQty: 0,
      qualityStatus: 'Passed',
      notes: '',
    });
    setShowDeliveryModal(true);
  };

  const handleReceiveDelivery = async (e) => {
    e.preventDefault();
    if (!selectedPOForDelivery) return;

    const item = selectedPOForDelivery.items?.[0] || {};
    const rQty = Number(deliveryForm.receivedQty);
    const aQty = Number(deliveryForm.acceptedQty);
    const rejQty = Number(deliveryForm.rejectedQty);

    if (aQty + rejQty !== rQty) {
      showToast('Accepted + Rejected quantity must equal Received quantity', 'warning');
      return;
    }

    const payload = {
      purchaseOrder: selectedPOForDelivery.poNumber || selectedPOForDelivery._id,
      deliveryChallanNumber: deliveryForm.challanNumber,
      vehicleNumber: deliveryForm.vehicleNumber,
      items: [
        {
          material: item.material,
          name: item.name,
          orderedQuantity: item.quantity,
          receivedQuantity: rQty,
          acceptedQuantity: aQty,
          rejectedQuantity: rejQty,
          unit: item.unit || 'units',
          qualityStatus: deliveryForm.qualityStatus,
        },
      ],
      qualityStatus: deliveryForm.qualityStatus,
      notes: deliveryForm.notes,
    };

    const res = await api.createDelivery(payload);
    if (res.success) {
      showToast(res.message || 'Delivery received and inventory updated!', 'success');
      setShowDeliveryModal(false);
      loadData();
    } else {
      showToast(res.message || 'Delivery receiving failed', 'danger');
    }
  };

  // Tab configurations
  const tabOptions = [
    { value: 'orders', label: 'Purchase Orders', count: orders.length },
    { value: 'requests', label: 'Purchase Requests', count: requests.length },
    { value: 'deliveries', label: 'Goods Receipts (GRN)', count: deliveries.length },
    { value: 'vendors', label: 'Vendor Directory', count: vendors.length },
  ];

  // Total PO value metric
  const totalPOValue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingDeliveries = orders.filter((o) => ['Issued', 'Partially Delivered'].includes(o.status)).length;

  return (
    <div className="procurement-page" style={{ padding: '0 0.5rem' }}>
      <PageHeader
        title="Procurement & Supply Chain"
        subtitle="Manage supplier directory, purchase requisitions, orders, and delivery receiving with live inventory synchronization."
        breadcrumbs={[{ label: 'Workspace', href: '/dashboard' }, { label: 'Procurement' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowVendorModal(true)}
            >
              + New Vendor
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowPRModal(true)}
            >
              + New Request (PR)
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowPOModal(true)}
            >
              + Issue PO
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard
          title="Total Orders Committed"
          value={formatCurrency(totalPOValue, true)}
          subtitle={`${orders.length} orders total`}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
        />
        <StatCard
          title="Active Vendors"
          value={vendors.filter((v) => v.status === 'Active').length}
          subtitle="Approved suppliers"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>}
        />
        <StatCard
          title="Pending Deliveries"
          value={pendingDeliveries}
          trend={pendingDeliveries > 0 ? 'Awaiting arrival' : 'All delivered'}
          trendType={pendingDeliveries > 0 ? 'negative' : 'positive'}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          title="Goods Received (GRN)"
          value={deliveries.length}
          subtitle="Completed intake logs"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></svg>}
        />
      </div>

      {/* Tabs & Controls */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <FilterBar options={tabOptions} activeValue={activeTab} onChange={setActiveTab} />
          <SearchBar value={search} onChange={setSearch} placeholder="Search orders, vendors, or items..." onClear={() => setSearch('')} />
        </div>

        {/* TAB 1: PURCHASE ORDERS */}
        {activeTab === 'orders' && (
          <DataTable
            loading={loading}
            data={orders.filter((o) => {
              if (search) {
                const s = search.toLowerCase();
                return (
                  o.poNumber?.toLowerCase().includes(s) ||
                  o.title?.toLowerCase().includes(s) ||
                  o.vendorName?.toLowerCase().includes(s) ||
                  o.projectName?.toLowerCase().includes(s)
                );
              }
              return true;
            })}
            columns={[
              { key: 'poNumber', header: 'PO Number', sortable: true, width: '120px' },
              { key: 'title', header: 'Description', sortable: true },
              { key: 'projectName', header: 'Project', sortable: true },
              { key: 'vendorName', header: 'Vendor', sortable: true },
              {
                key: 'grandTotal',
                header: 'Total Value',
                sortable: true,
                render: (val) => <span style={{ fontWeight: 700 }}>{formatCurrency(val)}</span>,
              },
              {
                key: 'deliveryDate',
                header: 'Delivery Target',
                sortable: true,
                render: (val) => formatDate(val),
              },
              {
                key: 'status',
                header: 'Status',
                sortable: true,
                render: (val) => <StatusBadge status={val} />,
              },
              {
                key: 'actions',
                header: 'Action',
                render: (_, row) => (
                  <div>
                    {['Issued', 'Partially Delivered'].includes(row.status) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeliveryModal(row);
                        }}
                      >
                        Receive Goods
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}

        {/* TAB 2: PURCHASE REQUESTS */}
        {activeTab === 'requests' && (
          <DataTable
            loading={loading}
            data={requests.filter((r) => {
              if (search) {
                const s = search.toLowerCase();
                return (
                  r.requestId?.toLowerCase().includes(s) ||
                  r.title?.toLowerCase().includes(s) ||
                  r.projectName?.toLowerCase().includes(s)
                );
              }
              return true;
            })}
            columns={[
              { key: 'requestId', header: 'PR ID', sortable: true, width: '120px' },
              { key: 'title', header: 'Requisition Title', sortable: true },
              { key: 'projectName', header: 'Project', sortable: true },
              { key: 'requestedByName', header: 'Requested By', sortable: true },
              {
                key: 'totalEstimatedAmount',
                header: 'Estimated Value',
                sortable: true,
                render: (val) => formatCurrency(val),
              },
              {
                key: 'requiredDate',
                header: 'Required By',
                sortable: true,
                render: (val) => formatDate(val),
              },
              {
                key: 'priority',
                header: 'Priority',
                sortable: true,
                render: (val) => <PriorityBadge priority={val} />,
              },
              {
                key: 'status',
                header: 'Status',
                sortable: true,
                render: (val) => <StatusBadge status={val} />,
              },
            ]}
          />
        )}

        {/* TAB 3: DELIVERIES & GRN */}
        {activeTab === 'deliveries' && (
          <DataTable
            loading={loading}
            data={deliveries.filter((d) => {
              if (search) {
                const s = search.toLowerCase();
                return (
                  d.deliveryNumber?.toLowerCase().includes(s) ||
                  d.poNumber?.toLowerCase().includes(s) ||
                  d.vendorName?.toLowerCase().includes(s)
                );
              }
              return true;
            })}
            columns={[
              { key: 'deliveryNumber', header: 'GRN Number', sortable: true, width: '130px' },
              { key: 'poNumber', header: 'PO Ref', sortable: true, width: '120px' },
              { key: 'vendorName', header: 'Supplier', sortable: true },
              {
                key: 'deliveryDate',
                header: 'Receipt Date',
                sortable: true,
                render: (val) => formatDate(val),
              },
              {
                key: 'items',
                header: 'Received Details',
                render: (items) => (
                  <span style={{ fontSize: '0.82rem' }}>
                    {items?.[0] ? `${items[0].acceptedQuantity} ${items[0].unit} of ${items[0].name}` : '—'}
                  </span>
                ),
              },
              {
                key: 'qualityStatus',
                header: 'Quality QA',
                render: (val) => <StatusBadge status={val} />,
              },
              { key: 'receivedByName', header: 'Received By', sortable: true },
              {
                key: 'inventoryUpdated',
                header: 'Stock Sync',
                render: (val) => (
                  <span style={{ color: val ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>
                    {val ? '✓ Stock Updated' : 'Pending'}
                  </span>
                ),
              },
            ]}
          />
        )}

        {/* TAB 4: VENDORS */}
        {activeTab === 'vendors' && (
          <DataTable
            loading={loading}
            data={vendors.filter((v) => {
              if (search) {
                const s = search.toLowerCase();
                return (
                  v.name?.toLowerCase().includes(s) ||
                  v.email?.toLowerCase().includes(s) ||
                  v.code?.toLowerCase().includes(s)
                );
              }
              return true;
            })}
            columns={[
              { key: 'vendorId', header: 'Vendor ID', sortable: true, width: '120px' },
              { key: 'name', header: 'Business Name', sortable: true },
              { key: 'contactPerson', header: 'Contact Person' },
              { key: 'email', header: 'Email' },
              { key: 'phone', header: 'Phone' },
              {
                key: 'categories',
                header: 'Supplied Categories',
                render: (cats) => (Array.isArray(cats) ? cats.join(', ') : cats),
              },
              { key: 'paymentTerms', header: 'Terms' },
              {
                key: 'status',
                header: 'Status',
                sortable: true,
                render: (val) => <StatusBadge status={val} />,
              },
            ]}
          />
        )}
      </div>

      {/* MODAL: Issue Purchase Order */}
      <FormModal
        isOpen={showPOModal}
        onClose={() => setShowPOModal(false)}
        title="Issue Purchase Order"
        subtitle="Generate and dispatch a binding Purchase Order to an approved vendor"
      >
        <form onSubmit={handleCreatePO}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">PO Title / Scope *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Structural Steel Fe550D Batch 4"
              value={poForm.title}
              onChange={(e) => setPoForm({ ...poForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                className="form-control"
                value={poForm.project}
                onChange={(e) => setPoForm({ ...poForm, project: e.target.value })}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id || p.projectId} value={p.projectId || p._id}>
                    {p.name} ({p.projectId})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vendor *</label>
              <select
                className="form-control"
                value={poForm.vendor}
                onChange={(e) => setPoForm({ ...poForm, vendor: e.target.value })}
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v._id || v.vendorId} value={v.vendorId || v._id}>
                    {v.name} ({v.vendorId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Material Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="OPC 53 Cement"
                value={poForm.itemName}
                onChange={(e) => setPoForm({ ...poForm, itemName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                className="form-control"
                value={poForm.quantity}
                onChange={(e) => setPoForm({ ...poForm, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={poForm.unitPrice}
                onChange={(e) => setPoForm({ ...poForm, unitPrice: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-control"
                value={poForm.unit}
                onChange={(e) => setPoForm({ ...poForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Target Delivery Date *</label>
            <input
              type="date"
              className="form-control"
              value={poForm.deliveryDate}
              onChange={(e) => setPoForm({ ...poForm, deliveryDate: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowPOModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Purchase Order
            </button>
          </div>
        </form>
      </FormModal>

      {/* MODAL: Goods Receipt & Delivery Intake */}
      <FormModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        title={`Receive Delivery for ${selectedPOForDelivery?.poNumber || ''}`}
        subtitle="Verify delivered quantities against ordered items. Accepted quantities will automatically increase inventory stock."
      >
        <form onSubmit={handleReceiveDelivery}>
          <div style={{ backgroundColor: 'var(--color-warm-sand)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem' }}>
            <div><strong>PO:</strong> {selectedPOForDelivery?.title}</div>
            <div><strong>Vendor:</strong> {selectedPOForDelivery?.vendorName}</div>
            <div>
              <strong>Ordered:</strong> {selectedPOForDelivery?.items?.[0]?.quantity} {selectedPOForDelivery?.items?.[0]?.unit} |{' '}
              <strong>Already Received:</strong> {selectedPOForDelivery?.items?.[0]?.receivedQuantity || 0}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Challan / Bill Number</label>
              <input
                type="text"
                className="form-control"
                value={deliveryForm.challanNumber}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, challanNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Truck / Vehicle Number</label>
              <input
                type="text"
                className="form-control"
                value={deliveryForm.vehicleNumber}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, vehicleNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Total Received *</label>
              <input
                type="number"
                className="form-control"
                value={deliveryForm.receivedQty}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, receivedQty: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Accepted (Stock In) *</label>
              <input
                type="number"
                className="form-control"
                value={deliveryForm.acceptedQty}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, acceptedQty: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rejected / Damaged</label>
              <input
                type="number"
                className="form-control"
                value={deliveryForm.rejectedQty}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, rejectedQty: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">QA Inspection Result</label>
            <select
              className="form-control"
              value={deliveryForm.qualityStatus}
              onChange={(e) => setDeliveryForm({ ...deliveryForm, qualityStatus: e.target.value })}
            >
              <option value="Passed">Passed (Meets IS Spec & Quality Standards)</option>
              <option value="Partially Rejected">Partially Rejected (Damaged or substandard items rejected)</option>
              <option value="Rejected">Rejected Entire Consignment</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowDeliveryModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Receipt & Update Inventory
            </button>
          </div>
        </form>
      </FormModal>

      {/* MODAL: Register New Vendor */}
      <FormModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        title="Register Construction Vendor"
        subtitle="Add a new verified material supplier or trade subcontractor"
      >
        <form onSubmit={handleCreateVendor}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Business Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. UltraTech Cement Corp"
              value={vendorForm.name}
              onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Corporate Email *</label>
              <input
                type="email"
                className="form-control"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-control"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <input
                type="text"
                className="form-control"
                value={vendorForm.paymentTerms}
                onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowVendorModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Vendor
            </button>
          </div>
        </form>
      </FormModal>

      {/* MODAL: Submit Purchase Request */}
      <FormModal
        isOpen={showPRModal}
        onClose={() => setShowPRModal(false)}
        title="Create Purchase Request"
        subtitle="Submit a material requisition for project engineering approval"
      >
        <form onSubmit={handleCreatePR}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Requisition Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Ready-mix M25 Concrete Pour"
              value={prForm.title}
              onChange={(e) => setPrForm({ ...prForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                className="form-control"
                value={prForm.project}
                onChange={(e) => setPrForm({ ...prForm, project: e.target.value })}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id || p.projectId} value={p.projectId || p._id}>
                    {p.name} ({p.projectId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Required Date *</label>
              <input
                type="date"
                className="form-control"
                value={prForm.requiredDate}
                onChange={(e) => setPrForm({ ...prForm, requiredDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="M25 Ready-Mix Concrete"
                value={prForm.itemName}
                onChange={(e) => setPrForm({ ...prForm, itemName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                className="form-control"
                value={prForm.quantity}
                onChange={(e) => setPrForm({ ...prForm, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Est. Rate (₹)</label>
              <input
                type="number"
                className="form-control"
                value={prForm.estimatedRate}
                onChange={(e) => setPrForm({ ...prForm, estimatedRate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-control"
                value={prForm.unit}
                onChange={(e) => setPrForm({ ...prForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowPRModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
