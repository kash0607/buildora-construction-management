import express from 'express';
import { getClientProjects, getClientProjectDetails } from '../controllers/clientController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/projects')
  .get(
    authorizeRoles('Client', 'Admin', 'Project Manager'),
    getClientProjects
  );

router
  .route('/projects/:id')
  .get(
    authorizeRoles('Client', 'Admin', 'Project Manager'),
    getClientProjectDetails
  );

export default router;
