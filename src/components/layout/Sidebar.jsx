import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, switchRole, logout } = useAuth();
  const role = currentUser ? currentUser.role : 'Project Manager';

  // SVG Icons from design system
  const icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
    ),
    projects: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
    tasks: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
    ),
    reports: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    ),
    issues: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y2="16"/></svg>
    ),
    materials: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
    ),
    approvals: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
    ),
    budget: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    documents: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
    ),
    client: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
    analytics: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
    ),
    logout: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
    )
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop active" onClick={onClose} />
      )}
      <aside id="app-sidebar" className={`app-sidebar ${isOpen ? 'show-mobile' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/dashboard" className="brand-link" onClick={onClose}>
            <div className="brand-icon">B</div>
            <div className="brand-text">
              <span className="brand-name">BUILDORA</span>
              <span className="brand-tagline">Construction Operations</span>
            </div>
          </Link>
          <button
            type="button"
            className="mobile-nav-toggle"
            style={{ display: 'none' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="sidebar-nav-container">
          {/* CORE */}
          <div className="sidebar-group">
            <span className="sidebar-group-label">Core</span>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {icons.dashboard}
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {icons.projects}
              <span>Projects</span>
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {icons.tasks}
              <span>Tasks & Milestones</span>
            </NavLink>
          </div>

          {/* SITE OPERATIONS */}
          <div className="sidebar-group">
            <span className="sidebar-group-label">Site Operations</span>
            <NavLink
              to="/site-reports"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {icons.reports}
              <span>Site Reports</span>
            </NavLink>
            <NavLink
              to="/issues"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {icons.issues}
              <span>Issues & Quality</span>
            </NavLink>
          </div>

          {/* COMMERCIAL & SUPPLY */}
          <div className="sidebar-group">
            <span className="sidebar-group-label">Commercial & Supply</span>
            <NavLink
              to="/approvals"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {icons.approvals}
              <span>Approvals Queue</span>
              <span className="nav-counter" style={{ background: 'var(--color-accent)' }}>
                5
              </span>
            </NavLink>
          </div>

          {/* GOVERNANCE & INSIGHTS */}
          <div className="sidebar-group">
            <span className="sidebar-group-label">Governance & Insights</span>
            <NavLink
              to="/dashboard"
              className="nav-link"
              onClick={onClose}
            >
              {icons.analytics}
              <span>Analytics & KPIs</span>
            </NavLink>
          </div>
        </div>

        {/* User Card & Role Switcher */}
        <div className="sidebar-user-card">
          <div className="user-avatar">{currentUser?.avatar || 'KP'}</div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name || 'Kashish Patel'}</span>
            <span className="user-role-badge">{role}</span>
          </div>
          <button
            type="button"
            className="user-action-btn"
            onClick={logout}
            title="Sign out of Buildora"
            style={{ color: 'var(--color-warm-beige)' }}
          >
            {icons.logout}
          </button>
        </div>
      </aside>
    </>
  );
}
