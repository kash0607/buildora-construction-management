import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package,
  Plus,
  FileSpreadsheet,
  Calendar,
  ChevronDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  MoreVertical,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  Printer,
  Copy,
  Download,
  X,
  Layers,
  Building2,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import PageLoader from '../components/common/PageLoader';

// Benchmark ledger transactions with the exact requested items
const INITIAL_TRANSACTIONS = [
  // Page 1 Benchmark Rows
  {
    id: 'TXN-101',
    dateTime: '15 Sep, 10:30 AM',
    timestamp: '2026-09-15T10:30:00',
    type: 'GRN',
    materialName: 'UltraTech OPC 53 Grade Cement',
    materialCode: 'MAT-005',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Heights',
    inwardQty: '+500 bag',
    outwardQty: null,
    balance: '1700 bag',
    refDoc: 'GRN-010',
    supplier: 'UltraTech Cement Ltd.',
    vehicleNo: 'MH-12-RN-8821',
    inspector: 'Rajesh Kumar (QA/QC)'
  },
  {
    id: 'TXN-102',
    dateTime: '16 Sep, 02:15 PM',
    timestamp: '2026-09-16T14:15:00',
    type: 'SIV',
    materialName: 'AAC Blocks',
    materialCode: 'MAT-001',
    thumbnail: 'https://images.unsplash.com/photo-1584463699039-38936fa5b2f2?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Green Valley Residency',
    inwardQty: null,
    outwardQty: '-100 bag',
    balance: '350 bag',
    refDoc: 'SIV-021',
    supplier: 'Internal Site Issue',
    vehicleNo: 'Site Trolley #04',
    inspector: 'Amit Verma (Site Engg)'
  },
  {
    id: 'TXN-103',
    dateTime: '16 Sep, 02:15 PM',
    timestamp: '2026-09-16T14:15:00',
    type: 'Site Transfer',
    materialName: 'UltraTech OPC 53 Grade Cement',
    materialCode: 'MAT-005',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Green Valley Residency',
    inwardQty: null,
    outwardQty: '-100 bag',
    balance: '350 bag',
    refDoc: 'SIV-021',
    supplier: 'Skyline Yard -> Green Valley',
    vehicleNo: 'KA-04-TR-4912',
    inspector: 'Suresh Patil (Logistics)'
  },
  {
    id: 'TXN-104',
    dateTime: '14 Sep, 11:45 AM',
    timestamp: '2026-09-14T11:45:00',
    type: 'GRN',
    materialName: 'Tata Tiscon Fe 500D TMT Rebar (16mm)',
    materialCode: 'MAT-004',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Towers',
    inwardQty: '+25 ton',
    outwardQty: null,
    balance: '45 ton',
    refDoc: 'GRN-009',
    supplier: 'Tata Steel Direct',
    vehicleNo: 'MH-14-GH-1092',
    inspector: 'Vikram Malhotra'
  },
  {
    id: 'TXN-105',
    dateTime: '14 Sep, 09:10 AM',
    timestamp: '2026-09-14T09:10:00',
    type: 'SIV',
    materialName: 'Dr. Fixit Fastflex Waterproofing Compound',
    materialCode: 'MAT-003',
    thumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Heights',
    inwardQty: null,
    outwardQty: '-40 kg',
    balance: '140 kg',
    refDoc: 'SIV-020',
    supplier: 'Site Basement Waterproofing',
    vehicleNo: 'Internal Handover',
    inspector: 'Rajesh Kumar (QA/QC)'
  },
  {
    id: 'TXN-106',
    dateTime: '13 Sep, 04:30 PM',
    timestamp: '2026-09-13T16:30:00',
    type: 'GRN',
    materialName: '20mm Crushed Blue Metal Aggregate',
    materialCode: 'MAT-001',
    thumbnail: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Metro Station Line 3',
    inwardQty: '+120 ton',
    outwardQty: null,
    balance: '320 ton',
    refDoc: 'GRN-008',
    supplier: 'Deccan Stone Crushers',
    vehicleNo: 'MH-12-Q-9910',
    inspector: 'Praveen Nair (Inspector)'
  },

  // Page 2 Rows
  {
    id: 'TXN-107',
    dateTime: '12 Sep, 03:00 PM',
    timestamp: '2026-09-12T15:00:00',
    type: 'SIV',
    materialName: 'UltraTech OPC 53 Grade Cement',
    materialCode: 'MAT-005',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Heights',
    inwardQty: null,
    outwardQty: '-250 bag',
    balance: '1200 bag',
    refDoc: 'SIV-019',
    supplier: 'Tower 2 Slab Pour',
    vehicleNo: 'Site Transit Mixer #2',
    inspector: 'Amit Verma'
  },
  {
    id: 'TXN-108',
    dateTime: '11 Sep, 10:15 AM',
    timestamp: '2026-09-11T10:15:00',
    type: 'GRN',
    materialName: 'AAC Blocks',
    materialCode: 'MAT-001',
    thumbnail: 'https://images.unsplash.com/photo-1584463699039-38936fa5b2f2?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Green Valley Residency',
    inwardQty: '+450 bag',
    outwardQty: null,
    balance: '450 bag',
    refDoc: 'GRN-007',
    supplier: 'BuildCon Precast Pvt Ltd',
    vehicleNo: 'MH-04-AB-3312',
    inspector: 'Suresh Patil'
  },
  {
    id: 'TXN-109',
    dateTime: '10 Sep, 01:20 PM',
    timestamp: '2026-09-10T13:20:00',
    type: 'Site Transfer',
    materialName: 'Tata Tiscon Fe 500D TMT Rebar (16mm)',
    materialCode: 'MAT-004',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Heights',
    inwardQty: null,
    outwardQty: '-10 ton',
    balance: '20 ton',
    refDoc: 'SIV-018',
    supplier: 'Towers Yard -> Heights',
    vehicleNo: 'MH-14-TR-9001',
    inspector: 'Vikram Malhotra'
  },
  {
    id: 'TXN-110',
    dateTime: '09 Sep, 11:00 AM',
    timestamp: '2026-09-09T11:00:00',
    type: 'GRN',
    materialName: 'Dr. Fixit Fastflex Waterproofing Compound',
    materialCode: 'MAT-003',
    thumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Heights',
    inwardQty: '+100 kg',
    outwardQty: null,
    balance: '180 kg',
    refDoc: 'GRN-006',
    supplier: 'Pidilite Industries',
    vehicleNo: 'MH-12-CD-5544',
    inspector: 'Rajesh Kumar'
  },
  {
    id: 'TXN-111',
    dateTime: '08 Sep, 04:45 PM',
    timestamp: '2026-09-08T16:45:00',
    type: 'SIV',
    materialName: '20mm Crushed Blue Metal Aggregate',
    materialCode: 'MAT-001',
    thumbnail: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Metro Station Line 3',
    inwardQty: null,
    outwardQty: '-80 ton',
    balance: '200 ton',
    refDoc: 'SIV-017',
    supplier: 'Underground Pier Concrete',
    vehicleNo: 'Site Dumper #8',
    inspector: 'Praveen Nair'
  },
  {
    id: 'TXN-112',
    dateTime: '07 Sep, 09:30 AM',
    timestamp: '2026-09-07T09:30:00',
    type: 'GRN',
    materialName: 'UltraTech OPC 53 Grade Cement',
    materialCode: 'MAT-005',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Heights',
    inwardQty: '+600 bag',
    outwardQty: null,
    balance: '1450 bag',
    refDoc: 'GRN-005',
    supplier: 'UltraTech Cement Ltd.',
    vehicleNo: 'MH-12-RN-7714',
    inspector: 'Rajesh Kumar'
  },

  // Page 3 Rows
  {
    id: 'TXN-113',
    dateTime: '05 Sep, 02:00 PM',
    timestamp: '2026-09-05T14:00:00',
    type: 'GRN',
    materialName: 'AAC Blocks',
    materialCode: 'MAT-001',
    thumbnail: 'https://images.unsplash.com/photo-1584463699039-38936fa5b2f2?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Green Valley Residency',
    inwardQty: '+300 bag',
    outwardQty: null,
    balance: '600 bag',
    refDoc: 'GRN-004',
    supplier: 'BuildCon Precast',
    vehicleNo: 'MH-04-XY-1200',
    inspector: 'Suresh Patil'
  },
  {
    id: 'TXN-114',
    dateTime: '04 Sep, 10:40 AM',
    timestamp: '2026-09-04T10:40:00',
    type: 'SIV',
    materialName: 'UltraTech OPC 53 Grade Cement',
    materialCode: 'MAT-005',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Heights',
    inwardQty: null,
    outwardQty: '-200 bag',
    balance: '850 bag',
    refDoc: 'SIV-016',
    supplier: 'Retaining Wall Work',
    vehicleNo: 'Site Forklift #1',
    inspector: 'Amit Verma'
  },
  {
    id: 'TXN-115',
    dateTime: '03 Sep, 03:15 PM',
    timestamp: '2026-09-03T15:15:00',
    type: 'GRN',
    materialName: 'Tata Tiscon Fe 500D TMT Rebar (16mm)',
    materialCode: 'MAT-004',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Towers',
    inwardQty: '+30 ton',
    outwardQty: null,
    balance: '30 ton',
    refDoc: 'GRN-003',
    supplier: 'Tata Steel Direct',
    vehicleNo: 'MH-14-ZZ-9900',
    inspector: 'Vikram Malhotra'
  },
  {
    id: 'TXN-116',
    dateTime: '02 Sep, 11:20 AM',
    timestamp: '2026-09-02T11:20:00',
    type: 'SIV',
    materialName: 'Dr. Fixit Fastflex Waterproofing Compound',
    materialCode: 'MAT-003',
    thumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Skyline Heights',
    inwardQty: null,
    outwardQty: '-50 kg',
    balance: '80 kg',
    refDoc: 'SIV-015',
    supplier: 'Terrace Sealing Task',
    vehicleNo: 'Internal Handover',
    inspector: 'Rajesh Kumar'
  },
  {
    id: 'TXN-117',
    dateTime: '01 Sep, 04:00 PM',
    timestamp: '2026-09-01T16:00:00',
    type: 'GRN',
    materialName: '20mm Crushed Blue Metal Aggregate',
    materialCode: 'MAT-001',
    thumbnail: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Metro Station Line 3',
    inwardQty: '+150 ton',
    outwardQty: null,
    balance: '280 ton',
    refDoc: 'GRN-002',
    supplier: 'Deccan Stone Crushers',
    vehicleNo: 'MH-12-Q-8800',
    inspector: 'Praveen Nair'
  },
  {
    id: 'TXN-118',
    dateTime: '01 Sep, 09:00 AM',
    timestamp: '2026-09-01T09:00:00',
    type: 'GRN',
    materialName: 'UltraTech OPC 53 Grade Cement',
    materialCode: 'MAT-005',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80',
    project: 'Green Valley Residency',
    inwardQty: '+400 bag',
    outwardQty: null,
    balance: '400 bag',
    refDoc: 'GRN-001',
    supplier: 'UltraTech Direct Dealer',
    vehicleNo: 'MH-04-AA-7711',
    inspector: 'Suresh Patil'
  }
];

