import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar({ onToggleSidebar, onOpenCreateProject, onOpenQuickReport, onOpenQuickPO }) {
  const { currentUser, roles, switchRole, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);
    showToast(`Switched active workspace persona to ${newRole}`, 'info');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header id="app-navbar" className="app-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>

        <form onSubmit={handleSearch} className="navbar-search-box">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search projects, site logs, purchase orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        {/* Role Persona Switcher Pill */}
        <div className="role-switcher-wrapper">
          <span className="role-switcher-label">Persona:</span>
          <select
            className="role-switcher-select"
            value={currentUser?.role || 'Project Manager'}
            onChange={handleRoleChange}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Icon Button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="nav-icon-btn"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span className="notification-dot" />
          </button>

          {showNotifications && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '320px',
                zIndex: 200,
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div className="card-header" style={{ padding: '0.75rem 1rem' }}>
                <div className="card-title" style={{ fontSize: '0.9rem' }}>Site Alerts & Approvals</div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                  onClick={() => setShowNotifications(false)}
                >
                  ✕
                </button>
              </div>
              <div className="card-body" style={{ padding: '0.5rem 1rem', maxHeight: '260px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ fontSize: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <div className="font-semibold text-dark">5 Urgent Purchase Requests</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Rebar & Cement POs awaiting sign-off</div>
                  </div>
                  <div style={{ fontSize: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <div className="font-semibold text-dark">Slab Casting Completed</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>Skyline Heights 18th Floor report submitted</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Menu */}
        <div style={{ position: 'relative' }}>
          <div
            className="nav-user-pill"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav-avatar">{currentUser?.avatar || 'KP'}</div>
            <div className="nav-user-text">
              <span className="nav-user-name">{currentUser?.name || 'Kashish Patel'}</span>
              <span className="nav-user-role">{currentUser?.role || 'Project Manager'}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {showUserMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: '52px',
                right: '0',
                width: '200px',
                zIndex: 200,
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
                padding: '0.5rem'
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div className="font-semibold text-dark" style={{ fontSize: '0.85rem' }}>{currentUser?.name}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{currentUser?.email}</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', marginTop: '0.25rem', color: 'var(--color-danger)' }}
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
