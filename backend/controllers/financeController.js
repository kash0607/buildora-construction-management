import Expense from '../models/Expense.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';
import { sendNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

// ==========================================
// 1. EXPENSES
// ==========================================

/**
 * Resolve a project identifier (ObjectId string or PRJ-xxx) into a proper filter.
 */
function buildProjectFilter(projectInput) {
  if (!projectInput || projectInput === 'All') return {};
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(projectInput);
  if (isObjectId) {
    return { project: projectInput };
  }
  // Match by business ID or name
  return { $or: [{ projectId: projectInput }, { projectName: projectInput }] };
}

export async function getExpenses(req, res, next) {
  try {
    const { project, category, status } = req.query;
    const filter = { ...buildProjectFilter(project) };

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;

    const expenses = await Expense.find(filter)
      .populate('project', 'name projectId budget')
      .populate('createdBy', 'name email role')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req, res, next) {
  try {
    const { title, project, category, amount, date, description, vendor, supportingDocument } = req.body;

    if (!title || !project || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Title, project, and amount are required',
      });
    }

    let projDoc = (project.startsWith('PRJ-') || !project.match(/^[0-9a-fA-F]{24}$/))
      ? await Project.findOne({ projectId: project })
      : await Project.findById(project);

    if (!projDoc) {
      return res.status(400).json({
        success: false,
        message: `Project '${project}' not found. Cannot record expense without a valid project.`,
      });
    }

    const expense = await Expense.create({
      title: title.trim(),
      project: projDoc._id,
      projectId: projDoc.projectId,
      projectName: projDoc.name,
      category: category || 'Materials',
      amount: Number(amount),
      date: date || new Date(),
      description: description || '',
      vendor: vendor || '',
      supportingDocument: supportingDocument || '',
      createdBy: req.user._id,
      createdByName: req.user.name,
      status: 'Pending',
    });

    await sendNotification({
      targetRole: 'Finance',
      project: projDoc._id,
      title: 'New Expense Submitted',
      message: `Expense ${expense.expenseId} (₹${expense.amount}) logged for ${projDoc.name}.`,
      type: 'Finance',
      link: '/finance',
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entity: 'Expense',
      entityId: expense.expenseId,
      project: projDoc._id,
      projectId: projDoc.projectId,
      details: { amount: expense.amount, category: expense.category },
    });

    return res.status(201).json({
      success: true,
      message: `Expense ${expense.expenseId} recorded as Pending. Awaiting approval.`,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateExpenseStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const expense = (id.startsWith('EXP-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await Expense.findOne({ expenseId: id })
      : await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    const previousStatus = expense.status;
    expense.status = status;

    if (status === 'Approved') {
      expense.approvedBy = req.user._id;

      // Only accrue to project actualCost when transitioning to Approved
      if (previousStatus !== 'Approved') {
        const projDoc = await Project.findById(expense.project);
        if (projDoc) {
          projDoc.actualCost = (projDoc.actualCost || 0) + (expense.amount || 0);
          await projDoc.save();
        }
      }
    }

    // If reversing an approval (e.g. Approved → Rejected), deduct from actualCost
    if (previousStatus === 'Approved' && status !== 'Approved') {
      const projDoc = await Project.findById(expense.project);
      if (projDoc) {
        projDoc.actualCost = Math.max(0, (projDoc.actualCost || 0) - (expense.amount || 0));
        await projDoc.save();
      }
    }

    await expense.save();

    await sendNotification({
      recipient: expense.createdBy,
      project: expense.project,
      title: `Expense Status Updated: ${status}`,
      message: `Expense ${expense.expenseId} has been updated to ${status}.`,
      type: 'Finance',
      link: '/finance',
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_STATUS',
      entity: 'Expense',
      entityId: expense.expenseId,
      project: expense.project,
      projectId: expense.projectId,
      details: { status, previousStatus },
    });

    return res.status(200).json({
      success: true,
      message: `Expense ${expense.expenseId} marked as ${status}`,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. INVOICES
// ==========================================

export async function getInvoices(req, res, next) {
  try {
    const { project, status } = req.query;
    const filter = { ...buildProjectFilter(project) };

    if (status && status !== 'All') filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('project', 'name projectId client')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req, res, next) {
  try {
    const { title, project, client, subtotal, taxRate, dueDate, notes, documentReference } = req.body;

    if (!title || !project || !subtotal || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Title, project, subtotal, and due date are required',
      });
    }

    let projDoc = (project.startsWith('PRJ-') || !project.match(/^[0-9a-fA-F]{24}$/))
      ? await Project.findOne({ projectId: project })
      : await Project.findById(project);

    if (!projDoc) {
      projDoc = await Project.findOne({ name: new RegExp(`^${project}$`, 'i') });
    }

    if (!projDoc) {
      return res.status(400).json({
        success: false,
        message: `Project '${project}' not found. Valid project required for invoice creation.`,
      });
    }

    const invoice = await Invoice.create({
      title: title.trim(),
      project: projDoc._id,
      projectId: projDoc.projectId,
      projectName: projDoc.name,
      client: client || projDoc.client,
      subtotal: Number(subtotal),
      taxRate: taxRate !== undefined ? Number(taxRate) : 18,
      dueDate: new Date(dueDate),
      notes: notes || '',
      documentReference: documentReference || '',
      createdBy: req.user._id,
      status: 'Issued',
    });

    if (projDoc.clientUser) {
      await sendNotification({
        recipient: projDoc.clientUser,
        targetRole: 'Client',
        project: projDoc._id,
        title: 'New Invoice Issued',
        message: `Invoice ${invoice.invoiceNumber} for ₹${invoice.totalAmount} has been issued.`,
        type: 'Finance',
        link: '/client-portal',
      });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entity: 'Invoice',
      entityId: invoice.invoiceNumber,
      project: projDoc._id,
      projectId: projDoc.projectId,
      details: { totalAmount: invoice.totalAmount, dueDate: invoice.dueDate },
    });

    return res.status(201).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} created successfully`,
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. PAYMENTS
// ==========================================

export async function getPayments(req, res, next) {
  try {
    const { invoiceId, project } = req.query;
    const filter = {};

    if (invoiceId) filter.invoice = invoiceId;
    if (project && project !== 'All') filter.project = project;

    const payments = await Payment.find(filter)
      .populate('invoice', 'invoiceNumber title totalAmount paidAmount status')
      .populate('project', 'name projectId')
      .populate('recordedBy', 'name email role')
      .sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (err) {
    next(err);
  }
}

export async function recordPayment(req, res, next) {
  try {
    const { invoice: invoiceIdInput, amount, paymentMethod, transactionReference, paymentDate, notes } = req.body;

    if (!invoiceIdInput || !amount || !transactionReference) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Invoice reference, amount, and transaction reference are required',
      });
    }

    const invoice = (invoiceIdInput.startsWith('INV-') || !invoiceIdInput.match(/^[0-9a-fA-F]{24}$/))
      ? await Invoice.findOne({ invoiceNumber: invoiceIdInput })
      : await Invoice.findById(invoiceIdInput);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Referenced invoice not found' });
    }    const payAmount = Number(amount);
    if (!Number.isFinite(payAmount) || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Payment amount must be a finite number greater than zero',
      });
    }

    // ── Overpayment guard ──
    const currentPaid = invoice.paidAmount || 0;
    const remaining = (invoice.totalAmount || 0) - currentPaid;
    if (payAmount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Payment of ₹${payAmount.toLocaleString('en-IN')} exceeds the remaining balance of ₹${remaining.toLocaleString('en-IN')} on invoice ${invoice.invoiceNumber}.`,
      });
    }

    const payment = await Payment.create({
      invoice: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      project: invoice.project,
      amount: payAmount,
      paymentMethod: paymentMethod || 'Bank Transfer / NEFT',
      transactionReference: transactionReference.trim(),
      paymentDate: paymentDate || new Date(),
      paymentStatus: 'Completed',
      notes: notes || '',
      recordedBy: req.user._id,
    });

    // Update invoice paidAmount and status
    invoice.paidAmount = currentPaid + payAmount;
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 'Paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'Partially Paid';
    }
    await invoice.save();

    await sendNotification({
      targetRole: 'Finance',
      project: invoice.project,
      title: 'Payment Recorded',
      message: `Payment of ₹${payAmount.toLocaleString('en-IN')} recorded for invoice ${invoice.invoiceNumber}.`,
      type: 'Finance',
      link: '/finance',
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PAYMENT_RECEIVE',
      entity: 'Payment',
      entityId: payment.paymentNumber,
      project: invoice.project,
      projectId: invoice.projectId,
      details: { amount: payAmount, invoiceNumber: invoice.invoiceNumber, status: invoice.status },
    });

    return res.status(201).json({
      success: true,
      message: `Payment ${payment.paymentNumber} of ₹${payAmount.toLocaleString('en-IN')} recorded successfully`,
      data: payment,
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. BUDGET UTILIZATION & FINANCIAL METRICS
// ==========================================

export async function getBudgetUtilization(req, res, next) {
  try {
    const { projectId } = req.query;

    let projectFilter = {};
    if (projectId && projectId !== 'All') {
      const isObjectId = projectId.match(/^[0-9a-fA-F]{24}$/);
      projectFilter = isObjectId
        ? { _id: projectId }
        : { projectId };
    }

    const projects = await Project.find(projectFilter).select('name projectId budget actualCost committedCost status');

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const projectIds = projects.map((p) => p._id);
    const projectIdStrings = projects.map((p) => p.projectId).filter(Boolean);

    // Sum ONLY expenses belonging to the filtered project(s)
    const expenseQuery = {
      status: { $in: ['Approved', 'Paid'] },
      $or: [
        { project: { $in: projectIds } },
        { projectId: { $in: projectIdStrings } },
      ],
    };

    const expenses = await Expense.find(expenseQuery);
    const actualExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - actualExpenses);
    const utilizationPercentage = totalBudget > 0 ? Number(((actualExpenses / totalBudget) * 100).toFixed(2)) : 0;

    // Category breakdown strictly for the scoped expenses
    const categoryBreakdown = {};
    expenses.forEach((e) => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + (e.amount || 0);
    });

    // Project level breakdown
    const projectBreakdowns = projects.map((p) => {
      const pExpenses = expenses.filter((e) => String(e.project) === String(p._id) || e.projectId === p.projectId);
      const spent = pExpenses.reduce((sum, e) => sum + (e.amount || 0), 0) || (p.actualCost || 0);
      const rem = Math.max(0, (p.budget || 0) - spent);
      const util = p.budget > 0 ? Number(((spent / p.budget) * 100).toFixed(2)) : 0;
      return {
        id: p._id,
        projectId: p.projectId,
        name: p.name,
        budget: p.budget,
        actualExpenses: spent,
        remainingBudget: rem,
        utilizationPercentage: util,
        status: p.status,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalBudget,
        actualExpenses,
        remainingBudget,
        utilizationPercentage,
        categoryBreakdown,
        projects: projectBreakdowns,
      },
    });
  } catch (err) {
    next(err);
  }
}
