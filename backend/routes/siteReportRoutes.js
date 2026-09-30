import express from 'express';
import {
  getSiteReports,
  getSiteReport,
  createSiteReport,
  updateSiteReportStatus,
  uploadSitePhoto,
  approveSitePhoto,
  getApprovedClientPhotos,
  downloadSitePhoto,
} from '../controllers/siteReportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadPhotoMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getSiteReports)
  .post(protect, authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'), createSiteReport);

router
  .route('/photos/client-approved')
  .get(protect, authorizeRoles('Admin', 'Project Manager', 'Site Supervisor', 'Client'), getApprovedClientPhotos);

router
  .route('/:reportId/photos/:photoId/download')
  .get(protect, downloadSitePhoto);

router
  .route('/:id')
  .get(protect, getSiteReport)
  .put(protect, authorizeRoles('Admin', 'Project Manager'), updateSiteReportStatus);

router
  .route('/:id/photos')
  .post(
    protect,
    authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'),
    uploadPhotoMiddleware.single('photo'),
    uploadSitePhoto
  );

router
  .route('/:id/photos/:photoId/approve')
  .put(protect, authorizeRoles('Admin', 'Project Manager'), approveSitePhoto);

export default router;
