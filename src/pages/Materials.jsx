import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

const CATEGORIES = [
  'All',
  'Structural & Civil',
  'Masonry & Precast',
  'Aggregates & Sand',
  'Cement & Binders',
  'Electrical & Conduits',
  'Plumbing & Drainage',
  'Waterproofing & Chemicals',
  'Finishes & Paints'
];

export default function Materials() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetMaterial, setRequestTargetMaterial] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'Structural & Civil',
    unit: 'bag',
    project: 'Skyline Heights',
    projectId: 'PRJ-101',
    currentStock: '',
    minimumStock: '',
    reorderLevel: '',
    unitCost: '',
    description: ''
  });

  const [requestForm, setRequestForm] = useState({
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
      const [mRes, pRes, rRes] = await Promise.all([
        api.getMaterials(),
        api.getProjects(),
        api.getMaterialRequests()
      ]);

      if (mRes.success) setMaterials(mRes.data);
      if (pRes.success) setProjects(pRes.data);
      if (rRes.success) setRequests(rRes.data);
    } catch {
      showToast('Error loading materials inventory', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = materials.length;
    const lowStock = materials.filter((m) => m.status === 'Low Stock').length;
    const outOfStock = materials.filter((m) => m.status === 'Out of Stock').length;
    const pendingReqs = requests.filter((r) => r.status === 'Pending').length;
    return { total, lowStock, outOfStock, pendingReqs };
  }, [materials, requests]);

  // Urgent low-stock items for alert banner
  const urgentItems = useMemo(() => {
    return materials.filter((m) => m.status === 'Low Stock' || m.status === 'Out of Stock');
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && m.status !== statusFilter) return false;
      if (projectFilter !== 'All' && m.projectId !== projectFilter && m.project !== projectFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.category && m.category.toLowerCase().includes(q)) ||
          (m.project && m.project.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [materials, search, categoryFilter, statusFilter, projectFilter]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: 'Structural & Civil',
      unit: 'bag',
      project: projects[0]?.name || 'Skyline Heights',
      projectId: projects[0]?.id || 'PRJ-101',
      currentStock: '',
      minimumStock: '50',
      reorderLevel: '100',
      unitCost: '',
      description: ''
    });
    setEditingMaterial(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category || 'Structural & Civil',
      unit: material.unit || 'bag',
      project: material.project || 'Skyline Heights',
      projectId: material.projectId || 'PRJ-101',
      currentStock: material.currentStock,
      minimumStock: material.minimumStock || 0,
      reorderLevel: material.reorderLevel || 10,
      unitCost: material.unitCost || 0,
      description: material.description || ''
    });
    setIsCreateOpen(true);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Material name is required', 'warning');
      return;
    }

    try {
      if (editingMaterial) {
        const res = await api.updateMaterial(editingMaterial.id, formData);
        if (res.success) {
          showToast('Material updated successfully', 'success');
          setIsCreateOpen(false);
          loadData();
        } else {
          showToast(res.message || 'Failed to update material', 'danger');
        }
      } else {
        const res = await api.createMaterial(formData, currentUser);
        if (res.success) {
          showToast('Material added to project catalogue', 'success');
          setIsCreateOpen(false);
          loadData();
        } else {
          showToast(res.message || 'Failed to create material', 'danger');
        }
      }
    } catch {
      showToast('An error occurred while saving material', 'danger');
    }
  };

  const handleOpenRequest = (material) => {
    setRequestTargetMaterial(material);
    setRequestForm({
      materialName: material ? material.name : '',
      projectId: material ? material.projectId : 'PRJ-101',
      projectName: material ? material.project : 'Skyline Heights',
      quantity: material ? String(Math.max(1, (material.reorderLevel || 10) * 2 - material.currentStock)) : '100',
      unit: material ? material.unit : 'bag',
      requiredByDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      notes: material ? `Replenishment requisition: current stock (${material.currentStock} ${material.unit}) below reorder threshold.` : ''
    });
    setIsRequestModalOpen(true);
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.materialName.trim() || !requestForm.quantity) {
      showToast('Please specify material and quantity', 'warning');
      return;
    }

    const res = await api.createMaterialRequest(requestForm, currentUser);
    if (res.success) {
      showToast('Material request submitted to procurement queue', 'success');
      setIsRequestModalOpen(false);
      loadData();
    } else {
      showToast(res.message || 'Failed to submit request', 'danger');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="empty-state-icon">⏳</div>
        <h3>Loading Construction Materials Directory...</h3>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="projects-header">
        <div className="projects-header-text">
          <h1>Materials Directory</h1>
          <p>Manage project bill of materials, inventory quotas, unit specifications, and threshold limits.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => handleOpenRequest(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="12" y2="18"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
            Request Material
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Material
          </button>
        </div>
      </div>

      {/* Operational KPI Summary */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FAF8F5', color: 'var(--color-primary-dark)' }}>
            📦
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Catalogued Materials</span>
            <div className="stat-value">{metrics.total}</div>
            <span className="stat-trend text-muted">Across all active projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFFBEB', color: 'var(--color-warning)' }}>
            ⚠️
          </div>
          <div className="stat-info">
            <span className="stat-label">Low Stock Warnings</span>
            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{metrics.lowStock}</div>
            <span className="stat-trend text-muted">At or below reorder level</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF2F2', color: 'var(--color-danger)' }}>
            🚨
          </div>
          <div className="stat-info">
            <span className="stat-label">Depleted / Out of Stock</span>
            <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{metrics.outOfStock}</div>
            <span className="stat-trend text-danger">Immediate site procurement needed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EFF6FF', color: 'var(--color-info)' }}>
            📋
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Material Requisitions</span>
            <div className="stat-value">{metrics.pendingReqs}</div>
            <span className="stat-trend text-muted">Awaiting procurement sign-off</span>
          </div>
        </div>
      </div>

      {/* Operational Low-Stock Banner */}
      {urgentItems.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-danger)', background: '#FFFDFB' }}>
          <div className="card-header" style={{ padding: '0.85rem 1.25rem' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong style={{ color: 'var(--color-primary-dark)' }}>Operational Alert: {urgentItems.length} Materials Require Replenishment</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Stock shortages risk slowing scheduled milestone concrete pours and site activities.</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 1.25rem 1rem 1.25rem', display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
            {urgentItems.map((item) => (
              <div
                key={item.id}
                style={{
                  minWidth: '240px',
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.35rem' }}>
                    <StatusBadge status={item.status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.project}</span>
                  </div>
                  <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.25rem' }}>{item.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Current: <strong style={{ color: item.currentStock === 0 ? 'var(--color-danger)' : 'inherit' }}>{item.currentStock} {item.unit}</strong> | Reorder: {item.reorderLevel} {item.unit}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '0.75rem', fontSize: '0.75rem', width: '100%' }}
                  onClick={() => handleOpenRequest(item)}
                >
                  ⚡ Reorder Stock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="projects-controls-bar">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search material, brand, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group flex gap-2">
          <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id || p._id} value={p.projectId || p.name}>{p.name}</option>
            ))}
          </select>

          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Materials Data Table */}
      <div className="card" style={{ marginTop: '1rem', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Material Details</th>
                <th>Category</th>
                <th>Project Allocation</th>
                <th>Unit</th>
                <th>Current Stock</th>
                <th>Reorder Threshold</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No materials matched your selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => (
                  <tr key={mat.id}>
                    <td>
                      <div>
                        <strong>{mat.name}</strong>
                        {mat.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                            {mat.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {mat.category}
                      </span>
                    </td>
                    <td>{mat.project || mat.projectName || 'General Site Store'}</td>
                    <td><span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}>{mat.unit}</span></td>
                    <td>
                      <strong style={{ color: mat.currentStock === 0 ? 'var(--color-danger)' : 'inherit' }}>
                        {mat.currentStock} {mat.unit}
                      </strong>
                    </td>
                    <td>{mat.reorderLevel} {mat.unit}</td>
                    <td>
                      <StatusBadge status={mat.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenRequest(mat)}
                          title="Raise replenishment request"
                        >
                          Request
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenEdit(mat)}
                          title="Edit material details"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Material */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingMaterial ? 'Edit Material Specifications' : 'Register New Construction Material'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveMaterial} style={{ padding: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Material Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. UltraTech OPC 53 Grade Cement"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select
                className="form-control"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="bag">bag (Bags)</option>
                <option value="ton">ton (Metric Tonnes)</option>
                <option value="m3">m³ (Cubic Meters)</option>
                <option value="kg">kg (Kilograms)</option>
                <option value="piece">piece (Pieces / Nos)</option>
                <option value="meter">meter (Running Meters)</option>
                <option value="box">box (Boxes)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Allocated Project</label>
              <select
                className="form-control"
                value={formData.projectId}
                onChange={(e) => {
                  const p = projects.find((x) => (x.projectId || x.id) === e.target.value);
                  setFormData({
                    ...formData,
                    projectId: e.target.value,
                    project: p ? p.name : 'Skyline Heights'
                  });
                }}
              >
                {projects.map((p) => (
                  <option key={p.id || p._id} value={p.projectId || p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current Stock Count</label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-control"
                placeholder="Initial on-site stock"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Reorder Warning Threshold</label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-control"
                placeholder="Low-stock trigger level"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Unit Cost (₹)</label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-control"
                placeholder="Cost per unit in INR"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Technical Specification / Notes</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Grade, supplier specs, testing certifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMaterial ? 'Save Changes' : 'Register Material'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Material Request */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Raise Material Procurement Requisition"
        maxWidth="550px"
      >
        <form onSubmit={handleSaveRequest} style={{ padding: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Material Required *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Material name and grade"
              value={requestForm.materialName}
              onChange={(e) => setRequestForm({ ...requestForm, materialName: e.target.value })}
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
                placeholder="Quantity"
                value={requestForm.quantity}
                onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-control"
                value={requestForm.unit}
                onChange={(e) => setRequestForm({ ...requestForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Destination Site</label>
              <select
                className="form-control"
                value={requestForm.projectId}
                onChange={(e) => {
                  const p = projects.find((x) => (x.projectId || x.id) === e.target.value);
                  setRequestForm({
                    ...requestForm,
                    projectId: e.target.value,
                    projectName: p ? p.name : 'Skyline Heights'
                  });
                }}
              >
                {projects.map((p) => (
                  <option key={p.id || p._id} value={p.projectId || p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Required on Site By *</label>
              <input
                type="date"
                required
                className="form-control"
                value={requestForm.requiredByDate}
                onChange={(e) => setRequestForm({ ...requestForm, requiredByDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Justification / Construction Activity Notes</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. For upcoming 19th floor column pour and shear wall rebar binding..."
              value={requestForm.notes}
              onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
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
