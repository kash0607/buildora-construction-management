import express from 'express';
import {
  getMaterialRequests,
  createMaterialRequest,
  updateMaterialRequestStatus,
} from '../controllers/materialRequestController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getMaterialRequests)
  .post(protect, createMaterialRequest);

router.put(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Project Manager', 'Procurement Manager'),
  updateMaterialRequestStatus
);

export default router;
