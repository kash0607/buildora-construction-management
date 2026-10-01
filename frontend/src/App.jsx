import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import AppLayout from './components/layout/AppLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import SiteReports from './pages/SiteReports';
import Issues from './pages/Issues';
import Approvals from './pages/Approvals';
import Materials from './pages/Materials';
import Inventory from './pages/Inventory';
import Procurement from './pages/Procurement';
import Finance from './pages/Finance';
import Documents from './pages/Documents';
import ClientPortal from './pages/ClientPortal';
import VendorPortal from './pages/VendorPortal';
import AuditLogs from './pages/AuditLogs';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// ── Role groupings for route-level authorization ──
const INTERNAL_ROLES = ['Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager', 'Finance'];
const MANAGEMENT_ROLES = ['Admin', 'Project Manager', 'Finance'];
const PROCUREMENT_ROLES = ['Admin', 'Project Manager', 'Procurement Manager'];
const FINANCE_ROLES = ['Admin', 'Project Manager', 'Finance'];
const ADMIN_ONLY = ['Admin'];

function WorkspaceRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'Client') return <Navigate to="/client-portal" replace />;
  if (currentUser.role === 'Vendor') return <Navigate to="/vendor-portal" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public SaaS Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WorkspaceRedirect />} />

            {/* Dashboard — all authenticated internal roles */}
            <Route path="dashboard" element={<RoleRoute allowed={INTERNAL_ROLES}><Dashboard /></RoleRoute>} />

            {/* Core Operational — all internal roles */}
            <Route path="projects" element={<RoleRoute allowed={INTERNAL_ROLES}><Projects /></RoleRoute>} />
            <Route path="projects/:id" element={<RoleRoute allowed={INTERNAL_ROLES}><ProjectDetails /></RoleRoute>} />
            <Route path="tasks" element={<RoleRoute allowed={INTERNAL_ROLES}><Tasks /></RoleRoute>} />
            <Route path="site-reports" element={<RoleRoute allowed={INTERNAL_ROLES}><SiteReports /></RoleRoute>} />
            <Route path="issues" element={<RoleRoute allowed={INTERNAL_ROLES}><Issues /></RoleRoute>} />

            {/* Approvals — management roles only */}
            <Route path="approvals" element={<RoleRoute allowed={MANAGEMENT_ROLES}><Approvals /></RoleRoute>} />

            {/* Materials & Inventory — internal roles */}
            <Route path="materials" element={<RoleRoute allowed={INTERNAL_ROLES}><Materials /></RoleRoute>} />
            <Route path="inventory" element={<RoleRoute allowed={INTERNAL_ROLES}><Inventory /></RoleRoute>} />

            {/* Procurement — procurement & management roles */}
            <Route path="procurement" element={<RoleRoute allowed={PROCUREMENT_ROLES}><Procurement /></RoleRoute>} />

            {/* Finance — finance & management roles */}
            <Route path="finance" element={<RoleRoute allowed={FINANCE_ROLES}><Finance /></RoleRoute>} />

            {/* Documents — all internal roles */}
            <Route path="documents" element={<RoleRoute allowed={INTERNAL_ROLES}><Documents /></RoleRoute>} />

            {/* Role-specific portals */}
            <Route path="client-portal" element={<RoleRoute allowed={['Client', 'Admin']}><ClientPortal /></RoleRoute>} />
            <Route path="vendor-portal" element={<RoleRoute allowed={['Vendor', 'Admin']}><VendorPortal /></RoleRoute>} />

            {/* Governance — admin only */}
            <Route path="audit-logs" element={<RoleRoute allowed={ADMIN_ONLY}><AuditLogs /></RoleRoute>} />

            {/* Notifications — all roles */}
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}