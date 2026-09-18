import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export default function Inventory() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab: 'movements' | 'stock' | 'requests'
  const [activeTab, setActiveTab] = useState('movements');

  // Modals
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState('IN'); // 'IN', 'OUT', 'ADJUSTMENT'
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Movement Form
  const [movementForm, setMovementForm] = useState({
    materialId: '',
    quantity: '',
    newStock: '',
    reference: '',
    notes: ''
  });

  // Requisition Form
  const [reqForm, setReqForm] = useState({
    materialName: '',
    projectId: 'PRJ-101',
    projectName: 'Skyline Heights',
    quantity: '',
    unit: 'bag',
    requiredByDate: '',
    notes: ''
  });

  const loadData = async () => {
    try {
      const [mRes, tRes, rRes] = await Promise.all([
        api.getMaterials(),
        api.getInventoryTransactions(),
        api.getMaterialRequests()
      ]);

      if (mRes.success) setMaterials(mRes.data);
      if (tRes.success) setTransactions(tRes.data);
      if (rRes.success) setMaterialRequests(rRes.data);
    } catch {
      showToast('Error loading inventory transactions', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Low-stock items
  const lowStockItems = useMemo(() => {
    return materials.filter((m) => m.status === 'Low Stock' || m.status === 'Out of Stock');
  }, [materials]);

  const handleOpenMovement = (type, preselectedMaterialId = '') => {
    setMovementType(type);
    const defaultMatId = preselectedMaterialId || (materials.length > 0 ? materials[0].id : '');
    const selected = materials.find((m) => m.id === defaultMatId);

    setMovementForm({
      materialId: defaultMatId,
      quantity: '',
      newStock: selected ? String(selected.currentStock) : '',
      reference: type === 'IN' ? 'PO-RECEIPT' : type === 'OUT' ? 'SITE-ISSUE' : 'AUDIT-ADJ',
      notes: ''
    });
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = async (e) => {
    e.preventDefault();
    if (!movementForm.materialId) {
      showToast('Please select a material', 'warning');
      return;
    }

    try {
      if (movementType === 'IN') {
        if (!movementForm.quantity || Number(movementForm.quantity) <= 0) {
          showToast('Quantity must be greater than zero', 'warning');
          return;
        }
        const res = await api.receiveStock(
          {
            materialId: movementForm.materialId,
            quantity: Number(movementForm.quantity),
            reference: movementForm.reference,
            notes: movementForm.notes
          },
          currentUser
        );
        if (res.success) {
          showToast(res.message, 'success');
          setIsMovementModalOpen(false);
          loadData();
        } else {
          showToast(res.message || 'Receive operation failed', 'danger');
        }
      } else if (movementType === 'OUT') {
        if (!movementForm.quantity || Number(movementForm.quantity) <= 0) {
          showToast('Quantity must be greater than zero', 'warning');
          return;
        }
        const res = await api.issueStock(
          {
            materialId: movementForm.materialId,
            quantity: Number(movementForm.quantity),
            reference: movementForm.reference,
            notes: movementForm.notes
          },
          currentUser
        );
        if (res.success) {
          showToast(res.message, 'success');
          setIsMovementModalOpen(false);
          loadData();
        } else {
          showToast(res.message || 'Issue operation failed', 'danger');
        }
      } else if (movementType === 'ADJUSTMENT') {
        if (movementForm.newStock === '' || Number(movementForm.newStock) < 0) {
          showToast('New stock count cannot be negative', 'warning');
          return;
        }
        const res = await api.adjustStock(
          {
            materialId: movementForm.materialId,
            newStock: Number(movementForm.newStock),
            reference: movementForm.reference,
            notes: movementForm.notes
          },
          currentUser
        );
        if (res.success) {
          showToast(res.message, 'success');
          setIsMovementModalOpen(false);
          loadData();
        } else {
          showToast(res.message || 'Adjustment failed', 'danger');
        }
      }
    } catch {
      showToast('Error recording stock movement', 'danger');
    }
  };

  const handleOpenNewRequest = (matName = '', unit = 'bag') => {
    setReqForm({
      materialName: matName,
      projectId: 'PRJ-101',
      projectName: 'Skyline Heights',
      quantity: '100',
      unit: unit,
      requiredByDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      notes: ''
    });
    setIsRequestModalOpen(true);
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!reqForm.materialName.trim() || !reqForm.quantity) {
      showToast('Material and quantity required', 'warning');
      return;
    }

    const res = await api.createMaterialRequest(reqForm, currentUser);
    if (res.success) {
      showToast('Requisition logged in procurement queue', 'success');
      setIsRequestModalOpen(false);
      loadData();
    } else {
      showToast(res.message || 'Failed to submit request', 'danger');
    }
  };

  const activeMaterial = materials.find((m) => m.id === movementForm.materialId);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Stock Management & Movement Ledger...</h3>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="projects-header">
        <div className="projects-header-text">
          <h1>Inventory & Stock Ledger</h1>
          <p>Real-time physical stock counts, inbound consignments, site dispatches, and audit reconciliations.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => handleOpenMovement('ADJUSTMENT')}>
            ⚖️ Audit Adjust
          </button>
          <button className="btn btn-outline" onClick={() => handleOpenMovement('OUT')}>
            📤 Issue to Site (OUT)
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenMovement('IN')}>
            📥 Receive Stock (IN)
          </button>
        </div>
      </div>

      {/* Operational Highlights */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FAF8F5', color: 'var(--color-primary-dark)' }}>
            📊
          </div>
          <div className="stat-info">
            <span className="stat-label">Stocked SKUs</span>
            <div className="stat-value">{materials.length} Items</div>
            <span className="stat-trend text-muted">Across active sites</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFFBEB', color: 'var(--color-warning)' }}>
            ⚠️
          </div>
          <div className="stat-info">
            <span className="stat-label">Critical / Low Stock</span>
            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{lowStockItems.length}</div>
            <span className="stat-trend text-muted">Below reorder trigger</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EFF6FF', color: 'var(--color-info)' }}>
            🔄
          </div>
          <div className="stat-info">
            <span className="stat-label">Recent Movements</span>
            <div className="stat-value">{transactions.length}</div>
            <span className="stat-trend text-muted">Ledger entries logged</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F5F3FF', color: 'var(--color-accent)' }}>
            📝
          </div>
          <div className="stat-info">
            <span className="stat-label">Requisitions</span>
            <div className="stat-value">{materialRequests.length}</div>
            <span className="stat-trend text-muted">Site procurement requests</span>
          </div>
        </div>
      </div>

      {/* Low Stock Operational Action Banner */}
      {lowStockItems.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-warning)', background: '#FFFDF9' }}>
          <div className="card-header" style={{ padding: '0.85rem 1.25rem' }}>
            <div className="flex items-center justify-between" style={{ width: '100%' }}>
              <div>
                <strong style={{ color: 'var(--color-primary-dark)' }}>Low-Stock Material Alerts</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Materials with depleted yard inventory requiring immediate PO issuance.</div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleOpenNewRequest()}
              >
                + Raise Requisition
              </button>
            </div>
          </div>
          <div style={{ padding: '0 1.25rem 1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                    <StatusBadge status={item.status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.project}</span>
                  </div>
                  <strong style={{ fontSize: '0.88rem' }}>{item.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                    Stock: <strong style={{ color: item.currentStock === 0 ? 'var(--color-danger)' : 'inherit' }}>{item.currentStock} {item.unit}</strong> (Min: {item.reorderLevel} {item.unit})
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => handleOpenMovement('IN', item.id)}
                >
                  Receive
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'movements' ? 'active' : ''}`}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'movements' ? '2px solid var(--color-primary-dark)' : '2px solid transparent',
            fontWeight: activeTab === 'movements' ? 600 : 400,
            cursor: 'pointer',
            color: activeTab === 'movements' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'
          }}
          onClick={() => setActiveTab('movements')}
        >
          📜 Movement Audit Log ({transactions.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'stock' ? '2px solid var(--color-primary-dark)' : '2px solid transparent',
            fontWeight: activeTab === 'stock' ? 600 : 400,
            cursor: 'pointer',
            color: activeTab === 'stock' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'
          }}
          onClick={() => setActiveTab('stock')}
        >
          📦 Current Stock Balance ({materials.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '2px solid var(--color-primary-dark)' : '2px solid transparent',
            fontWeight: activeTab === 'requests' ? 600 : 400,
            cursor: 'pointer',
            color: activeTab === 'requests' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'
          }}
          onClick={() => setActiveTab('requests')}
        >
          📋 Material Requisitions ({materialRequests.length})
        </button>
      </div>

      {/* Tab 1: Recent Movements Ledger Table */}
      {activeTab === 'movements' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Type</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Project / Yard</th>
                  <th>Balance After</th>
                  <th>Reference</th>
                  <th>Performed By</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      No stock transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id || txn.transactionId}>
                      <td><code style={{ fontSize: '0.8rem', fontWeight: 600 }}>{txn.id || txn.transactionId}</code></td>
                      <td>
                        <span
                          className={`badge ${
                            txn.type === 'IN'
                              ? 'badge-success'
                              : txn.type === 'OUT'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                          style={{ fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {txn.type === 'IN' ? '↓ IN (Receive)' : txn.type === 'OUT' ? '↑ OUT (Issue)' : '⚖ ADJ'}
                        </span>
                      </td>
                      <td>
                        <strong>{txn.materialName}</strong>
                        {txn.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                            {txn.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: txn.type === 'IN' ? 'var(--color-success)' : txn.type === 'OUT' ? 'var(--color-danger)' : 'inherit' }}>
                          {txn.type === 'IN' ? '+' : txn.type === 'OUT' ? '-' : ''}{txn.quantity} {txn.unit}
                        </strong>
                      </td>
                      <td>{txn.project || txn.projectName || 'Skyline Heights'}</td>
                      <td>{txn.balanceAfter} {txn.unit}</td>
                      <td><span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{txn.reference || 'N/A'}</span></td>
                      <td>{txn.performedBy || 'System User'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{txn.date || 'Today'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Current Stock Quick Ledger */}
      {activeTab === 'stock' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Category</th>
                  <th>Project Site</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat) => (
                  <tr key={mat.id}>
                    <td>
                      <strong>{mat.name}</strong>
                    </td>
                    <td>{mat.category}</td>
                    <td>{mat.project}</td>
                    <td>
                      <strong style={{ color: mat.currentStock === 0 ? 'var(--color-danger)' : 'inherit' }}>
                        {mat.currentStock} {mat.unit}
                      </strong>
                    </td>
                    <td>{mat.reorderLevel} {mat.unit}</td>
                    <td><StatusBadge status={mat.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleOpenMovement('IN', mat.id)}
                        >
                          Receive
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleOpenMovement('OUT', mat.id)}
                        >
                          Issue
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Material Requisitions */}
      {activeTab === 'requests' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header flex justify-between items-center">
            <div>
              <div className="card-title">Site Material Requisitions</div>
              <div className="card-subtitle">Purchase requests submitted by field engineers and site supervisors</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => handleOpenNewRequest()}>
              + New Requisition
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Project Site</th>
                  <th>Required By</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {materialRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      No material requests submitted.
                    </td>
                  </tr>
                ) : (
                  materialRequests.map((req) => (
                    <tr key={req.id || req.requestId}>
                      <td><code style={{ fontSize: '0.8rem', fontWeight: 600 }}>{req.id || req.requestId}</code></td>
                      <td><strong>{req.materialName}</strong></td>
                      <td><strong>{req.quantity} {req.unit}</strong></td>
                      <td>{req.projectName || req.projectId}</td>
                      <td>{req.requiredByDate}</td>
                      <td>{req.requestedBy}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{req.notes || 'None'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Movement Modal (IN, OUT, ADJUSTMENT) */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title={
          movementType === 'IN'
            ? '📥 Record Inbound Stock Consignment (IN)'
            : movementType === 'OUT'
            ? '📤 Issue Stock to Construction Site (OUT)'
            : '⚖️ Physical Stock Count Audit Adjustment'
        }
        maxWidth="550px"
      >
        <form onSubmit={handleSaveMovement} style={{ padding: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select Material *</label>
            <select
              className="form-control"
              required
              value={movementForm.materialId}
              onChange={(e) => {
                const mat = materials.find((m) => m.id === e.target.value);
                setMovementForm({
                  ...movementForm,
                  materialId: e.target.value,
                  newStock: mat ? String(mat.currentStock) : ''
                });
              }}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.project}) — Available: {m.currentStock} {m.unit}
                </option>
              ))}
            </select>
          </div>

          {activeMaterial && (
            <div
              style={{
                background: '#FAF8F5',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              <div>Project: <strong>{activeMaterial.project}</strong></div>
              <div>Current In-Stock: <strong>{activeMaterial.currentStock} {activeMaterial.unit}</strong></div>
              <div>Reorder Threshold: <strong>{activeMaterial.reorderLevel} {activeMaterial.unit}</strong></div>
            </div>
          )}

          {movementType !== 'ADJUSTMENT' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  {movementType === 'IN' ? 'Received Quantity *' : 'Issue Quantity *'}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  className="form-control"
                  placeholder={movementType === 'IN' ? 'Quantity received' : 'Quantity to site'}
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  disabled
                  className="form-control"
                  value={activeMaterial?.unit || 'unit'}
                />
              </div>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Verified Physical Stock Balance *</label>
              <input
                type="number"
                step="any"
                min="0"
                required
                className="form-control"
                placeholder="Audited quantity on ground"
                value={movementForm.newStock}
                onChange={(e) => setMovementForm({ ...movementForm, newStock: e.target.value })}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Reference ID (PO #, Challan, GRN, Audit Note)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. PO-8821, DC-0442, AUDIT-2026"
              value={movementForm.reference}
              onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Operational Notes</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Driver name, vehicle number, batch stamp, quality inspection..."
              value={movementForm.notes}
              onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-outline" onClick={() => setIsMovementModalOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${movementType === 'IN' ? 'btn-primary' : movementType === 'OUT' ? 'btn-accent' : 'btn-primary'}`}
            >
              {movementType === 'IN' ? 'Confirm Stock Receipt' : movementType === 'OUT' ? 'Authorize Site Issue' : 'Save Balance Adjustment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Requisition */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Raise Material Procurement Requisition"
        maxWidth="550px"
      >
        <form onSubmit={handleSaveRequest} style={{ padding: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Material Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. UltraTech Cement, Fe 500D Rebar"
              value={reqForm.materialName}
              onChange={(e) => setReqForm({ ...reqForm, materialName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Required Quantity *</label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                className="form-control"
                value={reqForm.quantity}
                onChange={(e) => setReqForm({ ...reqForm, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-control"
                value={reqForm.unit}
                onChange={(e) => setReqForm({ ...reqForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Required on Site By *</label>
            <input
              type="date"
              required
              className="form-control"
              value={reqForm.requiredByDate}
              onChange={(e) => setReqForm({ ...reqForm, requiredByDate: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Requisition Justification</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Floor level, milestone requirement, supplier quote..."
              value={reqForm.notes}
              onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-outline" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Requisition
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
