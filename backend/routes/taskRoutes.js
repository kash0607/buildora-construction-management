import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats/summary', protect, getTaskStats);

router
  .route('/')
  .get(protect, getTasks)
  .post(
    protect,
    authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'),
    createTask
  );

router
  .route('/:id')
  .get(protect, getTask)
  .put(
    protect,
    authorizeRoles('Admin', 'Project Manager', 'Site Supervisor'),
    updateTask
  );

router
  .route('/:id')
  .delete(protect, authorizeRoles('Admin', 'Project Manager'), deleteTask);

export default router;
