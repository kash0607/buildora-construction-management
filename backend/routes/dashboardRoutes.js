import express from 'express';
import {
  getDashboardStats,
  getAnalyticsSummary,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/analytics', protect, getAnalyticsSummary);

export default router;
