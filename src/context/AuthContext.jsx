import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MOCK_DATA } from '../services/mockData';

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
    // Default logged in demo persona
    const defaultUser = INITIAL_MOCK_DATA.currentUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  });

  const demoUsers = INITIAL_MOCK_DATA.demoUsers;
  const roles = INITIAL_MOCK_DATA.roles;

  const setSession = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const login = async (email, password, selectedRole = null) => {
    if (!email || !password) {
      return { success: false, message: 'Please enter both your email and password.' };
    }

    let user = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: 'usr-' + Math.floor(10 + Math.random() * 90),
        email: email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        role: selectedRole || 'Project Manager',
        avatar: email.substring(0, 2).toUpperCase(),
        phone: '+91 98765 43210'
      };
    } else if (selectedRole) {
      user = { ...user, role: selectedRole };
    }

    setSession(user);
    return { success: true, user };
  };

  const register = async (userData) => {
    if (!userData.fullName || !userData.email || !userData.password) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    const newUser = {
      id: 'usr-' + Math.floor(10 + Math.random() * 90),
      name: userData.fullName,
      email: userData.email,
      role: userData.role || 'Project Manager',
      phone: userData.phone || '',
      avatar: userData.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    };

    setSession(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setSession(null);
  };

  const switchRole = (roleName) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: roleName };
    setSession(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        demoUsers,
        roles,
        login,
        register,
        logout,
        switchRole
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
