import express from 'express';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  getLowStockAlerts,
} from '../controllers/materialController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/alerts/low-stock', protect, getLowStockAlerts);

router
  .route('/')
  .get(protect, getMaterials)
  .post(
    protect,
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager'),
    createMaterial
  );

router
  .route('/:id')
  .get(protect, getMaterial)
  .put(
    protect,
    authorizeRoles('Admin', 'Project Manager', 'Procurement Manager'),
    updateMaterial
  );

export default router;
