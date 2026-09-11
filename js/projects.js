/**
 * BUILDORA — Projects Module Controller
 * Handles Project listing, Cards/Table toggle, Live Search, Multi-Filter, Create, Edit, and Archive
 */

class ProjectsController {
  constructor() {
    this.currentView = "card"; // "card" or "table"
    this.projects = [];
    this.filteredProjects = [];
    this.currentEditProjectId = null;
    this.currentArchiveProjectId = null;
  }

  async init() {
    await this.loadProjects();
    this.populateFilterDropdowns();
    this.bindEvents();
  }

  async loadProjects() {
    const searchVal = document.getElementById("project-search-input") ? document.getElementById("project-search-input").value : "";
    const statusVal = document.getElementById("filter-status") ? document.getElementById("filter-status").value : "All";
    const managerVal = document.getElementById("filter-manager") ? document.getElementById("filter-manager").value : "All";
    const locationVal = document.getElementById("filter-location") ? document.getElementById("filter-location").value : "All";

    const res = await window.api.getProjects({
      search: searchVal,
      status: statusVal,
      manager: managerVal,
      location: locationVal
    });

    if (res.success) {
      this.projects = res.data;
      this.filteredProjects = res.data;
      this.render();
    }
  }

  populateFilterDropdowns() {
    const managerSelect = document.getElementById("filter-manager");
    const locationSelect = document.getElementById("filter-location");

    if (managerSelect && locationSelect) {
      const allRes = window.BUILDORA_MOCK_DATA.projects || [];
      const managers = [...new Set(allRes.map(p => p.manager))];
      const locations = [...new Set(allRes.map(p => p.location.split(",")[1] ? p.location.split(",")[1].trim() : p.location.trim()))];

      managers.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.innerText = m;
        managerSelect.appendChild(opt);
      });

