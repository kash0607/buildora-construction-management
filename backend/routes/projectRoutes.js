import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getProjects)
  .post(protect, authorizeRoles('Admin', 'Project Manager'), createProject);

router
  .route('/:id')
  .get(protect, getProject)
  .put(protect, authorizeRoles('Admin', 'Project Manager'), updateProject)
  .delete(protect, authorizeRoles('Admin', 'Project Manager'), deleteProject);

export default router;
