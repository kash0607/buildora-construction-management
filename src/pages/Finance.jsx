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
import FormModal from '../components/common/FormModal';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';

export default function Finance() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('budget'); // 'budget' | 'expenses' | 'invoices' | 'payments'
  const [loading, setLoading] = useState(true);

  // Financial Data
  const [budgetMetrics, setBudgetMetrics] = useState({
    totalBudget: 0,
    actualExpenses: 0,
    remainingBudget: 0,
    utilizationPercentage: 0,
    categoryBreakdown: {},
    projects: [],
  });
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);

  // Search
  const [search, setSearch] = useState('');

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // Forms
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    project: '',
    category: 'Materials',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    description: '',
  });

  const [invoiceForm, setInvoiceForm] = useState({
    title: '',
    project: '',
    client: '',
    subtotal: '',
    taxRate: 18,
    dueDate: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Bank Transfer / NEFT',
    transactionReference: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, eRes, iRes, payRes, pRes] = await Promise.all([
        api.getBudgetUtilization(),
        api.getExpenses(),
        api.getInvoices(),
        api.getPayments(),
        api.getProjects(),
      ]);

      if (bRes.success && bRes.data) setBudgetMetrics(bRes.data);
      if (eRes.success) setExpenses(eRes.data || []);
      if (iRes.success) setInvoices(iRes.data || []);
      if (payRes.success) setPayments(payRes.data || []);
      if (pRes.success) setProjects(pRes.data || []);
    } catch {
      showToast('Error loading financial metrics', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.project || !expenseForm.amount) {
      showToast('Please fill all required expense fields', 'warning');
      return;
    }

    const res = await api.createExpense(expenseForm);
    if (res.success) {
      showToast('Expense recorded successfully', 'success');
      setShowExpenseModal(false);
      setExpenseForm({
        title: '',
        project: '',
        category: 'Materials',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        description: '',
      });
      loadData();
    } else {
      showToast(res.message || 'Failed to record expense', 'danger');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.title || !invoiceForm.project || !invoiceForm.subtotal || !invoiceForm.dueDate) {
      showToast('Please fill all required invoice fields', 'warning');
      return;
    }

    const res = await api.createInvoice(invoiceForm);
    if (res.success) {
      showToast('Invoice generated successfully', 'success');
      setShowInvoiceModal(false);
      setInvoiceForm({
        title: '',
        project: '',
        client: '',
        subtotal: '',
        taxRate: 18,
        dueDate: '',
        notes: '',
      });
      loadData();
    } else {
      showToast(res.message || 'Failed to generate invoice', 'danger');
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    const balance = Math.max(0, (invoice.totalAmount || 0) - (invoice.paidAmount || 0));
    setPaymentForm({
      amount: balance,
      paymentMethod: 'Bank Transfer / NEFT',
      transactionReference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Settlement for invoice ${invoice.invoiceNumber}`,
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !paymentForm.amount || !paymentForm.transactionReference) {
      showToast('Please fill all payment details', 'warning');
      return;
    }

    const payload = {
      invoice: selectedInvoiceForPayment._id,
      amount: Number(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      transactionReference: paymentForm.transactionReference,
      notes: paymentForm.notes,
    };

    const res = await api.recordPayment(payload);
    if (res.success) {
      showToast('Payment recorded successfully! Invoice status updated.', 'success');
      setShowPaymentModal(false);
      loadData();
    } else {
      showToast(res.message || 'Failed to record payment', 'danger');
    }
  };

  const handleApproveExpense = async (id) => {
    const res = await api.updateExpenseStatus(id, 'Approved');
    if (res.success) {
      showToast('Expense approved', 'success');
      loadData();
    } else {
      showToast(res.message || 'Action failed', 'danger');
    }
  };

  const tabOptions = [
    { value: 'budget', label: 'Budget & Utilization' },
    { value: 'expenses', label: 'Expenses', count: expenses.length },
    { value: 'invoices', label: 'Invoices', count: invoices.length },
    { value: 'payments', label: 'Payments', count: payments.length },
  ];

  return (
    <div className="finance-page" style={{ padding: '0 0.5rem' }}>
      <PageHeader
        title="Finance & Cost Governance"
        subtitle="Live project budget utilization, audited site disbursements, client invoicing, and payment reconciliation."
        breadcrumbs={[{ label: 'Workspace', href: '/dashboard' }, { label: 'Finance' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowExpenseModal(true)}
            >
              + Record Expense
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowInvoiceModal(true)}
            >
              + Create Invoice
            </button>
          </div>
        }
      />

      {/* KPI Cards: Dynamic from backend data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard
          title="Total Portfolio Budget"
          value={formatCurrency(budgetMetrics.totalBudget, true)}
          subtitle="Sanctioned project capital"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard
          title="Actual Expenses"
          value={formatCurrency(budgetMetrics.actualExpenses, true)}
          subtitle="Approved disbursements"
          trend={`${budgetMetrics.utilizationPercentage}% spent`}
          trendType={budgetMetrics.utilizationPercentage > 85 ? 'negative' : 'neutral'}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
        <StatCard
          title="Remaining Budget"
          value={formatCurrency(budgetMetrics.remainingBudget, true)}
          subtitle="Available project liquidity"
          trendType="positive"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <StatCard
          title="Invoices Billed"
          value={formatCurrency(invoices.reduce((s, i) => s + (i.totalAmount || 0), 0), true)}
          subtitle={`${invoices.length} invoices generated`}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>}
        />
      </div>

      {/* Tabs & Controls */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <FilterBar options={tabOptions} activeValue={activeTab} onChange={setActiveTab} />
          <SearchBar value={search} onChange={setSearch} placeholder="Search expenses, invoices, reference..." onClear={() => setSearch('')} />
        </div>

        {/* TAB 1: BUDGET & UTILIZATION */}
        {activeTab === 'budget' && (
          <div>
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--color-warm-sand)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>Portfolio Budget Utilization</span>
                <span>{budgetMetrics.utilizationPercentage}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, budgetMetrics.utilizationPercentage)}%`,
                    height: '100%',
                    backgroundColor: budgetMetrics.utilizationPercentage > 85 ? 'var(--color-danger)' : 'var(--color-primary-brown)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            <DataTable
              loading={loading}
              data={budgetMetrics.projects || []}
              columns={[
                { key: 'projectId', header: 'Project ID', sortable: true, width: '120px' },
                { key: 'name', header: 'Project Name', sortable: true },
                {
                  key: 'budget',
                  header: 'Total Budget',
                  sortable: true,
                  render: (val) => formatCurrency(val),
                },
                {
                  key: 'actualExpenses',
                  header: 'Disbursed Expenses',
                  sortable: true,
                  render: (val) => <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>,
                },
                {
                  key: 'remainingBudget',
                  header: 'Remaining Balance',
                  sortable: true,
                  render: (val) => formatCurrency(val),
                },
                {
                  key: 'utilizationPercentage',
                  header: 'Utilization',
                  sortable: true,
                  render: (val) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--color-warm-beige)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, val)}%`, height: '100%', backgroundColor: val > 85 ? 'var(--color-danger)' : 'var(--color-primary-brown)' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{val}%</span>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (val) => <StatusBadge status={val} />,
                },
              ]}
            />
          </div>
        )}

        {/* TAB 2: EXPENSES */}
        {activeTab === 'expenses' && (
          <DataTable
            loading={loading}
            data={expenses.filter((e) => {
              if (search) {
                const s = search.toLowerCase();
                return (
                  e.expenseId?.toLowerCase().includes(s) ||
                  e.title?.toLowerCase().includes(s) ||
                  e.category?.toLowerCase().includes(s) ||
                  e.projectName?.toLowerCase().includes(s)
                );
              }
              return true;
            })}
            columns={[
              { key: 'expenseId', header: 'Expense ID', sortable: true, width: '120px' },
              { key: 'title', header: 'Title / Description', sortable: true },
              { key: 'projectName', header: 'Project', sortable: true },
              { key: 'category', header: 'Cost Category', sortable: true },
              {
                key: 'amount',
                header: 'Amount',
                sortable: true,
                render: (val) => <span style={{ fontWeight: 700 }}>{formatCurrency(val)}</span>,
              },
              {
                key: 'date',
                header: 'Date',
                sortable: true,
                render: (val) => formatDate(val),
              },
              { key: 'createdByName', header: 'Submitted By' },
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
                    {row.status === 'Pending' && ['Admin', 'Project Manager', 'Finance'].includes(currentUser?.role) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                        onClick={() => handleApproveExpense(row._id)}
                      >
                        Approve
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}

        {/* TAB 3: INVOICES */}
        {activeTab === 'invoices' && (
          <DataTable
            loading={loading}
            data={invoices.filter((i) => {
              if (search) {
                const s = search.toLowerCase();
                return (
                  i.invoiceNumber?.toLowerCase().includes(s) ||
                  i.title?.toLowerCase().includes(s) ||
                  i.client?.toLowerCase().includes(s) ||
                  i.projectName?.toLowerCase().includes(s)
                );
              }
              return true;
            })}
            columns={[
              { key: 'invoiceNumber', header: 'Invoice #', sortable: true, width: '120px' },
              { key: 'title', header: 'Billing Scope', sortable: true },
              { key: 'client', header: 'Billed To', sortable: true },
              { key: 'projectName', header: 'Project', sortable: true },
              {
                key: 'totalAmount',
                header: 'Total Incl Tax',
                sortable: true,
                render: (val) => <span style={{ fontWeight: 700 }}>{formatCurrency(val)}</span>,
              },
              {
                key: 'dueDate',
                header: 'Due Date',
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
                    {row.status !== 'Paid' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
                        onClick={() => openPaymentModal(row)}
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}

        {/* TAB 4: PAYMENTS */}
        {activeTab === 'payments' && (
          <DataTable
            loading={loading}
            data={payments.filter((p) => {
              if (search) {
                const s = search.toLowerCase();
                return (
                  p.paymentNumber?.toLowerCase().includes(s) ||
                  p.invoiceNumber?.toLowerCase().includes(s) ||
                  p.transactionReference?.toLowerCase().includes(s)
                );
              }
              return true;
            })}
            columns={[
              { key: 'paymentNumber', header: 'Receipt #', sortable: true, width: '120px' },
              { key: 'invoiceNumber', header: 'Invoice Ref', sortable: true, width: '120px' },
              {
                key: 'amount',
                header: 'Settled Amount',
                sortable: true,
                render: (val) => <span style={{ fontWeight: 700 }}>{formatCurrency(val)}</span>,
              },
              {
                key: 'paymentDate',
                header: 'Payment Date',
                sortable: true,
                render: (val) => formatDate(val),
              },
              { key: 'paymentMethod', header: 'Method' },
              { key: 'transactionReference', header: 'Bank Ref / UTR' },
              {
                key: 'paymentStatus',
                header: 'Status',
                render: (val) => <StatusBadge status={val} />,
              },
            ]}
          />
        )}
      </div>

      {/* MODAL: Record Expense */}
      <FormModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Record Site / Operations Expense"
        subtitle="Log an expense voucher or subcontractor invoice with supporting receipt reference"
      >
        <form onSubmit={handleCreateExpense}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Expense Description / Purpose *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Tower Crane Mobile Diesel Refill"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                className="form-control"
                value={expenseForm.project}
                onChange={(e) => setExpenseForm({ ...expenseForm, project: e.target.value })}
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
              <label className="form-label">Cost Category *</label>
              <select
                className="form-control"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              >
                <option value="Labor">Labor</option>
                <option value="Materials">Materials</option>
                <option value="Equipment">Equipment</option>
                <option value="Subcontractor">Subcontractor</option>
                <option value="Fuel & Power">Fuel & Power</option>
                <option value="Permits & Legal">Permits & Legal</option>
                <option value="Site Overhead">Site Overhead</option>
                <option value="Safety & Compliance">Safety & Compliance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="45000"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-control"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowExpenseModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Record Expense
            </button>
          </div>
        </form>
      </FormModal>

      {/* MODAL: Generate Invoice */}
      <FormModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Generate Client Invoice"
        subtitle="Issue an official milestone or progress billing invoice to client"
      >
        <form onSubmit={handleCreateInvoice}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Billing Scope / Milestone *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Tower 1 Substructure & Foundation Completion (Milestone 2)"
              value={invoiceForm.title}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                className="form-control"
                value={invoiceForm.project}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, project: e.target.value })}
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
              <label className="form-label">Client Entity</label>
              <input
                type="text"
                className="form-control"
                placeholder="Apex Developers Ltd"
                value={invoiceForm.client}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, client: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Taxable Subtotal (₹) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="1500000"
                value={invoiceForm.subtotal}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST %</label>
              <input
                type="number"
                className="form-control"
                value={invoiceForm.taxRate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                className="form-control"
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowInvoiceModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate & Issue Invoice
            </button>
          </div>
        </form>
      </FormModal>

      {/* MODAL: Record Payment */}
      <FormModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Record Payment for ${selectedInvoiceForPayment?.invoiceNumber || ''}`}
        subtitle="Reconcile bank transfer, cheque, or electronic payment against invoice balance"
      >
        <form onSubmit={handleRecordPayment}>
          <div style={{ backgroundColor: 'var(--color-warm-sand)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem' }}>
            <div><strong>Invoice:</strong> {selectedInvoiceForPayment?.title}</div>
            <div><strong>Client:</strong> {selectedInvoiceForPayment?.client}</div>
            <div>
              <strong>Total Billed:</strong> {formatCurrency(selectedInvoiceForPayment?.totalAmount)} |{' '}
              <strong>Already Paid:</strong> {formatCurrency(selectedInvoiceForPayment?.paidAmount || 0)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Settlement Amount (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-control"
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              >
                <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="Cheque">Cheque</option>
                <option value="Corporate Card">Corporate Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Bank UTR / Transaction Reference *</label>
            <input
              type="text"
              className="form-control"
              value={paymentForm.transactionReference}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Reconcile Payment
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
