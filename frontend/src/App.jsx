import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
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
import NotFound from './pages/NotFound';
import DemoOne from './components/ui/demo';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public SaaS Landing Page (Default Entry Point) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Loader Demo */}
          <Route path="/demo" element={<DemoOne />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Quick alias for app */}
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Application Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="site-reports" element={<SiteReports />} />
            <Route path="issues" element={<Issues />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="materials" element={<Materials />} />
            <Route path="inventory" element={<Inventory />} />
            {/* Graceful redirect for legacy or direct /analytics navigation */}
            <Route path="analytics" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* 404 Not Found Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}