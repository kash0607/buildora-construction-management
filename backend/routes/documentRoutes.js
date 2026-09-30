import express from 'express';
import {
  getDocuments,
  uploadDocument,
  updateDocumentVisibility,
  deleteDocument,
  downloadDocument,
} from '../controllers/documentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadDocumentMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(
    authorizeRoles('Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager', 'Finance', 'Client', 'Vendor'),
    getDocuments
  )
  .post(
    authorizeRoles('Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager', 'Finance'),
    uploadDocumentMiddleware.single('file'),
    uploadDocument
  );

router
  .route('/:id/download')
  .get(downloadDocument);

router
  .route('/:id/visibility')
  .put(
    authorizeRoles('Admin', 'Project Manager'),
    updateDocumentVisibility
  );

router
  .route('/:id')
  .delete(
    authorizeRoles('Admin', 'Project Manager'),
    deleteDocument
  );

export default router;