      locations.forEach(l => {
        const opt = document.createElement("option");
        opt.value = l;
        opt.innerText = l;
        locationSelect.appendChild(opt);
      });
    }
  }

  render() {
    const container = document.getElementById("projects-display-container");
    if (!container) return;

    if (this.filteredProjects.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="background: var(--color-white); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
          <div class="empty-state-title">No Projects Found</div>
          <div class="empty-state-desc">No construction projects match your search or filter criteria. Try adjusting your query or create a new project.</div>
          <div class="flex gap-3">
            <button class="btn btn-outline btn-sm" onclick="window.projectsModule.resetFilters()">Reset Filters</button>
            <button class="btn btn-primary btn-sm" onclick="window.projectsModule.openCreateModal()">+ Create Project</button>
          </div>
        </div>
      `;
      return;
    }

    if (this.currentView === "card") {
      this.renderCardView(container);
    } else {
      this.renderTableView(container);
    }
  }

  renderCardView(container) {
    const cardsHtml = this.filteredProjects.map(p => {
      const statusBadgeClass = {
        Active: "badge-success",
        Planning: "badge-neutral",
        Delayed: "badge-danger",
        "On Hold": "badge-warning",
        Completed: "badge-info"
      }[p.status] || "badge-neutral";

      const budgetCr = "₹" + (p.budget / 10000000).toFixed(1) + " Cr";

      return `
        <div class="project-card">
          <div class="project-card-image-wrap">
            <img src="${p.image}" alt="${p.name}" class="project-card-image" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80';">
            <div class="project-card-status-overlay">
              <span class="badge ${statusBadgeClass}">${p.status}</span>
            </div>
          </div>
          <div class="project-card-body">
            <div class="project-card-title-group">
              <h3 class="project-card-title">${p.name}</h3>
              <div class="project-card-client-loc">
                <span>🏢 ${p.client}</span> • <span>📍 ${p.location}</span>
              </div>
            </div>

            <div class="project-card-pm">
              <div class="user-avatar-sm" style="width: 26px; height: 26px; font-size: 0.72rem; background: var(--color-secondary-brown);">${p.manager.split(" ").map(n => n[0]).join("")}</div>
              <span><strong>Manager:</strong> ${p.manager}</span>
            </div>

            <div class="progress-container">
              <div class="progress-header">
                <span>Progress</span>
                <span class="font-bold text-dark">${p.progress}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${p.progress >= 70 ? 'success' : ''}" style="width: ${p.progress}%"></div>
              </div>
            </div>

            <div class="project-card-stats-row">
              <div class="project-card-stat-item">
                <span class="project-card-stat-label">Budget</span>
                <span class="project-card-stat-value">${budgetCr}</span>
              </div>
              <div class="project-card-stat-item">
                <span class="project-card-stat-label">Deadline</span>
                <span class="project-card-stat-value" style="font-size: 0.95rem;">${p.deadline}</span>
              </div>
            </div>
          </div>

          <div class="project-card-footer">
            <div class="flex items-center gap-1">
              <button class="btn btn-ghost btn-sm" onclick="window.projectsModule.openEditModal('${p.id}')" title="Edit Project">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Edit
              </button>
              <button class="btn btn-ghost btn-sm" style="color: var(--color-danger);" onclick="window.projectsModule.openArchiveModal('${p.id}')" title="Archive Project">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" x2="14" y1="12" y2="12"/></svg>
                Archive
              </button>
            </div>
            <a href="project-details.html?id=${p.id}" class="btn btn-primary btn-sm">
              View Project
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `<div class="projects-card-grid">${cardsHtml}</div>`;
  }

  renderTableView(container) {
    const rowsHtml = this.filteredProjects.map(p => {
      const statusBadgeClass = {
        Active: "badge-success",
        Planning: "badge-neutral",
        Delayed: "badge-danger",
        "On Hold": "badge-warning",
        Completed: "badge-info"
      }[p.status] || "badge-neutral";

      const budgetCr = "₹" + (p.budget / 10000000).toFixed(1) + " Cr";

      return `
        <tr>
          <td>
            <div class="flex items-center gap-3">
              <div style="width: 38px; height: 38px; border-radius: 6px; overflow: hidden; background: #eee; flex-shrink: 0;">
                <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80';">
              </div>
              <div>
                <a href="project-details.html?id=${p.id}" class="project-cell-name font-bold">${p.name}</a>
                <span class="project-cell-sub">ID: ${p.id}</span>
              </div>
            </div>
          </td>
          <td>${p.client}</td>
          <td>${p.location}</td>
          <td>${p.manager}</td>
          <td style="min-width: 120px;">
            <div class="progress-container">
              <div class="progress-header">
                <span>Progress</span>
                <span class="font-semibold text-dark">${p.progress}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${p.progress >= 70 ? 'success' : ''}" style="width: ${p.progress}%"></div>
              </div>
            </div>
          </td>
          <td class="font-semibold text-dark">${budgetCr}</td>
          <td>${p.deadline}</td>
          <td><span class="badge ${statusBadgeClass}">${p.status}</span></td>
          <td style="text-align: right; white-space: nowrap;">
            <div class="flex items-center justify-end gap-2">
              <a href="project-details.html?id=${p.id}" class="btn btn-outline btn-sm" title="View Workspace">View</a>
              <button class="btn btn-ghost btn-sm" onclick="window.projectsModule.openEditModal('${p.id}')" title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Edit
              </button>
              <button class="btn btn-ghost btn-sm" style="color: var(--color-danger);" onclick="window.projectsModule.openArchiveModal('${p.id}')" title="Archive">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" x2="14" y1="12" y2="12"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    container.innerHTML = `
      <div class="table-wrapper">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Location</th>
              <th>Manager</th>
              <th>Progress</th>
              <th>Budget</th>
              <th>Deadline</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("project-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => this.loadProjects());
    }

    // Filter selects
    ["filter-status", "filter-manager", "filter-location"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", () => this.loadProjects());
    });

    // View toggle buttons
    const cardBtn = document.getElementById("view-card-btn");
    const tableBtn = document.getElementById("view-table-btn");

    if (cardBtn && tableBtn) {
      cardBtn.addEventListener("click", () => {
        this.currentView = "card";
        cardBtn.classList.add("active");
        tableBtn.classList.remove("active");
        this.render();
      });

      tableBtn.addEventListener("click", () => {
        this.currentView = "table";
        tableBtn.classList.add("active");
        cardBtn.classList.remove("active");
        this.render();
      });
    }

    // Create Project Form
    const createForm = document.getElementById("modal-create-project-form");
    if (createForm) {
      createForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("cp-name").value.trim();
        const client = document.getElementById("cp-client").value.trim();
        const location = document.getElementById("cp-location").value.trim();
        const manager = document.getElementById("cp-manager").value;
        const budget = parseFloat(document.getElementById("cp-budget").value) * 10000000;
        const startDate = document.getElementById("cp-start-date").value;
        const deadline = document.getElementById("cp-end-date").value;
        const status = document.getElementById("cp-status").value;
        const description = document.getElementById("cp-desc").value;

        if (!name || !client || !location || isNaN(budget) || !deadline) {
          window.ui.showToast("Please fill in all required fields.", "warning");
          return;
        }

        const res = await window.api.createProject({
          name,
          client,
          location,
          manager,
          budget,
          startDate,
          deadline,
          status,
          description
        });

        if (res.success) {
          window.ui.showToast(res.message, "success");
          this.closeModal("create-project-modal");
          createForm.reset();
          await this.loadProjects();
        }
      });
    }

    // Edit Project Form
    const editForm = document.getElementById("modal-edit-project-form");
    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!this.currentEditProjectId) return;

        const name = document.getElementById("ep-name").value.trim();
        const client = document.getElementById("ep-client").value.trim();
        const location = document.getElementById("ep-location").value.trim();
        const manager = document.getElementById("ep-manager").value;
        const budget = parseFloat(document.getElementById("ep-budget").value) * 10000000;
        const progress = parseInt(document.getElementById("ep-progress").value, 10);
        const startDate = document.getElementById("ep-start-date").value;
        const deadline = document.getElementById("ep-end-date").value;
        const status = document.getElementById("ep-status").value;
        const description = document.getElementById("ep-desc").value;

        const res = await window.api.updateProject(this.currentEditProjectId, {
          name,
          client,
          location,
          manager,
          budget,
          progress,
          startDate,
          deadline,
          status,
          description
        });

        if (res.success) {
          window.ui.showToast(res.message, "success");
          this.closeModal("edit-project-modal");
          await this.loadProjects();
        }
      });
    }

    // Confirm Archive Action
    const confirmArchiveBtn = document.getElementById("confirm-archive-btn");
    if (confirmArchiveBtn) {
      confirmArchiveBtn.addEventListener("click", async () => {
        if (!this.currentArchiveProjectId) return;
        const res = await window.api.archiveProject(this.currentArchiveProjectId);
        if (res.success) {
          window.ui.showToast(res.message, "success");
          this.closeModal("archive-confirm-modal");
          this.currentArchiveProjectId = null;
          await this.loadProjects();
        }
      });
    }
  }

  resetFilters() {
    if (document.getElementById("project-search-input")) document.getElementById("project-search-input").value = "";
    if (document.getElementById("filter-status")) document.getElementById("filter-status").value = "All";
    if (document.getElementById("filter-manager")) document.getElementById("filter-manager").value = "All";
    if (document.getElementById("filter-location")) document.getElementById("filter-location").value = "All";
    this.loadProjects();
  }

  openCreateModal() {
    this.openModal("create-project-modal");
  }

  async openEditModal(projectId) {
    const res = await window.api.getProject(projectId);
    if (!res.success) return;
    const p = res.data;

    this.currentEditProjectId = p.id;
    document.getElementById("ep-name").value = p.name;
    document.getElementById("ep-client").value = p.client;
    document.getElementById("ep-location").value = p.location;
    document.getElementById("ep-manager").value = p.manager;
    document.getElementById("ep-budget").value = (p.budget / 10000000).toFixed(1);
    document.getElementById("ep-progress").value = p.progress;
    document.getElementById("ep-start-date").value = p.startDate || "2025-01-01";
    document.getElementById("ep-end-date").value = p.deadline;
    document.getElementById("ep-status").value = p.status;
    document.getElementById("ep-desc").value = p.description || "";

    this.openModal("edit-project-modal");
  }

  async openArchiveModal(projectId) {
    const res = await window.api.getProject(projectId);
    if (!res.success) return;
    const p = res.data;

    this.currentArchiveProjectId = p.id;
    const nameEl = document.getElementById("archive-project-name");
    if (nameEl) nameEl.innerText = p.name;

    this.openModal("archive-confirm-modal");
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }
}

window.projectsModule = new ProjectsController();
