/**
 * BUILDORA — Shared UI Layout Injector & Component Controller
 * Injects responsive Sidebar & Navbar dynamically across all pages
 */

class UIComponents {
  constructor() {
    this.currentUser = window.auth ? window.auth.getCurrentUser() : null;
  }

  initSharedLayout(activePage = "dashboard") {
    this.injectSidebar(activePage);
    this.injectNavbar(activePage);
    this.injectToastContainer();
    this.bindGlobalEvents();
  }

  // Calculate relative base path (for /pages/ vs root)
  getBasePath() {
    const path = window.location.pathname;
    return path.includes("/pages/") ? "../" : "./";
  }

  getPagesPath() {
    const path = window.location.pathname;
    return path.includes("/pages/") ? "" : "pages/";
  }

  injectSidebar(activePage) {
    const sidebarEl = document.getElementById("app-sidebar");
    if (!sidebarEl) return;

    const base = this.getBasePath();
    const pages = this.getPagesPath();
    const role = this.currentUser ? this.currentUser.role : "Project Manager";

    // Clean Line SVG icons
    const icons = {
      dashboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
      projects: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
      tasks: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      reports: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      issues: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y2="16"/></svg>`,
      materials: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
      inventory: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/></svg>`,
      vendors: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      requests: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
      approvals: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
      orders: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      deliveries: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><polygon points="22 17 22 11 17 11 17 17 22 17"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
      budget: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
      expenses: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
      invoices: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 18a3 3 0 1 0-6 0"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/></svg>`,
      documents: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`,
      client: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
      analytics: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
      notifications: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
      audit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
      settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`
    };

    sidebarEl.innerHTML = `
      <div class="sidebar-brand">
        <a href="${pages}dashboard.html" class="brand-link">
          <div class="brand-icon">B</div>
          <div class="brand-text">
            <span class="brand-name">BUILDORA</span>
            <span class="brand-tagline">Construction Operations</span>
          </div>
        </a>
      </div>

      <div class="sidebar-nav-container">
        <!-- CORE -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">Core</span>
          <a href="${pages}dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
            ${icons.dashboard}
            <span>Dashboard</span>
          </a>
          <a href="${pages}projects.html" class="nav-link ${activePage === 'projects' || activePage === 'project-details' ? 'active' : ''}">
            ${icons.projects}
            <span>Projects</span>
          </a>
          <a href="${pages}tasks.html" class="nav-link ${activePage === 'tasks' ? 'active' : ''}">
            ${icons.tasks}
            <span>Tasks & Milestones</span>
          </a>
        </div>

        <!-- SITE OPERATIONS -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">Site Operations</span>
          <a href="${pages}site-reports.html" class="nav-link ${activePage === 'site-reports' ? 'active' : ''}">
            ${icons.reports}
            <span>Site Reports</span>
          </a>
          <a href="${pages}issues.html" class="nav-link ${activePage === 'issues' ? 'active' : ''}">
            ${icons.issues}
            <span>Issues</span>
          </a>
        </div>

        <!-- RESOURCES -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">Resources</span>
          <a href="${pages}materials.html" class="nav-link ${activePage === 'materials' ? 'active' : ''}">
            ${icons.materials}
            <span>Materials</span>
          </a>
          <a href="${pages}inventory.html" class="nav-link ${activePage === 'inventory' ? 'active' : ''}">
            ${icons.inventory}
            <span>Inventory</span>
          </a>
          <a href="${pages}vendors.html" class="nav-link ${activePage === 'vendors' ? 'active' : ''}">
            ${icons.vendors}
            <span>Vendors</span>
          </a>
        </div>

        <!-- PROCUREMENT -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">Procurement</span>
          <a href="${pages}purchase-requests.html" class="nav-link ${activePage === 'purchase-requests' ? 'active' : ''}">
            ${icons.requests}
            <span>Purchase Requests</span>
          </a>
          <a href="${pages}approvals.html" class="nav-link ${activePage === 'approvals' ? 'active' : ''}">
            ${icons.approvals}
            <span>Approvals</span>
            <span class="nav-badge">18</span>
          </a>
          <a href="${pages}purchase-orders.html" class="nav-link ${activePage === 'purchase-orders' ? 'active' : ''}">
            ${icons.orders}
            <span>Purchase Orders</span>
          </a>
          <a href="${pages}deliveries.html" class="nav-link ${activePage === 'deliveries' ? 'active' : ''}">
            ${icons.deliveries}
            <span>Deliveries</span>
          </a>
        </div>

        <!-- FINANCE -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">Finance</span>
          <a href="${pages}budget.html" class="nav-link ${activePage === 'budget' ? 'active' : ''}">
            ${icons.budget}
            <span>Budget</span>
          </a>
          <a href="${pages}expenses.html" class="nav-link ${activePage === 'expenses' ? 'active' : ''}">
            ${icons.expenses}
            <span>Expenses</span>
          </a>
          <a href="${pages}invoices.html" class="nav-link ${activePage === 'invoices' ? 'active' : ''}">
            ${icons.invoices}
            <span>Invoices</span>
          </a>
        </div>

        <!-- DOCUMENTS -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">Documents</span>
          <a href="${pages}documents.html" class="nav-link ${activePage === 'documents' ? 'active' : ''}">
            ${icons.documents}
            <span>Documents</span>
          </a>
        </div>

        <!-- CLIENT -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">Client</span>
          <a href="${pages}client-portal.html" class="nav-link ${activePage === 'client-portal' ? 'active' : ''}">
            ${icons.client}
            <span>Client Portal</span>
          </a>
        </div>

        <!-- REPORTING -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">Reporting</span>
          <a href="${pages}analytics.html" class="nav-link ${activePage === 'analytics' ? 'active' : ''}">
            ${icons.analytics}
            <span>Analytics</span>
          </a>
          <a href="${pages}notifications.html" class="nav-link ${activePage === 'notifications' ? 'active' : ''}">
            ${icons.notifications}
            <span>Notifications</span>
          </a>
          <a href="${pages}audit-logs.html" class="nav-link ${activePage === 'audit-logs' ? 'active' : ''}">
            ${icons.audit}
            <span>Audit Logs</span>
          </a>
        </div>

        <!-- SYSTEM -->
        <div class="sidebar-group">
          <span class="sidebar-group-label">System</span>
          <a href="${pages}settings.html" class="nav-link ${activePage === 'settings' ? 'active' : ''}">
            ${icons.settings}
            <span>Settings</span>
          </a>
        </div>
      </div>

      <!-- Footer & Live Persona Switcher -->
      <div class="sidebar-footer">
        <div class="role-switcher-box">
          <span class="role-switcher-label">Switch Persona (Demo)</span>
          <select id="sidebar-role-selector" class="role-select" onchange="window.auth.switchRole(this.value)">
            <option value="Project Manager" ${role === 'Project Manager' ? 'selected' : ''}>Project Manager</option>
            <option value="Admin" ${role === 'Admin' ? 'selected' : ''}>Admin</option>
            <option value="Site Supervisor" ${role === 'Site Supervisor' ? 'selected' : ''}>Site Supervisor</option>
            <option value="Procurement Manager" ${role === 'Procurement Manager' ? 'selected' : ''}>Procurement Manager</option>
            <option value="Finance" ${role === 'Finance' ? 'selected' : ''}>Finance</option>
            <option value="Client" ${role === 'Client' ? 'selected' : ''}>Client</option>
          </select>
        </div>

        <div class="user-mini-profile">
          <div class="user-avatar-sm">${this.currentUser ? this.currentUser.avatar : 'KP'}</div>
          <div class="user-details">
            <div class="user-name">${this.currentUser ? this.currentUser.name : 'Kashish Patel'}</div>
            <div class="user-role-badge">${role}</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="window.auth.logout()" title="Sign Out" style="color: var(--color-warm-beige); padding: 4px;">
            ${icons.logout}
          </button>
        </div>
      </div>
    `;
  }

