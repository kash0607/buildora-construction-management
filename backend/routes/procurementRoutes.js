import express from 'express';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  provisionVendorAccount,
  getPurchaseRequests,
  createPurchaseRequest,
  updatePurchaseRequestStatus,
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  getDeliveries,
  createDelivery,
} from '../controllers/procurementController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ----------------------------------------------------
// Vendors
// ----------------------------------------------------
router
  .route('/vendors')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager', 'Finance', 'Site Supervisor'),
    getVendors
  )
  .post(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager'),
    createVendor
  );

router
  .route('/vendors/:id')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager', 'Finance', 'Site Supervisor'),
    getVendorById
  )
  .put(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager'),
    updateVendor
  )
  .delete(
    authorizeRoles('Admin', 'Procurement Manager'),
    deleteVendor
  );

router
  .route('/vendors/:id/provision')
  .post(
    authorizeRoles('Admin', 'Procurement Manager'),
    provisionVendorAccount
  );

// ----------------------------------------------------
// Purchase Requests
// ----------------------------------------------------
router
  .route('/requests')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager', 'Site Supervisor'),
    getPurchaseRequests
  )
  .post(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager', 'Site Supervisor'),
    createPurchaseRequest
  );

router
  .route('/requests/:id/status')
  .put(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager'),
    updatePurchaseRequestStatus
  );

// ----------------------------------------------------
// Purchase Orders
// ----------------------------------------------------
router
  .route('/orders')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager', 'Finance', 'Vendor'),
    getPurchaseOrders
  )
  .post(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager'),
    createPurchaseOrder
  );

router
  .route('/orders/:id')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager', 'Finance', 'Vendor'),
    getPurchaseOrderById
  );

router
  .route('/orders/:id/status')
  .put(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager', 'Vendor'),
    updatePurchaseOrderStatus
  );

// ----------------------------------------------------
// Deliveries & Receiving (GRN)
// ----------------------------------------------------
router
  .route('/deliveries')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager', 'Site Supervisor', 'Finance', 'Vendor'),
    getDeliveries
  )
  .post(
    authorizeRoles('Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager'),
    createDelivery
  );

export default router;
