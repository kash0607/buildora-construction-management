import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import materialRequestRoutes from './routes/materialRequestRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import siteReportRoutes from './routes/siteReportRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, test suites, or server-to-server)
      if (!origin) return callback(null, true);
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (origin === clientUrl || isLocal) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin '${origin}' is not authorized`), false);
    },
    credentials: true,
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: /uploads is NOT served as public static.
// All file access goes through authorized API endpoints:
//   GET /api/documents/:id/download
//   GET /api/site-reports/:reportId/photos/:photoId

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Buildora API is running',
  });
});

// Core Operational API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/material-requests', materialRequestRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/site-reports', siteReportRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Commercial, Financial & Governance API Routes
app.use('/api/procurement', procurementRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