  injectNavbar(activePage) {
    const navbarEl = document.getElementById("app-navbar");
    if (!navbarEl) return;

    const pageTitles = {
      dashboard: "Project Operations Dashboard",
      projects: "Projects",
      "project-details": "Project Workspace",
      tasks: "Tasks & Milestones",
      "site-reports": "Site Reports",
      issues: "Site Issues & Safety",
      materials: "Materials & Stock",
      inventory: "Site Inventory Movements",
      vendors: "Vendors & Suppliers",
      "purchase-requests": "Purchase Requests",
      approvals: "Pending Approvals",
      "purchase-orders": "Purchase Orders",
      deliveries: "Material Deliveries",
      budget: "Project Budgets",
      expenses: "Project Expenses",
      invoices: "Invoices",
      documents: "Technical Documents & Drawings",
      "client-portal": "Client Progress Portal",
      analytics: "Operational Analytics",
      notifications: "Notifications",
      "audit-logs": "Audit Logs",
      settings: "Settings"
    };

    const currentTitle = pageTitles[activePage] || "Operations";
    const user = this.currentUser || { name: "Kashish Patel", role: "Project Manager", avatar: "KP", email: "kashish@buildora.com" };

    navbarEl.innerHTML = `
      <div class="navbar-left">
        <button id="mobile-sidebar-toggle" class="mobile-toggle-btn" aria-label="Toggle Navigation">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>

        <div class="page-header-info">
          <div class="breadcrumbs">
            <span class="breadcrumb-item">Operations</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">${activePage.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</span>
          </div>
          <h1 class="page-title">${currentTitle}</h1>
        </div>
      </div>

      <div class="navbar-right">
        <!-- Search -->
        <div class="search-box">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" class="search-input" placeholder="Search projects, POs, sites..." id="global-search-input">
          <span class="search-shortcut">⌘K</span>
        </div>

        <!-- Notification Trigger -->
        <div class="nav-actions">
          <button class="icon-action-btn" id="notif-btn" title="Notifications" onclick="window.ui.showToast('5 urgent approvals require your review', 'warning')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="icon-badge">5</span>
          </button>
        </div>

        <!-- User Profile Dropdown -->
        <div class="user-menu-wrapper">
          <button class="user-menu-btn" id="user-menu-toggle">
            <div class="user-avatar-sm" style="background: var(--color-primary-brown);">${user.avatar}</div>
            <div class="user-details" style="text-align: left;">
              <div class="user-name" style="color: var(--color-text-dark);">${user.name}</div>
              <div class="user-role-badge" style="color: var(--color-text-muted); font-size: 0.72rem;">${user.role}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          <div class="profile-dropdown" id="profile-dropdown-menu">
            <div class="dropdown-header">
              <div class="dropdown-header-name">${user.name}</div>
              <div class="dropdown-header-email">${user.email}</div>
            </div>
            <a href="${this.getPagesPath()}settings.html" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/></svg>
              My Profile
            </a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" onclick="window.auth.logout()" style="width: 100%; border: none; background: none; text-align: left; cursor: pointer;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    `;

    // Dropdown toggle logic
    const toggleBtn = document.getElementById("user-menu-toggle");
    const dropdownMenu = document.getElementById("profile-dropdown-menu");
    if (toggleBtn && dropdownMenu) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle("show");
      });
      document.addEventListener("click", () => {
        dropdownMenu.classList.remove("show");
      });
    }

    // Mobile sidebar toggle
    const mobBtn = document.getElementById("mobile-sidebar-toggle");
    const sidebar = document.getElementById("app-sidebar");
    if (mobBtn && sidebar) {
      let overlay = document.querySelector(".sidebar-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
        overlay.addEventListener("click", () => {
          sidebar.classList.remove("mobile-open");
          overlay.classList.remove("active");
        });
      }

      mobBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
        overlay.classList.toggle("active");
      });
    }
  }

  injectToastContainer() {
    if (!document.getElementById("toast-container")) {
      const container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
  }

  showToast(message, type = "success", duration = 3500) {
    const container = document.getElementById("toast-container") || document.body;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
      warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      danger: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    toast.innerHTML = `
      ${iconMap[type] || iconMap.info}
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  bindGlobalEvents() {
    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        if (searchInput) searchInput.focus();
      }
    });
  }
}

window.ui = new UIComponents();
