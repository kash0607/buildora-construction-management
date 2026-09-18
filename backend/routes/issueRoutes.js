import express from 'express';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
} from '../controllers/issueController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getIssues)
  .post(protect, authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'), createIssue);

router
  .route('/:id')
  .get(protect, getIssue)
  .put(protect, authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'), updateIssue);

export default router;
