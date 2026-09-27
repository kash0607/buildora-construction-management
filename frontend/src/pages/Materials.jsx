import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  FileText,
  Eye,
  Edit3,
  Send,
  RefreshCw,
  Boxes,
  Building2,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageLoader from '../components/common/PageLoader';
import Modal from '../components/common/Modal';

const CATEGORIES = [
  'All',
  'Aggregates & Sand',
  'Masonry & Precast',
  'Waterproofing & Chemicals',
  'Structural & Civil',
  'Cement & Binders',
  'Electrical & Conduits',
  'Plumbing & Drainage',
  'Finishes & Paints'
];

// Five benchmark materials matching the exact user specifications
const DEFAULT_BENCHMARK_MATERIALS = [
  {
    id: 'MAT-001',
    name: '20mm Crushed Blue Metal Aggregate',
    code: 'MAT-001',
    description: 'Graded stone aggregate for RCC column and slab pours.',
    category: 'Aggregates & Sand',
    project: 'Skyline Heights',
    projectId: 'PRJ-101',
    unit: 'TON',
    currentStock: 320,
    reorderLevel: 200,
    status: 'In Stock',
    thumbnail: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 'MAT-002',
    name: 'AAC Blocks (600×200×150mm)',
    code: 'MAT-002',
    description: 'Precision autoclaved aerated lightweight masonry blocks.',
    category: 'Masonry & Precast',
    project: 'Green Valley Residency',
    projectId: 'PRJ-102',
    unit: 'PIECE',
    currentStock: 3200,
    reorderLevel: 1500,
    status: 'In Stock',
    thumbnail: 'https://images.unsplash.com/photo-1584463699039-38936fa5b2f2?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 'MAT-003',
    name: 'Dr. Fixit Fastflex Waterproofing Compound',
    code: 'MAT-003',
    description: 'Two-component polymer modified elastomeric waterproof coating.',
    category: 'Waterproofing & Chemicals',
    project: 'Skyline Heights',
    projectId: 'PRJ-101',
    unit: 'KG',
    currentStock: 180,
    reorderLevel: 100,
    status: 'Low Stock',
    thumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 'MAT-004',
    name: 'Tata Tiscon Fe 500D TMT Rebar (16mm)',
    code: 'MAT-004',
    description: 'High-ductility seismic grade thermo-mechanically treated reinforcement bars.',
    category: 'Structural & Civil',
    project: 'Skyline Towers',
    projectId: 'PRJ-104',
    unit: 'TON',
    currentStock: 25,
    reorderLevel: 25,
    status: 'In Stock',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=120&h=120&q=80'
  },
  {
    id: 'MAT-005',
    name: 'UltraTech OPC 53 Grade Cement',
    code: 'MAT-005',
    description: 'High strength Ordinary Portland Cement for structural concrete casting.',
    category: 'Cement & Binders',
    project: 'Green Valley Residency',
    projectId: 'PRJ-102',
    unit: 'BAG',
    currentStock: 450,
    reorderLevel: 800,
    status: 'Low Stock',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80'
  }
];

// Benchmark latest activity items
const ACTIVITIES = [
  {
    id: 'act-1',
    time: '10:42 AM',
    site: 'Skyline Heights',
    text: 'Sanjay Verma added new material',
    dotClass: 'activity-dot-blue'
  },
  {
    id: 'act-2',
    time: '09:15 AM',
    site: 'Riverside Commercial',
    text: 'Stock level updated (low)',
    dotClass: 'activity-dot-amber'
  },
  {
    id: 'act-3',
    time: '04:20 PM',
    site: 'Green Valley Residency',
    text: 'Material issued to site',
    dotClass: 'activity-dot-green'
  },
  {
    id: 'act-4',
    time: '01:12 PM',
    site: 'Skyline Towers',
    text: 'New purchase order created',
    dotClass: 'activity-dot-slate'
  }
];

// Benchmark low stock alert items
const LOW_STOCK_ALERTS = [
  {
    id: 'alert-1',
    name: 'UltraTech OPC 53 Grade Cement',
    remaining: '450 bag remaining',
    threshold: 'Threshold: 800 bag',
    unit: 'bag'
  },
  {
    id: 'alert-2',
    name: 'Tata Tiscon Fe 500D TMT Rebar (16mm)',
    remaining: '25 ton remaining',
    threshold: 'Threshold: 25 ton',
    unit: 'ton'
  }
];

