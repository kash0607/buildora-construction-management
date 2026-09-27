import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Globe,
  LayoutDashboard,
  Folder,
  SquareCheck,
  FileText,
  CircleAlert,
  Package,
  Boxes,
  CircleCheck,
  ChevronRight,
  ChevronDown,
  Menu,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BuildoraLogo from '../common/BuildoraLogo';

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
  const { currentUser, switchRole, logout } = useAuth();
  const role = currentUser ? currentUser.role : 'Project Manager';
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const roles = [
    'Project Manager',
    'Site Engineer',
    'Procurement Officer',
    'Client / Executive'
  ];

  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop active" onClick={onClose} />
      )}
      <aside id="app-sidebar" className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'show-mobile mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <Link to="/" className="brand-link" onClick={onClose} title="BUILDORA — Construction Operations">
            <div className="brand-icon">
              <BuildoraLogo size={24} color="#B98958" />
            </div>
            <div className="brand-text">
              <span className="brand-name">BUILDORA</span>
              <span className="brand-tagline">CONSTRUCTION OPERATIONS</span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="sidebar-nav-container">
          {/* NAVIGATION */}
          <div className="sidebar-group">
            <span className="sidebar-group-label">Navigation</span>
            <Link
              to="/"
              className="nav-link"
              onClick={onClose}
              title="Landing Page"
            >
              <span className="nav-icon">
                <Globe size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Landing Page</span>
            </Link>
          </div>

          {/* CORE WORKSPACE */}
          <div className="sidebar-group">
            <span className="sidebar-group-label">Core Workspace</span>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Dashboard"
            >
              <span className="nav-icon">
                <LayoutDashboard size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Dashboard</span>
              <ChevronRight size={16} strokeWidth={1.6} className="nav-chevron" />
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Projects"
            >
              <span className="nav-icon">
                <Folder size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Projects</span>
              <ChevronRight size={16} strokeWidth={1.6} className="nav-chevron" />
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Tasks & Milestones"
            >
              <span className="nav-icon">
                <SquareCheck size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Tasks & Milestones</span>
              <ChevronRight size={16} strokeWidth={1.6} className="nav-chevron" />
            </NavLink>
          </div>

          {/* SITE OPERATIONS */}
          <div className="sidebar-group">
            <span className="sidebar-group-label">Site Operations</span>
            <NavLink
              to="/site-reports"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Site Reports"
            >
              <span className="nav-icon">
                <FileText size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Site Reports</span>
              <ChevronRight size={16} strokeWidth={1.6} className="nav-chevron" />
            </NavLink>
            <NavLink
              to="/issues"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Issues & Quality"
            >
              <span className="nav-icon">
                <CircleAlert size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Issues & Quality</span>
              <ChevronRight size={16} strokeWidth={1.6} className="nav-chevron" />
            </NavLink>
          </div>

          {/* COMMERCIAL & SUPPLY */}
          <div className="sidebar-group">
            <span className="sidebar-group-label">Commercial & Supply</span>
            <NavLink
              to="/materials"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Materials"
            >
              <span className="nav-icon">
                <Package size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Materials</span>
              <ChevronRight size={16} strokeWidth={1.6} className="nav-chevron" />
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Inventory & Stock"
            >
              <span className="nav-icon">
                <Boxes size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Inventory & Stock</span>
              <ChevronRight size={16} strokeWidth={1.6} className="nav-chevron" />
            </NavLink>
            <NavLink
              to="/approvals"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title="Approvals Queue"
            >
              <span className="nav-icon">
                <CircleCheck size={18} strokeWidth={1.6} />
              </span>
              <span className="nav-text">Approvals Queue</span>
              <span className="nav-counter">3</span>
              <ChevronRight size={16} strokeWidth={1.6} className="nav-chevron" />
            </NavLink>
          </div>
        </div>

        {/* USER PROFILE AREA */}
        <div className="sidebar-footer" ref={userMenuRef}>
          <div
            className={`sidebar-user-card ${userMenuOpen ? 'menu-open' : ''}`}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            role="button"
            tabIndex={0}
            aria-expanded={userMenuOpen}
            aria-label="User Profile and Role Switcher"
          >
            <div className="user-avatar">{currentUser?.avatar || 'KP'}</div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name || 'Kashish Patel'}</span>
              <span className="user-role-badge">{role}</span>
            </div>
            <ChevronDown
              size={16}
              strokeWidth={1.75}
              className={`user-chevron ${userMenuOpen ? 'rotated' : ''}`}
            />
          </div>

          {/* User Role Switcher & Logout Dropdown */}
          {userMenuOpen && (
            <div className="user-profile-dropdown">
              <div className="dropdown-section-title">Switch Persona</div>
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`dropdown-role-btn ${role === r ? 'active' : ''}`}
                  onClick={() => {
                    switchRole(r);
                    setUserMenuOpen(false);
                  }}
                >
                  <UserCheck size={14} />
                  <span>{r}</span>
                  {role === r && <span className="active-dot" />}
                </button>
              ))}
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-logout-btn"
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
