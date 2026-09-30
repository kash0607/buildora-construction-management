import express from 'express';
import {
  getExpenses,
  createExpense,
  updateExpenseStatus,
  getInvoices,
  createInvoice,
  getPayments,
  recordPayment,
  getBudgetUtilization,
} from '../controllers/financeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ----------------------------------------------------
// Expenses
// ----------------------------------------------------
router
  .route('/expenses')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Finance', 'Site Supervisor'),
    getExpenses
  )
  .post(
    authorizeRoles('Admin', 'Project Manager', 'Finance', 'Site Supervisor'),
    createExpense
  );

router
  .route('/expenses/:id/status')
  .put(
    authorizeRoles('Admin', 'Project Manager', 'Finance'),
    updateExpenseStatus
  );

// ----------------------------------------------------
// Invoices
// ----------------------------------------------------
router
  .route('/invoices')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Finance'),
    getInvoices
  )
  .post(
    authorizeRoles('Admin', 'Project Manager', 'Finance'),
    createInvoice
  );

// ----------------------------------------------------
// Payments
// ----------------------------------------------------
router
  .route('/payments')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Finance'),
    getPayments
  )
  .post(
    authorizeRoles('Admin', 'Finance'),
    recordPayment
  );

// ----------------------------------------------------
// Budget Utilization
// ----------------------------------------------------
router
  .route('/budget-utilization')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Finance', 'Site Supervisor'),
    getBudgetUtilization
  );

export default router;