// Available options for filter dropdowns
const PROJECT_OPTIONS = [
  'All Projects',
  'Skyline Heights',
  'Green Valley Residency',
  'Skyline Towers',
  'Metro Station Line 3'
];

const TYPE_OPTIONS = [
  'All Types',
  'GRN',
  'SIV',
  'Site Transfer'
];

const MATERIAL_OPTIONS = [
  'All Materials',
  'UltraTech OPC 53 Grade Cement',
  'AAC Blocks',
  '20mm Crushed Blue Metal Aggregate',
  'Dr. Fixit Fastflex Waterproofing Compound',
  'Tata Tiscon Fe 500D TMT Rebar (16mm)'
];

export default function Inventory() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Filters state
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials');
  const [datePeriod, setDatePeriod] = useState('Last Sep 1, 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Action menu active state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modals state
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedDocDetails, setSelectedDocDetails] = useState(null);

  // Inward Form State
  const [inwardForm, setInwardForm] = useState({
    materialName: 'UltraTech OPC 53 Grade Cement',
    materialCode: 'MAT-005',
    project: 'Skyline Heights',
    quantity: '500',
    unit: 'bag',
    refDoc: 'GRN-011',
    supplier: 'UltraTech Cement Ltd.',
    vehicleNo: 'MH-12-RN-9924',
    inspector: 'Vikram Malhotra',
    qualityCheck: true,
    notes: 'Standard quality certification verified on site weighbridge.'
  });

  // Report Form State
  const [reportConfig, setReportConfig] = useState({
    type: 'Daily Stock Ledger',
    format: 'PDF',
    dateScope: 'Sep 01 - Sep 16, 2026',
    includeValuation: true
  });

  // Close open action menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.ledger-action-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter transactions based on project, type, material, and search query
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (selectedProject !== 'All Projects' && txn.project !== selectedProject) {
        return false;
      }
      if (selectedType !== 'All Types' && txn.type !== selectedType) {
        return false;
      }
      if (selectedMaterial !== 'All Materials' && txn.materialName !== selectedMaterial) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          txn.materialName.toLowerCase().includes(q) ||
          txn.materialCode.toLowerCase().includes(q) ||
          txn.refDoc.toLowerCase().includes(q) ||
          txn.project.toLowerCase().includes(q) ||
          txn.type.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [transactions, selectedProject, selectedType, selectedMaterial, searchQuery, sortOrder]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  // Current page items
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProject, selectedType, selectedMaterial, searchQuery]);

  // Handlers for "Record Inward Stock"
  const handleSaveInwardStock = (e) => {
    e.preventDefault();
    if (!inwardForm.quantity || Number(inwardForm.quantity) <= 0) {
      showToast('Please enter a valid positive quantity', 'warning');
      return;
    }

    const newTxn = {
      id: `TXN-${Date.now()}`,
      dateTime: '16 Sep, 03:45 PM',
      timestamp: new Date().toISOString(),
      type: 'GRN',
      materialName: inwardForm.materialName,
      materialCode: inwardForm.materialCode || 'MAT-005',
      thumbnail:
        inwardForm.materialName.includes('Cement')
          ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&h=120&q=80'
          : inwardForm.materialName.includes('Block')
          ? 'https://images.unsplash.com/photo-1584463699039-38936fa5b2f2?auto=format&fit=crop&w=120&h=120&q=80'
          : 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=120&h=120&q=80',
      project: inwardForm.project,
      inwardQty: `+${inwardForm.quantity} ${inwardForm.unit}`,
      outwardQty: null,
      balance: `${Number(inwardForm.quantity) + 1700} ${inwardForm.unit}`,
      refDoc: inwardForm.refDoc || `GRN-${Math.floor(100 + Math.random() * 900)}`,
      supplier: inwardForm.supplier || 'Direct Consignment',
      vehicleNo: inwardForm.vehicleNo || 'MH-12-XX-0000',
      inspector: inwardForm.inspector || 'Vikram Malhotra'
    };

    setTransactions([newTxn, ...transactions]);
    setIsInwardModalOpen(false);
    showToast(`Inward stock successfully recorded for ${inwardForm.materialName}!`, 'success');
  };

  // Handlers for "Generate Report"
  const handleDownloadReport = () => {
    setIsReportModalOpen(false);
    showToast(`Generating ${reportConfig.format} report for ${reportConfig.type}... Download started!`, 'success');
  };

  // Open Document Detail
  const handleViewDoc = (txn) => {
    setSelectedDocDetails(txn);
    setActiveMenuId(null);
  };

  // Copy Reference
  const handleCopyRef = (refDoc) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(refDoc);
      showToast(`Copied ${refDoc} to clipboard`, 'success');
    }
    setActiveMenuId(null);
  };

  return (
    <div className="inventory-page">
      {loading && <PageLoader />}

      {/* ====================================================================
          1. PAGE HEADER
          ==================================================================== */}
      <div className="inventory-header">
        <div className="inventory-header-left">
          <h1 className="inventory-title">Inventory & Stock Ledger</h1>
          <p className="inventory-subtitle">
            Manage project bill of materials, inventory quotes, unit specifications, and threshold limits.
          </p>
        </div>

        <div className="inventory-header-right">
          <button
            type="button"
            className="btn-record-inward"
            onClick={() => setIsInwardModalOpen(true)}
            id="btn-record-inward"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Record Inward Stock</span>
          </button>

          <button
            type="button"
            className="btn-generate-report"
            onClick={() => setIsReportModalOpen(true)}
            id="btn-generate-report"
          >
            <FileSpreadsheet size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. SUMMARY KPI CARDS (3 GRID COLUMNS)
          ==================================================================== */}
      <div className="inventory-kpi-grid">
        {/* Card 1: Total Stock Valuation */}
        <div className="inventory-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-title">TOTAL STOCK VALUATION</span>
            <span className="p-1 rounded bg-slate-50 text-slate-400">
              <Layers size={16} />
            </span>
          </div>

          <div className="kpi-chart-container">
            <div>
              <div className="kpi-main-metric">₹ 45.3 L</div>
              <div className="kpi-subtitle">Across all projects</div>
            </div>

            {/* Embedded inline SVG bar chart graphic */}
            <div className="sparkline-bars" title="Valuation trend by category">
              <div className="sparkline-bar" style={{ height: '35%' }} />
              <div className="sparkline-bar" style={{ height: '55%' }} />
              <div className="sparkline-bar" style={{ height: '40%' }} />
              <div className="sparkline-bar" style={{ height: '70%' }} />
              <div className="sparkline-bar highlight" style={{ height: '95%' }} />
              <div className="sparkline-bar highlight" style={{ height: '80%' }} />
              <div className="sparkline-bar" style={{ height: '60%' }} />
              <div className="sparkline-bar highlight" style={{ height: '100%' }} />
              <div className="sparkline-bar" style={{ height: '65%' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Total Stock Movements (MTD) */}
        <div className="inventory-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-title">TOTAL STOCK MOVEMENTS (MTD)</span>
            <span className="p-1 rounded bg-slate-50 text-slate-400">
              <Activity size={16} />
            </span>
          </div>

          <div className="kpi-movements-split">
            <div className="movement-metric-item">
              <span className="movement-tag inward">Inward</span>
              <span className="movement-val text-emerald-600">320 Unit</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="movement-metric-item">
              <span className="movement-tag outward">Outward</span>
              <span className="movement-val text-rose-600">185 Unit</span>
            </div>
          </div>
          <div className="kpi-subtitle mt-1">+135 Net Units velocity this month</div>
        </div>

        {/* Card 3: Pending GRNs */}
        <div className="inventory-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-title">PENDING GRNs</span>
            <span className="kpi-alert-tag">
              <AlertTriangle size={13} strokeWidth={2.5} />
              <span>Requiring action</span>
            </span>
          </div>

          <div>
            <div className="kpi-main-metric">15 Requests</div>
            <div className="kpi-subtitle">Pending quality sign-off & gate verification</div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. FILTERS & CONTROL BAR
          ==================================================================== */}
      <div className="inventory-filters-bar">
        <div className="inventory-filters-left">
          {/* Project select */}
          <div className="inv-select-wrapper">
            <select
              className="inv-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              id="filter-project"
            >
              {PROJECT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="inv-select-chevron" />
          </div>

          {/* Type select */}
          <div className="inv-select-wrapper">
            <select
              className="inv-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              id="filter-type"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="inv-select-chevron" />
          </div>

          {/* Material select */}
          <div className="inv-select-wrapper">
            <select
              className="inv-select"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              id="filter-material"
            >
              {MATERIAL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="inv-select-chevron" />
          </div>

          {/* Quick search input */}
          <div className="relative flex items-center min-w-[200px] flex-1 max-w-sm">
            <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#8B5A2B] focus:bg-white transition-colors"
              placeholder="Filter by ref, material, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-2 text-slate-400 hover:text-slate-600"
                onClick={() => setSearchQuery('')}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Date Range Picker Badge on the far right */}
        <div
          className="inv-date-picker-badge"
          title="Filter ledger timeline"
          onClick={() => showToast('Ledger timeline set to active cycle (Sep 15, 2026)', 'info')}
        >
          <Calendar size={14} />
          <span>Sep 15, 2026</span>
          <ChevronDown size={13} className="text-slate-400 ml-1" />
        </div>
      </div>

      {/* ====================================================================
          4. TWO-COLUMN MAIN CONTENT LAYOUT
          ==================================================================== */}
      <div className="inventory-main-layout">
        {/* ------------------------------------------------------------------
            LEFT: MAIN DATA TABLE ("DAILY STOCK LEDGER")
            ------------------------------------------------------------------ */}
        <div className="ledger-card">
          {/* Card Header with Dropdown Filter */}
          <div className="ledger-card-header">
            <h2 className="ledger-card-title">Daily Stock Ledger</h2>

            <div className="ledger-header-controls">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Timeline:</span>
              <div className="relative inline-flex items-center">
                <select
                  className="ledger-date-filter-select"
                  value={datePeriod}
                  onChange={(e) => setDatePeriod(e.target.value)}
                >
                  <option value="Last Sep 1, 2026">Last Sep 1, 2026</option>
                  <option value="Last 15 Days">Last 15 Days</option>
                  <option value="Current Month (Sep 2026)">Current Month (Sep 2026)</option>
                  <option value="All Time">All Time</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="ledger-table-container">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    title="Click to toggle sorting"
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Date & Time</span>
                      <span className="text-[10px] text-slate-400">{sortOrder === 'desc' ? '▼' : '▲'}</span>
                    </div>
                  </th>
                  <th>Transaction Type</th>
                  <th>Material Name & Code</th>
                  <th>Project Allocation</th>
                  <th>Inward (Qty)</th>
                  <th>Outward (Qty)</th>
                  <th>Balance</th>
                  <th>Reference Doc #</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-slate-400 text-sm">
                      No stock ledger entries match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((row) => {
                    const isGRN = row.type === 'GRN';
                    const isSIV = row.type === 'SIV';
                    const isTransfer = row.type.toLowerCase().includes('transfer');

                    return (
                      <tr key={row.id}>
                        {/* 1. Date & Time */}
                        <td>
                          <div className="ledger-date-cell">
                            <span className="ledger-date-primary">
                              {row.dateTime.split(',')[0]}
                            </span>
                            <span className="ledger-date-time">
                              {row.dateTime.split(',')[1] || ''}
                            </span>
                          </div>
                        </td>

                        {/* 2. Transaction Type */}
                        <td>
                          <span
                            className={`trans-type-pill ${
                              isGRN
                                ? 'trans-type-grn'
                                : isSIV
                                ? 'trans-type-siv'
                                : 'trans-type-transfer'
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>

                        {/* 3. Material Name & Code with Thumbnail */}
                        <td>
                          <div className="ledger-mat-cell">
                            <div className="ledger-mat-thumb">
                              <img
                                src={row.thumbnail}
                                alt={row.materialName}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=120&h=120&q=80';
                                }}
                              />
                            </div>
                            <div className="ledger-mat-info">
                              <span className="ledger-mat-name">{row.materialName}</span>
                              <span className="ledger-mat-code">{row.materialCode}</span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Project Allocation */}
                        <td>
                          <span className="ledger-project-name">{row.project}</span>
                        </td>

                        {/* 5. Inward (Qty) */}
                        <td>
                          {row.inwardQty ? (
                            <span className="qty-inward">{row.inwardQty}</span>
                          ) : (
                            <span className="qty-dash">---</span>
                          )}
                        </td>

                        {/* 6. Outward (Qty) */}
                        <td>
                          {row.outwardQty ? (
                            <span className="qty-outward">{row.outwardQty}</span>
                          ) : (
                            <span className="qty-dash">---</span>
                          )}
                        </td>

                        {/* 7. Balance */}
                        <td>
                          <span className="ledger-balance">{row.balance}</span>
                        </td>

                        {/* 8. Reference Doc # */}
                        <td>
                          <button
                            type="button"
                            className="ref-doc-badge"
                            onClick={() => handleViewDoc(row)}
                            title="Click to view reference voucher"
                          >
                            <FileText size={12} className="mr-1 text-slate-500" />
                            <span>{row.refDoc}</span>
                          </button>
                        </td>

                        {/* 9. Actions Dropdown */}
                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                          <div className="relative inline-block text-left ledger-action-container">
                            <button
                              type="button"
                              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === row.id ? null : row.id);
                              }}
                              title="Row actions"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeMenuId === row.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 animate-fadeIn">
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  onClick={() => handleViewDoc(row)}
                                >
                                  <ExternalLink size={13} className="text-slate-400" />
                                  <span>View Voucher Details</span>
                                </button>
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  onClick={() => handleCopyRef(row.refDoc)}
                                >
                                  <Copy size={13} className="text-slate-400" />
                                  <span>Copy Ref Number</span>
                                </button>
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  onClick={() => {
                                    showToast(`Downloading slip for ${row.refDoc}...`, 'info');
                                    setActiveMenuId(null);
                                  }}
                                >
                                  <Printer size={13} className="text-slate-400" />
                                  <span>Print Material Slip</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination Controls */}
          <div className="ledger-table-footer">
            <div className="pagination-info">
              Showing {totalPages} page{totalPages > 1 ? 's' : ''} ({filteredTransactions.length} total entries)
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`btn-page-nav ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                className="btn-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            RIGHT: SIDEBAR WIDGETS COLUMN (STACKED)
            ------------------------------------------------------------------ */}
        <div className="inventory-sidebar">
          {/* Top Card ("Material Traceability") */}
          <div className="inv-side-card">
            <div className="inv-side-header">
              <h3 className="inv-side-title">
                <Truck size={16} className="text-[#8B5A2B]" />
                <span>Material Traceability</span>
              </h3>
              <button
                type="button"
                className="inv-side-link"
                onClick={() => showToast('Full traceability ledger opened', 'info')}
              >
                <span>Live Feed</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="traceability-list">
              {/* Event 1 */}
              <div className="traceability-item">
                <div className="traceability-line" />
                <div className="traceability-dot green" />
                <div className="traceability-content">
                  <div className="traceability-title">UltraTech Cement Issued</div>
                  <div className="traceability-desc">
                    500 bags dispatched to Skyline Heights Pour Zone B • Ref: SIV-021
                  </div>
                  <div className="traceability-time">2 hrs ago • Site Yard 1</div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="traceability-item">
                <div className="traceability-line" />
                <div className="traceability-dot blue" />
                <div className="traceability-content">
                  <div className="traceability-title">Stock Level Updated</div>
                  <div className="traceability-desc">
                    Green Valley central depot auto-reorder threshold recalculated
                  </div>
                  <div className="traceability-time">4 hrs ago • Inventory Sync</div>
                </div>
              </div>

              {/* Event 3 */}
              <div className="traceability-item">
                <div className="traceability-line" />
                <div className="traceability-dot amber" />
                <div className="traceability-content">
                  <div className="traceability-title">PO Created & Approved</div>
                  <div className="traceability-desc">
                    PO-2026-089 approved for 25T TMT Rebar by Vikram Malhotra
                  </div>
                  <div className="traceability-time">Yesterday • Procurement</div>
                </div>
              </div>

              {/* Event 4 */}
              <div className="traceability-item">
                <div className="traceability-line" />
                <div className="traceability-dot purple" />
                <div className="traceability-content">
                  <div className="traceability-title">Physical Audit Verified</div>
                  <div className="traceability-desc">
                    Q3 aggregate inventory count matched batch serial MAT-001
                  </div>
                  <div className="traceability-time">2 days ago • Quality Lead</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card ("Audit Reminders") */}
          <div className="inv-side-card">
            <div className="inv-side-header">
              <h3 className="inv-side-title">
                <Calendar size={16} className="text-[#8B5A2B]" />
                <span>Audit Reminders</span>
              </h3>
              <button
                type="button"
                className="inv-side-link"
                onClick={() => showToast('Audit reminder scheduler opened', 'info')}
              >
                <span>Add +</span>
              </button>
            </div>

            <div className="audit-reminders-list">
              {/* Reminder 1: November Count */}
              <div
                className="audit-reminder-item"
                onClick={() =>
                  showToast('Scheduled: Annual Structural Material Count (Nov 15, 2026)', 'info')
                }
              >
                <div className="audit-reminder-left">
                  <div className="audit-icon-chip">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="audit-reminder-content">
                    <span className="audit-reminder-title">Annual Structural Material Count</span>
                    <span className="audit-reminder-meta">Nov 15, 2026 • Skyline Towers</span>
                  </div>
                </div>
                <span className="audit-badge">Nov '26</span>
              </div>

              {/* Reminder 2: December Count */}
              <div
                className="audit-reminder-item"
                onClick={() =>
                  showToast('Scheduled: Year-End Bulk Aggregate Audit (Dec 08, 2026)', 'info')
                }
              >
                <div className="audit-reminder-left">
                  <div className="audit-icon-chip">
                    <Building2 size={16} />
                  </div>
                  <div className="audit-reminder-content">
                    <span className="audit-reminder-title">Year-End Bulk Aggregate Audit</span>
                    <span className="audit-reminder-meta">Dec 08, 2026 • Green Valley Residency</span>
                  </div>
                </div>
                <span className="audit-badge">Dec '26</span>
              </div>

              {/* Reminder 3: December Count 2 */}
              <div
                className="audit-reminder-item"
                onClick={() =>
                  showToast('Scheduled: Finishes & Chemicals Stock Reconcile (Dec 22, 2026)', 'info')
                }
              >
                <div className="audit-reminder-left">
                  <div className="audit-icon-chip">
                    <Layers size={16} />
                  </div>
                  <div className="audit-reminder-content">
                    <span className="audit-reminder-title">Chemicals & Coatings Reconcile</span>
                    <span className="audit-reminder-meta">Dec 22, 2026 • Skyline Heights</span>
                  </div>
                </div>
                <span className="audit-badge">Dec '26</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ====================================================================
          6. MODAL: RECORD INWARD STOCK
          ==================================================================== */}
      {isInwardModalOpen && (
        <Modal
          isOpen={isInwardModalOpen}
          onClose={() => setIsInwardModalOpen(false)}
          title="Record Inward Stock (Goods Receipt Note)"
        >
          <form onSubmit={handleSaveInwardStock} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Specification *
                </label>
                <select
                  className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white focus:outline-none focus:border-[#8B5A2B]"
                  value={inwardForm.materialName}
                  onChange={(e) => {
                    const name = e.target.value;
                    let code = 'MAT-005';
                    let unit = 'bag';
                    if (name.includes('AAC')) {
                      code = 'MAT-001';
                      unit = 'bag';
                    } else if (name.includes('Aggregate')) {
                      code = 'MAT-001';
                      unit = 'ton';
                    } else if (name.includes('Waterproofing')) {
                      code = 'MAT-003';
                      unit = 'kg';
                    } else if (name.includes('TMT')) {
                      code = 'MAT-004';
                      unit = 'ton';
                    }
                    setInwardForm({ ...inwardForm, materialName: name, materialCode: code, unit });
                  }}
                  required
                >
                  <option value="UltraTech OPC 53 Grade Cement">UltraTech OPC 53 Grade Cement (MAT-005)</option>
                  <option value="AAC Blocks">AAC Blocks (MAT-001)</option>
                  <option value="20mm Crushed Blue Metal Aggregate">20mm Crushed Blue Metal Aggregate (MAT-001)</option>
                  <option value="Tata Tiscon Fe 500D TMT Rebar (16mm)">Tata Tiscon Fe 500D TMT Rebar (MAT-004)</option>
                  <option value="Dr. Fixit Fastflex Waterproofing Compound">Dr. Fixit Fastflex (MAT-003)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Allocation *
                </label>
                <select
                  className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white focus:outline-none focus:border-[#8B5A2B]"
                  value={inwardForm.project}
                  onChange={(e) => setInwardForm({ ...inwardForm, project: e.target.value })}
                  required
                >
                  <option value="Skyline Heights">Skyline Heights</option>
                  <option value="Green Valley Residency">Green Valley Residency</option>
                  <option value="Skyline Towers">Skyline Towers</option>
                  <option value="Metro Station Line 3">Metro Station Line 3</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Received Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full text-xs border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#8B5A2B]"
                  value={inwardForm.quantity}
                  onChange={(e) => setInwardForm({ ...inwardForm, quantity: e.target.value })}
                  placeholder="e.g. 500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit of Measurement
                </label>
                <select
                  className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white focus:outline-none focus:border-[#8B5A2B]"
                  value={inwardForm.unit}
                  onChange={(e) => setInwardForm({ ...inwardForm, unit: e.target.value })}
                >
                  <option value="bag">bag</option>
                  <option value="ton">ton</option>
                  <option value="kg">kg</option>
                  <option value="piece">piece</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference Doc # (GRN)
                </label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#8B5A2B]"
                  value={inwardForm.refDoc}
                  onChange={(e) => setInwardForm({ ...inwardForm, refDoc: e.target.value })}
                  placeholder="e.g. GRN-011"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle / Transporter No.
                </label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#8B5A2B]"
                  value={inwardForm.vehicleNo}
                  onChange={(e) => setInwardForm({ ...inwardForm, vehicleNo: e.target.value })}
                  placeholder="e.g. MH-12-RN-9924"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor / Supplier Name
              </label>
              <input
                type="text"
                className="w-full text-xs border border-slate-200 rounded-md p-2 focus:outline-none focus:border-[#8B5A2B]"
                value={inwardForm.supplier}
                onChange={(e) => setInwardForm({ ...inwardForm, supplier: e.target.value })}
                placeholder="e.g. UltraTech Cement Ltd."
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="qualityCheck"
                checked={inwardForm.qualityCheck}
                onChange={(e) => setInwardForm({ ...inwardForm, qualityCheck: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#8B5A2B] focus:ring-[#8B5A2B]"
              />
              <label htmlFor="qualityCheck" className="text-xs text-slate-700 font-medium">
                Verified batch quality inspection & gate weighment receipt
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setIsInwardModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#8B5A2B] hover:bg-[#784C23] rounded-md transition-colors shadow-sm"
              >
                Confirm Inward Stock
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ====================================================================
          7. MODAL: GENERATE REPORT
          ==================================================================== */}
      {isReportModalOpen && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Export Inventory & Stock Ledger Report"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Template
              </label>
              <select
                className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white focus:outline-none focus:border-[#8B5A2B]"
                value={reportConfig.type}
                onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
              >
                <option value="Daily Stock Ledger">Daily Stock Ledger (Comprehensive)</option>
                <option value="Material Inward & Outward Summary">Material Inward & Outward Summary (MTD)</option>
                <option value="Stock Valuation & Threshold Audit">Stock Valuation & Threshold Audit</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Export Format
                </label>
                <select
                  className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white focus:outline-none focus:border-[#8B5A2B]"
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
                >
                  <option value="PDF">PDF Document (.pdf)</option>
                  <option value="Excel">Excel Spreadsheet (.xlsx)</option>
                  <option value="CSV">CSV Ledger Dump (.csv)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date Range
                </label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 rounded-md p-2 bg-slate-50 text-slate-600 focus:outline-none"
                  value={reportConfig.dateScope}
                  readOnly
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-md text-xs text-amber-900 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-amber-700 mt-0.5 flex-shrink-0" />
              <span>
                Report will compile certified stock balances from all active sites with official digital ledger verification stamp.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                onClick={() => setIsReportModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#8B5A2B] hover:bg-[#784C23] rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
                onClick={handleDownloadReport}
              >
                <Download size={14} />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ====================================================================
          8. MODAL: VOUCHER / DOC DETAILS
          ==================================================================== */}
      {selectedDocDetails && (
        <Modal
          isOpen={!!selectedDocDetails}
          onClose={() => setSelectedDocDetails(null)}
          title={`Material Document: ${selectedDocDetails.refDoc}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block">Transaction Reference</span>
                <span className="font-semibold text-sm text-slate-900">{selectedDocDetails.refDoc}</span>
              </div>
              <span
                className={`trans-type-pill ${
                  selectedDocDetails.type === 'GRN'
                    ? 'trans-type-grn'
                    : selectedDocDetails.type === 'SIV'
                    ? 'trans-type-siv'
                    : 'trans-type-transfer'
                }`}
              >
                {selectedDocDetails.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Date & Time</span>
                <span className="font-medium text-slate-800">{selectedDocDetails.dateTime}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Allocated Project</span>
                <span className="font-medium text-slate-800">{selectedDocDetails.project}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Material</span>
                <span className="font-medium text-slate-800">{selectedDocDetails.materialName}</span>
                <span className="text-slate-400 block text-[11px]">{selectedDocDetails.materialCode}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Quantity Movement</span>
                <span className="font-bold text-slate-900">
                  {selectedDocDetails.inwardQty || selectedDocDetails.outwardQty}
                </span>
                <span className="text-slate-400 block text-[11px]">
                  Balance: {selectedDocDetails.balance}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Supplier / Source</span>
                <span className="font-medium text-slate-800">{selectedDocDetails.supplier}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Vehicle Number</span>
                <span className="font-medium text-slate-800">{selectedDocDetails.vehicleNo}</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Inspected by: {selectedDocDetails.inspector}</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                VERIFIED
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                onClick={() => setSelectedDocDetails(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#8B5A2B] hover:bg-[#784C23] rounded-md transition-colors flex items-center gap-1.5"
                onClick={() => {
                  showToast(`Printing voucher ${selectedDocDetails.refDoc}...`, 'info');
                  setSelectedDocDetails(null);
                }}
              >
                <Printer size={13} />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
