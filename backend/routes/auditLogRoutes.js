import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Enterprise Audit Trail is strictly Admin-only
router.route('/').get(authorizeRoles('Admin'), getAuditLogs);

export default router;
