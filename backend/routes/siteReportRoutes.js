import express from 'express';
import {
  getSiteReports,
  getSiteReport,
  createSiteReport,
  updateSiteReportStatus,
} from '../controllers/siteReportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getSiteReports)
  .post(protect, authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'), createSiteReport);

router
  .route('/:id')
  .get(protect, getSiteReport)
  .put(protect, authorizeRoles('Admin', 'Project Manager'), updateSiteReportStatus);

export default router;