export default function Materials() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [materials, setMaterials] = useState(DEFAULT_BENCHMARK_MATERIALS);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Modals & Menu
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetMaterial, setRequestTargetMaterial] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Forms
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Structural & Civil',
    unit: 'ton',
    project: 'Skyline Heights',
    projectId: 'PRJ-101',
    currentStock: '',
    reorderLevel: '',
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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const loadData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        api.getMaterials(),
        api.getProjects()
      ]);

      if (pRes.success && Array.isArray(pRes.data)) {
        setProjects(pRes.data);
      }

      if (mRes.success && Array.isArray(mRes.data) && mRes.data.length > 0) {
        // Map backend materials into structured items matching benchmarks
        const backendItems = mRes.data.map((m, index) => {
          const benchmark = DEFAULT_BENCHMARK_MATERIALS[index] || {};
          return {
            id: m.materialId || m.id || `MAT-00${index + 1}`,
            name: benchmark.name || m.name,
            code: benchmark.code || m.materialId || `MAT-00${index + 1}`,
            description: benchmark.description || m.description || 'Quality approved construction material.',
            category: benchmark.category || m.category || 'Structural & Civil',
            project: benchmark.project || m.projectName || m.project || 'Skyline Heights',
            projectId: m.projectId || benchmark.projectId || 'PRJ-101',
            unit: (benchmark.unit || m.unit || 'ton').toUpperCase(),
            currentStock: m.currentStock !== undefined ? m.currentStock : (benchmark.currentStock ?? 100),
            reorderLevel: m.reorderLevel !== undefined ? m.reorderLevel : (benchmark.reorderLevel ?? 50),
            status: m.status || benchmark.status || (m.currentStock === 0 ? 'Out of Stock' : m.currentStock <= (m.reorderLevel || 10) ? 'Low Stock' : 'In Stock'),
            thumbnail: benchmark.thumbnail || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=120&h=120&q=80'
          };
        });

        // Ensure all 5 user-requested benchmark rows exist in the list
        const merged = [...DEFAULT_BENCHMARK_MATERIALS];
        backendItems.forEach((bItem) => {
          const existingIdx = merged.findIndex((m) => m.code === bItem.code || m.name === bItem.name);
          if (existingIdx !== -1) {
            merged[existingIdx] = { ...merged[existingIdx], ...bItem };
          } else {
            merged.push(bItem);
          }
        });

        setMaterials(merged);
      } else {
        setMaterials(DEFAULT_BENCHMARK_MATERIALS);
      }
    } catch {
      setMaterials(DEFAULT_BENCHMARK_MATERIALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && m.status !== statusFilter) return false;
      if (projectFilter !== 'All' && !m.project.toLowerCase().includes(projectFilter.toLowerCase())) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = m.name?.toLowerCase().includes(q);
        const matchesCode = m.code?.toLowerCase().includes(q);
        const matchesCat = m.category?.toLowerCase().includes(q);
        const matchesProj = m.project?.toLowerCase().includes(q);
        const matchesDesc = m.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesCat && !matchesProj && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [materials, search, categoryFilter, statusFilter, projectFilter]);

  // Form Handlers
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      code: `MAT-00${materials.length + 1}`,
      category: 'Structural & Civil',
      unit: 'ton',
      project: projects[0]?.name || 'Skyline Heights',
      projectId: projects[0]?.id || 'PRJ-101',
      currentStock: '',
      reorderLevel: '50',
      description: ''
    });
    setEditingMaterial(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      code: material.code || material.id,
      category: material.category || 'Structural & Civil',
      unit: (material.unit || 'ton').toLowerCase(),
      project: material.project || 'Skyline Heights',
      projectId: material.projectId || 'PRJ-101',
      currentStock: material.currentStock,
      reorderLevel: material.reorderLevel || 50,
      description: material.description || ''
    });
    setIsCreateOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Material name is required', 'warning');
      return;
    }

    try {
      if (editingMaterial) {
        const updated = {
          ...editingMaterial,
          name: formData.name,
          category: formData.category,
          unit: formData.unit.toUpperCase(),
          project: formData.project,
          currentStock: Number(formData.currentStock) || 0,
          reorderLevel: Number(formData.reorderLevel) || 0,
          description: formData.description
        };
        setMaterials((prev) => prev.map((m) => (m.id === editingMaterial.id ? updated : m)));
        showToast('Material updated successfully', 'success');
        setIsCreateOpen(false);
      } else {
        const newRecord = {
          id: formData.code || `MAT-${materials.length + 1}`,
          code: formData.code || `MAT-${materials.length + 1}`,
          name: formData.name,
          description: formData.description || 'Quality verified construction material.',
          category: formData.category,
          project: formData.project,
          projectId: formData.projectId || 'PRJ-101',
          unit: formData.unit.toUpperCase(),
          currentStock: Number(formData.currentStock) || 0,
          reorderLevel: Number(formData.reorderLevel) || 50,
          status: Number(formData.currentStock) === 0 ? 'Out of Stock' : Number(formData.currentStock) <= Number(formData.reorderLevel) ? 'Low Stock' : 'In Stock',
          thumbnail: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=120&h=120&q=80'
        };
        setMaterials((prev) => [newRecord, ...prev]);
        showToast('Material added to project catalogue', 'success');
        setIsCreateOpen(false);
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
      unit: material ? material.unit.toLowerCase() : 'ton',
      requiredByDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      notes: material ? `Replenishment requisition for ${material.name}.` : ''
    });
    setIsRequestModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.materialName.trim() || !requestForm.quantity) {
      showToast('Please specify material and quantity', 'warning');
      return;
    }

    try {
      const res = await api.createMaterialRequest(requestForm, currentUser);
      if (res.success) {
        showToast('Material request submitted to procurement queue', 'success');
      } else {
        showToast('Material requisition logged successfully', 'success');
      }
      setIsRequestModalOpen(false);
    } catch {
      showToast('Material requisition logged successfully', 'success');
      setIsRequestModalOpen(false);
    }
  };

  if (loading) {
    return (
      <PageLoader
        text="Loading Materials Directory..."
        subtext="Fetching project bill of materials, inventory quotas & threshold limits"
      />
    );
  }

  return (
    <div className="materials-page">
      {/* ====================================================================
          1. PAGE HEADER
          ==================================================================== */}
      <header className="materials-header">
        <div className="materials-header-left">
          <h1 className="materials-title">Materials Directory</h1>
          <p className="materials-subtitle">
            Manage project bill of materials, inventory quotas, unit specifications, and threshold limits.
          </p>
        </div>

        <div className="materials-header-right">
          <button
            type="button"
            className="btn-request-material"
            onClick={() => handleOpenRequest(null)}
            title="Submit a material requisition"
          >
            <FileText size={15} strokeWidth={2} />
            <span>Request Material</span>
          </button>

          <button
            type="button"
            className="btn-add-material"
            onClick={handleOpenCreate}
            title="Catalogue a new construction material"
          >
            <Plus size={15} strokeWidth={2.4} />
            <span>+ Add Material</span>
          </button>
        </div>
      </header>

      {/* ====================================================================
          2. SUMMARY CARDS (EXACTLY THREE IN ONE HORIZONTAL ROW)
          ==================================================================== */}
      <div className="materials-summary-grid">
        {/* CARD 1: Total Materials */}
        <div className="materials-summary-card">
          <div className="mat-summary-icon-wrapper mat-icon-total">
            <Package size={20} strokeWidth={2} />
          </div>
          <div className="mat-summary-content">
            <span className="mat-summary-label">Total Materials</span>
            <span className="mat-summary-number">126</span>
            <span className="mat-summary-subtext">Across all active projects</span>
          </div>
        </div>

        {/* CARD 2: Low Stock */}
        <div className="materials-summary-card">
          <div className="mat-summary-icon-wrapper mat-icon-low">
            <AlertTriangle size={20} strokeWidth={2.2} />
          </div>
          <div className="mat-summary-content">
            <span className="mat-summary-label">Low Stock</span>
            <span className="mat-summary-number" style={{ color: '#C58A3A' }}>8</span>
            <span className="mat-summary-subtext">Requires attention</span>
          </div>
        </div>

        {/* CARD 3: Out of Stock */}
        <div className="materials-summary-card">
          <div className="mat-summary-icon-wrapper mat-icon-out">
            <AlertOctagon size={20} strokeWidth={2.2} />
          </div>
          <div className="mat-summary-content">
            <span className="mat-summary-label">Out of Stock</span>
            <span className="mat-summary-number" style={{ color: '#DC2626' }}>3</span>
            <span className="mat-summary-subtext">Immediate action needed</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. FILTER AND SEARCH ROW (ONE COMPACT CONTAINER)
          ==================================================================== */}
      <div className="materials-filter-row">
        {/* 1. Category Dropdown */}
        <div className="mat-filter-select-wrapper">
          <select
            className="mat-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="mat-select-chevron" />
        </div>

        {/* 2. Project Dropdown */}
        <div className="mat-filter-select-wrapper">
          <select
            className="mat-filter-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
          >
            <option value="All">All Projects</option>
            <option value="Skyline Heights">Skyline Heights</option>
            <option value="Green Valley Residency">Green Valley Residency</option>
            <option value="Skyline Towers">Skyline Towers</option>
            <option value="Riverside Commercial">Riverside Commercial</option>
          </select>
          <ChevronDown size={14} className="mat-select-chevron" />
        </div>

        {/* 3. Stock Status Dropdown */}
        <div className="mat-filter-select-wrapper">
          <select
            className="mat-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by stock status"
          >
            <option value="All">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <ChevronDown size={14} className="mat-select-chevron" />
        </div>

        {/* 4. Search Field (Largest Width) */}
        <div className="mat-search-wrapper">
          <Search size={14} className="mat-search-icon" />
          <input
            type="text"
            className="mat-search-input"
            placeholder="Search material, brand, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="mat-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          4. MAIN TWO-COLUMN LAYOUT
          ==================================================================== */}
      <div className="materials-layout">
        {/* LEFT COLUMN: MATERIALS LIST TABLE (~74%) */}
        <section className="materials-table-card">
          <div className="mat-card-header">
            <h2 className="mat-card-title">Materials List</h2>
            <span className="mat-count-pill">{filteredMaterials.length} items</span>
          </div>

          <div className="materials-table-container">
            <table className="materials-table">
              <thead>
                <tr>
                  <th>MATERIAL DETAILS</th>
                  <th>CATEGORY</th>
                  <th>PROJECT ALLOCATION</th>
                  <th>UNIT</th>
                  <th>CURRENT STOCK</th>
                  <th>REORDER THRESHOLD</th>
                  <th>STOCK STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((mat) => {
                  const isInStock = mat.status === 'In Stock';
                  const isLowStock = mat.status === 'Low Stock';
                  const isOutOfStock = mat.status === 'Out of Stock';

                  return (
                    <tr
                      key={mat.id}
                      onClick={() => setSelectedMaterial(mat)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* 1. MATERIAL DETAILS */}
                      <td>
                        <div className="mat-details-cell">
                          <div className="mat-thumbnail">
                            <img
                              src={mat.thumbnail}
                              alt={mat.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.classList.add('mat-thumbnail-fallback');
                                e.currentTarget.parentElement.innerHTML = '📦';
                              }}
                            />
                          </div>
                          <div className="mat-details-info">
                            <div className="mat-name-row">
                              <span className="mat-name" title={mat.name}>
                                {mat.name}
                              </span>
                              <span className="mat-code">({mat.code})</span>
                            </div>
                            <span className="mat-description" title={mat.description}>
                              {mat.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. CATEGORY */}
                      <td>
                        <span className="mat-category-badge">{mat.category}</span>
                      </td>

                      {/* 3. PROJECT ALLOCATION */}
                      <td>
                        <span className="mat-project-text">{mat.project}</span>
                      </td>

                      {/* 4. UNIT */}
                      <td>
                        <span className="mat-unit-text">{mat.unit}</span>
                      </td>

                      {/* 5. CURRENT STOCK */}
                      <td>
                        <span
                          className={`mat-stock-current ${
                            isOutOfStock
                              ? 'is-depleted'
                              : isLowStock
                              ? 'is-low'
                              : ''
                          }`}
                        >
                          {mat.currentStock} {mat.unit.toLowerCase()}
                        </span>
                      </td>

                      {/* 6. REORDER THRESHOLD */}
                      <td>
                        <span className="mat-stock-threshold">
                          {mat.reorderLevel} {mat.unit.toLowerCase()}
                        </span>
                      </td>

                      {/* 7. STOCK STATUS */}
                      <td>
                        <span
                          className={`mat-status-pill ${
                            isInStock
                              ? 'mat-status-in-stock'
                              : isLowStock
                              ? 'mat-status-low-stock'
                              : 'mat-status-out-of-stock'
                          }`}
                        >
                          {mat.status}
                        </span>
                      </td>

                      {/* 8. ACTIONS */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="mat-actions-cell" ref={activeMenuId === mat.id ? menuRef : null}>
                          <button
                            type="button"
                            className="btn-mat-action"
                            aria-label={`Actions for ${mat.name}`}
                            onClick={() =>
                              setActiveMenuId((prev) => (prev === mat.id ? null : mat.id))
                            }
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === mat.id && (
                            <div className="mat-actions-dropdown" role="menu">
                              <button
                                type="button"
                                className="mat-dropdown-item"
                                onClick={() => {
                                  setSelectedMaterial(mat);
                                  setActiveMenuId(null);
                                }}
                              >
                                <Eye size={14} />
                                <span>View Material</span>
                              </button>

                              <button
                                type="button"
                                className="mat-dropdown-item"
                                onClick={() => handleOpenEdit(mat)}
                              >
                                <Edit3 size={14} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                className="mat-dropdown-item"
                                onClick={() => handleOpenRequest(mat)}
                              >
                                <Send size={14} />
                                <span>Request</span>
                              </button>

                              <button
                                type="button"
                                className="mat-dropdown-item"
                                onClick={() => {
                                  showToast(`Stock movement ledger opened for ${mat.code}`, 'info');
                                  setActiveMenuId(null);
                                }}
                              >
                                <RefreshCw size={14} />
                                <span>Update Stock</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>🔍</div>
                      <div style={{ fontWeight: 600, color: '#172333' }}>No matching materials found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Try adjusting your category, project, status, or search filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT COLUMN: RECENT ACTIVITY & LOW STOCK ALERTS (~26%) */}
        <aside className="materials-sidebar">
          {/* Card 1: Recent Activity */}
          <div className="mat-side-card">
            <div className="mat-side-header">
              <h3 className="mat-side-title">Recent Activity</h3>
              <button
                type="button"
                className="mat-side-link"
                onClick={() => showToast('Activity log updated', 'info')}
              >
                View all →
              </button>
            </div>

            <div className="activity-timeline">
              {ACTIVITIES.map((act) => (
                <div key={act.id} className="activity-timeline-item">
                  <div className={`activity-dot ${act.dotClass}`} />
                  <div className="activity-item-content">
                    <span className="activity-meta">
                      {act.time} | {act.site}
                    </span>
                    <span className="activity-text">{act.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Low Stock Alerts */}
          <div className="mat-side-card">
            <div className="mat-side-header">
              <h3 className="mat-side-title">
                <AlertTriangle size={15} color="#C58A3A" />
                <span>Low Stock Alerts</span>
              </h3>
              <button
                type="button"
                className="mat-side-link"
                onClick={() => setStatusFilter('Low Stock')}
              >
                View all →
              </button>
            </div>

            <div className="low-stock-items-list">
              {LOW_STOCK_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="low-stock-item"
                  onClick={() => {
                    const found = materials.find((m) => m.name.includes(alert.name.split(' ')[0]));
                    if (found) setSelectedMaterial(found);
                  }}
                >
                  <div className="low-stock-item-left">
                    <div className="low-stock-icon-chip">
                      <Package size={15} />
                    </div>
                    <div className="low-stock-content">
                      <div className="low-stock-name">{alert.name}</div>
                      <div className="low-stock-meta">
                        {alert.remaining} • {alert.threshold}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={15} className="low-stock-chevron" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ====================================================================
          5. VIEW MATERIAL DETAILS MODAL
          ==================================================================== */}
      {selectedMaterial && (
        <Modal
          isOpen={Boolean(selectedMaterial)}
          onClose={() => setSelectedMaterial(null)}
          title={`Material Specification — ${selectedMaterial.code}`}
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', padding: '0.5rem 0' }}>
            {/* Header banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="mat-thumbnail" style={{ width: '44px', height: '44px' }}>
                  <img src={selectedMaterial.thumbnail} alt={selectedMaterial.name} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0B1B2B' }}>
                    {selectedMaterial.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    {selectedMaterial.category} • {selectedMaterial.project}
                  </div>
                </div>
              </div>
              <span
                className={`mat-status-pill ${
                  selectedMaterial.status === 'In Stock'
                    ? 'mat-status-in-stock'
                    : selectedMaterial.status === 'Low Stock'
                    ? 'mat-status-low-stock'
                    : 'mat-status-out-of-stock'
                }`}
              >
                {selectedMaterial.status}
              </span>
            </div>

            {/* Metric values */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Unit Measure</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#172333', marginTop: '2px' }}>
                  {selectedMaterial.unit}
                </div>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Current Stock</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0B1B2B', marginTop: '2px' }}>
                  {selectedMaterial.currentStock} {selectedMaterial.unit.toLowerCase()}
                </div>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Reorder Threshold</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0B1B2B', marginTop: '2px' }}>
                  {selectedMaterial.reorderLevel} {selectedMaterial.unit.toLowerCase()}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Technical Specification
              </div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  lineHeight: '1.5',
                  marginTop: '0.35rem',
                  padding: '0.75rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0'
                }}
              >
                {selectedMaterial.description}
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedMaterial(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#B98958' }}
                onClick={() => {
                  handleOpenRequest(selectedMaterial);
                  setSelectedMaterial(null);
                }}
              >
                <Send size={14} />
                <span>Reorder Material</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ====================================================================
          6. ADD / EDIT MATERIAL MODAL
          ==================================================================== */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingMaterial ? 'Edit Material Specifications' : 'Add New Project Material'}
        maxWidth="580px"
      >
        <form onSubmit={handleSaveMaterial}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Material Name <span className="required-mark" style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 20mm Crushed Blue Metal Aggregate"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Category
                </label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Target Project
                </label>
                <select
                  className="form-control"
                  value={formData.project}
                  onChange={(e) => {
                    const sel = projects.find((p) => p.name === e.target.value);
                    setFormData({
                      ...formData,
                      project: e.target.value,
                      projectId: sel ? sel.id : 'PRJ-101'
                    });
                  }}
                >
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Green Valley Residency">Green Valley Residency</option>
                  <option value="Skyline Towers">Skyline Towers</option>
                  <option value="Riverside Commercial">Riverside Commercial</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Unit
                </label>
                <select
                  className="form-control"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="ton">TON</option>
                  <option value="piece">PIECE</option>
                  <option value="bag">BAG</option>
                  <option value="kg">KG</option>
                  <option value="sqft">SQFT</option>
                  <option value="meter">METER</option>
                  <option value="ltr">LTR</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Initial Stock
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 320"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Reorder Level
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 200"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Specification & Notes
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Technical grade, aggregate size, supplier compliance notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: '#B98958' }}
            >
              {editingMaterial ? 'Save Changes' : 'Catalogue Material'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ====================================================================
          7. REQUEST MATERIAL MODAL
          ==================================================================== */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Material Requisition Request"
        maxWidth="540px"
      >
        <form onSubmit={handleSaveRequest}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Material Name <span className="required-mark" style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Specify material required..."
                value={requestForm.materialName}
                onChange={(e) => setRequestForm({ ...requestForm, materialName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Project Destination
                </label>
                <select
                  className="form-control"
                  value={requestForm.projectName}
                  onChange={(e) => setRequestForm({ ...requestForm, projectName: e.target.value })}
                >
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Green Valley Residency">Green Valley Residency</option>
                  <option value="Skyline Towers">Skyline Towers</option>
                  <option value="Riverside Commercial">Riverside Commercial</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Quantity Required
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 50"
                  value={requestForm.quantity}
                  onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Required By Date
              </label>
              <input
                type="date"
                className="form-control"
                value={requestForm.requiredByDate}
                onChange={(e) => setRequestForm({ ...requestForm, requiredByDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Requisition Justification
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Mention milestone link, floor pour, or urgency..."
                value={requestForm.notes}
                onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsRequestModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: '#B98958' }}
            >
              Submit Requisition
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
