import express from 'express';
import {
  getAllApprovals,
  getPendingApprovals,
  createApproval,
  handleApprovalAction,
} from '../controllers/approvalController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/pending', protect, getPendingApprovals);

router
  .route('/')
  .get(protect, getAllApprovals)
  .post(protect, authorizeRoles('Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager'), createApproval);

router
  .route('/:id/action')
  .post(protect, authorizeRoles('Admin', 'Project Manager', 'Finance'), handleApprovalAction);

export default router;
