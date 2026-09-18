import express from 'express';
import {
  getMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../controllers/milestoneController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getMilestones)
  .post(protect, authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'), createMilestone);

router
  .route('/:id')
  .get(protect, getMilestone)
  .put(protect, authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'), updateMilestone)
  .delete(protect, authorizeRoles('Admin', 'Project Manager'), deleteMilestone);

export default router;
