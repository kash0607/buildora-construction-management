import express from 'express';
import {
  getTransactions,
  receiveStock,
  issueStock,
  adjustStock,
} from '../controllers/inventoryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/transactions', protect, getTransactions);
router.post(
  '/receive',
  protect,
  authorizeRoles('Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager'),
  receiveStock
);
router.post(
  '/issue',
  protect,
  authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'),
  issueStock
);
router.post(
  '/adjust',
  protect,
  authorizeRoles('Admin', 'Project Manager', 'Procurement Manager'),
  adjustStock
);

export default router;
