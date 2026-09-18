import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';

export const SYSTEM_ROLES = [
  { id: 'project-manager', name: 'Project Manager', description: 'Manage projects, schedules, budgets & approvals' },
  { id: 'admin', name: 'Admin', description: 'Full enterprise access & governance' },
  { id: 'site-supervisor', name: 'Site Supervisor', description: 'Daily site logs, worker counts & material receipts' },
  { id: 'procurement-manager', name: 'Procurement Manager', description: 'Vendors, RFQs, Purchase Orders & deliveries' },
  { id: 'finance', name: 'Finance', description: 'Budget allocation, disbursements & invoice audits' },
  { id: 'client', name: 'Client', description: 'Executive milestones, approved photos & progress' },
];

export const SEEDED_DEMO_USERS = [
  { email: 'kashish.pm@buildora.com', name: 'Kashish Patel', role: 'Project Manager', avatar: 'KP' },
  { email: 'admin@buildora.com', name: 'Vikram Malhotra', role: 'Admin', avatar: 'VM' },
  { email: 'sanjay.site@buildora.com', name: 'Sanjay Verma', role: 'Site Supervisor', avatar: 'SV' },
  { email: 'finance@buildora.com', name: 'Ananya Iyer', role: 'Finance', avatar: 'AI' },
  { email: 'procurement@buildora.com', name: 'Rohan Gupta', role: 'Procurement Manager', avatar: 'RG' },
  { email: 'client.rep@lodha.com', name: 'Rajesh Oberoi', role: 'Client', avatar: 'RO' },
];

const AuthContext = createContext(null);
const SESSION_KEY = 'buildora_auth_session';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  const demoUsers = SEEDED_DEMO_USERS;
  const roles = SYSTEM_ROLES;

  // Verify and hydrate current user from backend /api/auth/me on mount/refresh
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setCurrentUser(null);
          localStorage.removeItem(SESSION_KEY);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.getMe();
        if (isMounted) {
          if (res.success && res.data) {
            setCurrentUser(res.data);
            localStorage.setItem(SESSION_KEY, JSON.stringify(res.data));
          } else {
            // Token expired or invalid
            setCurrentUser(null);
            setAuthToken(null);
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch {
        // Network issue: keep cached session if available
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'Please enter both your email and password.' };
    }

    const res = await api.login(email, password);

    if (res.success && res.data?.user) {
      setCurrentUser(res.data.user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }

    return {
      success: false,
      message: res.message || 'Authentication failed. Please check your credentials.',
    };
  };

  const register = async (userData) => {
    if (!userData.fullName && !userData.name) {
      return { success: false, message: 'Full name is required.' };
    }
    if (!userData.email || !userData.password) {
      return { success: false, message: 'Email and password are required.' };
    }

    const res = await api.register(userData);

    if (res.success && res.data?.user) {
      setCurrentUser(res.data.user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(res.data.user));
      return { success: true, user: res.data.user };
    }

    return {
      success: false,
      message: res.message || 'Registration failed. Please check input requirements.',
      errors: res.errors,
    };
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const switchRole = (roleName) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: roleName };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        demoUsers,
        roles,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
