import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleRoute — Frontend route guard that restricts access by user role.
 *
 * Usage:
 *   <Route element={<RoleRoute allowed={['Admin', 'Project Manager']} />}>
 *     <Route path="finance" element={<Finance />} />
 *   </Route>
 *
 * Props:
 * - allowed: string[] — roles permitted to access child routes
 * - children: React node (optional, for wrapping inline)
 * - redirectTo: string (optional, defaults to role-appropriate redirect)
 */
export default function RoleRoute({ allowed = [], children, redirectTo }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowed.length > 0 && !allowed.includes(currentUser.role)) {
    // Redirect to the appropriate portal based on role
    const fallback =
      redirectTo ||
      (currentUser.role === 'Client'
        ? '/client-portal'
        : currentUser.role === 'Vendor'
          ? '/vendor-portal'
          : '/dashboard');

    return <Navigate to={fallback} replace />;
  }

  return children || <></>;
}
