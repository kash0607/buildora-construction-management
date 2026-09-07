/**
 * BUILDORA — Tasks & Milestones Controller
 * Handles List view, Kanban drag-and-drop, Gantt timeline, Milestones, and CRUD workflows
 */

class TasksController {
  constructor() {
    this.currentView = "list"; // list, kanban, timeline
    this.filters = {
      search: "",
      projectId: "All",
      status: "All",
      priority: "All",
      assignee: "All",
      dueDateFilter: "All"
    };
    this.projects = [];
    this.assignees = [];
    this.tasks = [];
    this.milestones = [];
    this.itemToArchive = null; // { type: 'task' | 'milestone', id, name }
  }

  async init() {
    // Check URL query params for initial filters (e.g., from Project Details page)
    const urlParams = new URLSearchParams(window.location.search);
    const projParam = urlParams.get("project") || urlParams.get("projectId");
    if (projParam) {
      this.filters.projectId = projParam;
    }
    const statusParam = urlParams.get("status");
    if (statusParam) {
      this.filters.status = statusParam;
    }
    const viewParam = urlParams.get("view");
    if (viewParam && ["list", "kanban", "timeline"].includes(viewParam)) {
      this.currentView = viewParam;
    }

    // Load projects and assignees for filters and dropdowns
    await this.loadInitialMetadata();

    // Populate filter controls
    this.populateFilterDropdowns();

    // Bind event listeners
    this.bindEvents();

    // Set active view button
    this.updateViewButtons();

    // Render page components
    await this.refreshAll();
  }

  async loadInitialMetadata() {
    const projRes = await window.api.getProjects({ includeArchived: false });
    if (projRes.success) {
      this.projects = projRes.data;
    }

    // Extract unique assignees from project teams and tasks
    const assigneesSet = new Set();
    this.projects.forEach(p => {
      if (p.manager) assigneesSet.add(p.manager);
      if (p.team && Array.isArray(p.team)) {
        p.team.forEach(t => { if (t.name) assigneesSet.add(t.name); });
      }
    });

    const tasksRes = await window.api.getTasks({ includeArchived: true });
    if (tasksRes.success) {
      tasksRes.data.forEach(t => {
        if (t.assignee && t.assignee !== "Unassigned") assigneesSet.add(t.assignee);
      });
    }

    this.assignees = Array.from(assigneesSet).sort();
  }

  populateFilterDropdowns() {
    // Project filter
    const projSelect = document.getElementById("filter-task-project");
    if (projSelect) {
      projSelect.innerHTML = `<option value="All">All Projects</option>` +
        this.projects.map(p => `<option value="${p.id}" ${this.filters.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join("");
    }

    // Assignee filter
    const assigneeSelect = document.getElementById("filter-task-assignee");
    if (assigneeSelect) {
      assigneeSelect.innerHTML = `<option value="All">All Assignees</option>` +
        this.assignees.map(a => `<option value="${a}">${a}</option>`).join("");
    }

    // Status filter
    const statusSelect = document.getElementById("filter-task-status");
    if (statusSelect && this.filters.status !== "All") {
      statusSelect.value = this.filters.status;
    }
  }

  bindEvents() {
    // Search input with instant filtering
    const searchInput = document.getElementById("task-search-input");
    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          this.filters.search = e.target.value.trim();
          this.refreshTasksAndView();
        }, 150);
      });
    }

    // Filter changes
    const projFilter = document.getElementById("filter-task-project");
    if (projFilter) {
      projFilter.addEventListener("change", (e) => {
        this.filters.projectId = e.target.value;
        this.refreshAll();
      });
    }

    const statusFilter = document.getElementById("filter-task-status");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filters.status = e.target.value;
        this.refreshTasksAndView();
      });
    }

    const priorityFilter = document.getElementById("filter-task-priority");
    if (priorityFilter) {
      priorityFilter.addEventListener("change", (e) => {
        this.filters.priority = e.target.value;
        this.refreshTasksAndView();
      });
    }

    const assigneeFilter = document.getElementById("filter-task-assignee");
    if (assigneeFilter) {
      assigneeFilter.addEventListener("change", (e) => {
        this.filters.assignee = e.target.value;
        this.refreshTasksAndView();
      });
    }

    const dueFilter = document.getElementById("filter-task-duedate");
    if (dueFilter) {
      dueFilter.addEventListener("change", (e) => {
        this.filters.dueDateFilter = e.target.value;
        this.refreshTasksAndView();
      });
    }

    // Form submissions
    const createTaskForm = document.getElementById("modal-create-task-form");
    if (createTaskForm) {
      createTaskForm.addEventListener("submit", (e) => this.handleCreateTask(e));
    }

    const editTaskForm = document.getElementById("modal-edit-task-form");
    if (editTaskForm) {
      editTaskForm.addEventListener("submit", (e) => this.handleEditTask(e));
    }

    const createMilestoneForm = document.getElementById("modal-create-milestone-form");
    if (createMilestoneForm) {
      createMilestoneForm.addEventListener("submit", (e) => this.handleCreateMilestone(e));
    }

    const editMilestoneForm = document.getElementById("modal-edit-milestone-form");
    if (editMilestoneForm) {
      editMilestoneForm.addEventListener("submit", (e) => this.handleEditMilestone(e));
    }

    // Archive confirm button
    const confirmArchiveBtn = document.getElementById("confirm-archive-item-btn");
    if (confirmArchiveBtn) {
      confirmArchiveBtn.addEventListener("click", () => this.executeArchive());
    }

    // Due date vs start date instant validation on forms
    this.bindDateValidation("ct-start-date", "ct-due-date", "ct-date-error");
    this.bindDateValidation("et-start-date", "et-due-date", "et-date-error");
  }

  bindDateValidation(startId, dueId, errorId) {
    const startEl = document.getElementById(startId);
    const dueEl = document.getElementById(dueId);
    const errEl = document.getElementById(errorId);
    if (startEl && dueEl && errEl) {
      const validate = () => {
        if (startEl.value && dueEl.value && dueEl.value < startEl.value) {
          dueEl.classList.add("is-invalid");
          errEl.style.display = "block";
        } else {
          dueEl.classList.remove("is-invalid");
          errEl.style.display = "none";
        }
      };
      startEl.addEventListener("change", validate);
      dueEl.addEventListener("change", validate);
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    this.updateViewButtons();
    this.renderActiveView();
  }

  updateViewButtons() {
    ["list", "kanban", "timeline"].forEach(v => {
      const btn = document.getElementById(`view-${v}-btn`);
      if (btn) {
        if (v === this.currentView) btn.classList.add("active");
        else btn.classList.remove("active");
      }
    });
  }

  resetFilters() {
    this.filters = {
      search: "",
      projectId: "All",
      status: "All",
      priority: "All",
      assignee: "All",
      dueDateFilter: "All"
    };

    const sInput = document.getElementById("task-search-input");
    if (sInput) sInput.value = "";

    const pSelect = document.getElementById("filter-task-project");
    if (pSelect) pSelect.value = "All";

    const stSelect = document.getElementById("filter-task-status");
    if (stSelect) stSelect.value = "All";

    const prioSelect = document.getElementById("filter-task-priority");
    if (prioSelect) prioSelect.value = "All";

    const assSelect = document.getElementById("filter-task-assignee");
    if (assSelect) assSelect.value = "All";

    const dueSelect = document.getElementById("filter-task-duedate");
    if (dueSelect) dueSelect.value = "All";

    this.refreshAll();
  }

  async refreshAll() {
    await this.renderSummaryCards();
    await this.refreshTasksAndView();
    await this.renderMilestones();
  }

  async refreshTasksAndView() {
    const res = await window.api.getTasks(this.filters);
    if (res.success) {
      this.tasks = res.data;
      this.renderActiveView();
    }
  }

  async renderSummaryCards() {
    const container = document.getElementById("tasks-summary-container");
    if (!container) return;

    const res = await window.api.getTaskStats(this.filters.projectId);
    if (!res.success) return;

    const stats = res.data;

    container.innerHTML = `
      <!-- Total Tasks -->
      <div class="task-stat-card stat-total">
        <div class="task-stat-header">
          <span class="task-stat-label">Total Tasks</span>
          <div class="task-stat-icon icon-total">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
        </div>
        <div class="task-stat-value">${stats.total}</div>
        <div class="task-stat-desc">${this.filters.projectId === 'All' ? 'Across all sites' : 'In current project'}</div>
      </div>

      <!-- In Progress -->
      <div class="task-stat-card stat-inprogress">
        <div class="task-stat-header">
          <span class="task-stat-label">In Progress</span>
          <div class="task-stat-icon icon-inprogress">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <div class="task-stat-value text-primary">${stats.inProgress}</div>
        <div class="task-stat-desc">Active execution</div>
      </div>

      <!-- Completed -->
      <div class="task-stat-card stat-completed">
        <div class="task-stat-header">
          <span class="task-stat-label">Completed</span>
          <div class="task-stat-icon icon-completed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
        </div>
        <div class="task-stat-value" style="color: var(--color-success);">${stats.completed}</div>
        <div class="task-stat-desc">${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}% completion rate</div>
      </div>

      <!-- Overdue -->
      <div class="task-stat-card stat-overdue">
        <div class="task-stat-header">
          <span class="task-stat-label">Overdue</span>
          <div class="task-stat-icon icon-overdue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
        </div>
        <div class="task-stat-value" style="color: #BE123C;">${stats.overdue}</div>
        <div class="task-stat-desc">Requires immediate action</div>
      </div>

      <!-- Blocked -->
      <div class="task-stat-card stat-blocked">
        <div class="task-stat-header">
          <span class="task-stat-label">Blocked</span>
          <div class="task-stat-icon icon-blocked">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
        </div>
        <div class="task-stat-value" style="color: var(--color-danger);">${stats.blocked}</div>
        <div class="task-stat-desc">Bottlenecks & holds</div>
      </div>
    `;
  }

  renderActiveView() {
    const container = document.getElementById("tasks-display-container");
    if (!container) return;

    if (this.currentView === "list") {
      this.renderListView(container);
    } else if (this.currentView === "kanban") {
      this.renderKanbanView(container);
    } else if (this.currentView === "timeline") {
      this.renderTimelineView(container);
    }
  }

  // =========================================================================
  // VIEW 1: LIST VIEW TABLE
  // =========================================================================
  renderListView(container) {
    const todayStr = new Date().toISOString().split("T")[0];

    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div class="card">
          <div class="card-body">
            <div class="empty-state">
              <div class="empty-state-icon">📋</div>
              <div class="empty-state-title">No tasks found</div>
              <div class="empty-state-desc">Try clearing filters or create a new task for this construction project.</div>
              <button class="btn btn-primary btn-sm" onclick="window.tasksModule.openCreateTaskModal()">+ Create Task</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Build map for dependency names
    const taskMap = new Map();
    this.tasks.forEach(t => taskMap.set(t.id, t.title));

    const rowsHtml = this.tasks.map(t => {
      const isOverdue = t.status !== "Completed" && t.dueDate && t.dueDate < todayStr;
      const statusClass = isOverdue && t.status !== "Blocked" ? "overdue" : t.status.toLowerCase().replace(/\s+/g, '-');
      const statusLabel = isOverdue && t.status !== "Blocked" ? "Overdue" : t.status;
      const priorityClass = `priority-${t.priority.toLowerCase()}`;

      // Format dependencies
      let depHtml = `<span class="dependency-tag-empty">None</span>`;
      if (t.dependencies && t.dependencies.length > 0) {
        depHtml = t.dependencies.map(depId => {
          const depName = taskMap.get(depId) || depId;
          return `<span class="dependency-tag" title="Depends on: ${depName}">↳ ${depId}</span>`;
        }).join("");
      }

      // Assignee Initials
      const initials = t.assignee ? t.assignee.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "NA";

      return `
        <tr>
          <td>
            <div class="task-title-cell">
              <span class="task-title-link" onclick="window.tasksModule.openTaskDetailsModal('${t.id}')">
                ${t.title}
              </span>
              <span class="task-desc-preview">${t.description || 'No description'}</span>
            </div>
          </td>
          <td>
            <a href="project-details.html?id=${t.projectId}" class="task-project-pill" title="View Project Workspace">
              ${t.projectName || t.projectId}
            </a>
          </td>
          <td>
            <div class="task-assignee-box">
              <div class="task-assignee-avatar">${initials}</div>
              <span>${t.assignee}</span>
            </div>
          </td>
          <td>
            <span class="priority-badge ${priorityClass}">${t.priority}</span>
          </td>
          <td>
            <span class="status-pill ${statusClass}">${statusLabel}</span>
          </td>
          <td>
            <div class="task-progress-box">
              <div class="progress-track">
                <div class="progress-fill ${t.progress === 100 ? 'success' : (isOverdue ? 'danger' : '')}" style="width: ${t.progress}%"></div>
              </div>
              <span class="task-progress-num">${t.progress}%</span>
            </div>
          </td>
          <td class="text-muted" style="font-size: 0.82rem;">${t.startDate || '—'}</td>
          <td>
            <span class="due-date-text ${isOverdue ? 'is-overdue' : ''}">
              ${isOverdue ? '⚠️ ' : ''}${t.dueDate || '—'}
            </span>
          </td>
          <td>${depHtml}</td>
          <td>
            <div class="tasks-action-group">
              <button class="btn btn-ghost btn-sm" onclick="window.tasksModule.openTaskDetailsModal('${t.id}')" title="View Details">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="window.tasksModule.openEditTaskModal('${t.id}')" title="Edit Task">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              <button class="btn btn-ghost btn-sm text-muted" onclick="window.tasksModule.openArchiveTaskModal('${t.id}')" title="Archive Task" style="color: var(--color-danger);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    container.innerHTML = `
      <div class="tasks-table-card">
        <div class="table-wrapper">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Dependencies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // VIEW 2: KANBAN VIEW
  // =========================================================================
  renderKanbanView(container) {
    const columns = [
      { id: "Not Started", title: "Not Started", icon: "⚪" },
      { id: "In Progress", title: "In Progress", icon: "🔵" },
      { id: "Blocked", title: "Blocked", icon: "🔴" },
      { id: "Completed", title: "Completed", icon: "🟢" }
    ];

    const todayStr = new Date().toISOString().split("T")[0];

    const columnsHtml = columns.map(col => {
      const colTasks = this.tasks.filter(t => {
        if (col.id === "Completed") return t.status === "Completed" || t.progress === 100;
        return t.status === col.id;
      });

      const cardsHtml = colTasks.length > 0 ? colTasks.map(t => {
        const isOverdue = t.status !== "Completed" && t.dueDate && t.dueDate < todayStr;
        const priorityClass = `priority-${t.priority.toLowerCase()}`;
        const initials = t.assignee ? t.assignee.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "NA";

        return `
          <div class="kanban-card" draggable="true" ondragstart="window.tasksModule.handleDragStart(event, '${t.id}')" data-task-id="${t.id}">
            <div class="kanban-card-top">
              <span class="task-project-pill" style="font-size: 0.72rem;">${t.projectName || t.projectId}</span>
              <span class="priority-badge ${priorityClass}">${t.priority}</span>
            </div>
            <div class="kanban-card-title" onclick="window.tasksModule.openTaskDetailsModal('${t.id}')">
              ${t.title}
            </div>
            ${t.description ? `<div class="kanban-card-desc">${t.description}</div>` : ''}

            <div class="progress-container" style="margin-bottom: 0.6rem;">
              <div class="progress-track">
                <div class="progress-fill ${t.progress === 100 ? 'success' : (isOverdue ? 'danger' : '')}" style="width: ${t.progress}%"></div>
              </div>
            </div>

            <div class="kanban-card-meta">
              <div class="task-assignee-box">
                <div class="task-assignee-avatar">${initials}</div>
                <span>${t.assignee}</span>
              </div>
              <span class="due-date-text ${isOverdue ? 'is-overdue' : ''}" style="font-size: 0.76rem;">
                ${isOverdue ? '⚠️ ' : '📅 '}${t.dueDate || '—'}
              </span>
            </div>

            <!-- Quick move for mobile/keyboard -->
            <div class="kanban-card-quickmove">
              <select class="tasks-filter-select" style="font-size: 0.72rem; padding: 0.2rem 1.4rem 0.2rem 0.5rem; height: 26px;" onchange="window.tasksModule.moveTaskStatus('${t.id}', this.value)">
                <option value="" disabled selected>Move to...</option>
                ${columns.filter(c => c.id !== t.status).map(c => `<option value="${c.id}">${c.title}</option>`).join("")}
              </select>
            </div>
          </div>
        `;
      }).join("") : `<div class="kanban-empty-dropzone">No tasks in this column</div>`;

      return `
        <div class="kanban-column" ondragover="window.tasksModule.handleDragOver(event)" ondrop="window.tasksModule.handleDrop(event, '${col.id}')">
          <div class="kanban-column-header">
            <span class="kanban-column-title">
              <span>${col.icon}</span> ${col.title}
            </span>
            <span class="kanban-count-badge">${colTasks.length}</span>
          </div>
          <div class="kanban-cards-container">
            ${cardsHtml}
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="kanban-board">
        ${columnsHtml}
      </div>
    `;
  }

  handleDragStart(e, taskId) {
    e.dataTransfer.setData("text/plain", taskId);
    e.currentTarget.classList.add("dragging");
    setTimeout(() => {
      if (e.target) e.target.classList.remove("dragging");
    }, 500);
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async handleDrop(e, newStatus) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      await this.moveTaskStatus(taskId, newStatus);
    }
  }

  async moveTaskStatus(taskId, newStatus) {
    const updatedFields = { status: newStatus };
    if (newStatus === "Completed") {
      updatedFields.progress = 100;
    }
    const res = await window.api.updateTask(taskId, updatedFields);
    if (res.success) {
      window.ui.showToast(`Task moved to ${newStatus}`, "success");
      await this.refreshAll();
    }
  }

  // =========================================================================
  // VIEW 3: GANTT-STYLE HORIZONTAL TIMELINE VIEW
  // =========================================================================
  renderTimelineView(container) {
    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div class="card">
          <div class="card-body">
            <div class="empty-state">
              <div class="empty-state-icon">📊</div>
              <div class="empty-state-title">No timeline tasks found</div>
              <div class="empty-state-desc">Create tasks with start and due dates to generate the Gantt timeline roadmap.</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Determine min and max dates
    let minTime = Infinity;
    let maxTime = -Infinity;

    this.tasks.forEach(t => {
      const s = t.startDate ? new Date(t.startDate).getTime() : Date.now();
      const d = t.dueDate ? new Date(t.dueDate).getTime() : Date.now() + 7 * 86400000;
      if (s < minTime) minTime = s;
      if (d > maxTime) maxTime = d;
    });

    if (maxTime <= minTime) {
      maxTime = minTime + 30 * 86400000;
    }

    // Add 2 days padding
    minTime -= 2 * 86400000;
    maxTime += 2 * 86400000;
    const totalDuration = maxTime - minTime;

    const minDateStr = new Date(minTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const midDateStr = new Date(minTime + totalDuration / 2).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const maxDateStr = new Date(maxTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    const rowsHtml = this.tasks.map(t => {
      const sTime = t.startDate ? new Date(t.startDate).getTime() : minTime;
      const dTime = t.dueDate ? new Date(t.dueDate).getTime() : maxTime;

      const leftPercent = Math.max(0, Math.min(95, ((sTime - minTime) / totalDuration) * 100));
      const widthPercent = Math.max(5, Math.min(100 - leftPercent, ((dTime - sTime) / totalDuration) * 100));

      const statusClass = `status-${t.status.replace(/\s+/g, '')}`;

      return `
        <div class="gantt-row">
          <div class="gantt-row-info">
            <span class="gantt-task-name" onclick="window.tasksModule.openTaskDetailsModal('${t.id}')">${t.title}</span>
            <div class="gantt-task-meta">
              <span class="task-project-pill" style="font-size: 0.7rem; padding: 0.1rem 0.35rem;">${t.projectName || t.projectId}</span>
              <span>👤 ${t.assignee}</span>
            </div>
          </div>
          <div class="gantt-bar-cell">
            <div class="gantt-track">
              <div class="gantt-bar ${statusClass}" style="left: ${leftPercent}%; width: ${widthPercent}%;" onclick="window.tasksModule.openTaskDetailsModal('${t.id}')" title="${t.title} (${t.progress}% | ${t.startDate} to ${t.dueDate})">
                <div class="gantt-bar-fill" style="width: ${t.progress}%;"></div>
                <span class="gantt-bar-label">${t.progress}% • ${t.status}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="timeline-view-wrapper">
        <div class="timeline-header-info">
          <div>
            <h3 style="font-size: 1.1rem; color: var(--color-dark-brown);">Gantt Schedule Timeline</h3>
            <p class="text-muted" style="font-size: 0.82rem; margin: 0;">Horizontal execution roadmap plotted against task start and due dates</p>
          </div>
          <div class="timeline-legend">
            <div class="timeline-legend-item">
              <div class="timeline-legend-color" style="background: #10B981;"></div>
              <span>Completed</span>
            </div>
            <div class="timeline-legend-item">
              <div class="timeline-legend-color" style="background: #3B82F6;"></div>
              <span>In Progress</span>
            </div>
            <div class="timeline-legend-item">
              <div class="timeline-legend-color" style="background: #EF4444;"></div>
              <span>Blocked</span>
            </div>
            <div class="timeline-legend-item">
              <div class="timeline-legend-color" style="background: #8A684C;"></div>
              <span>Not Started</span>
            </div>
          </div>
        </div>

        <div class="gantt-chart-container">
          <div class="gantt-chart-header">
            <div class="gantt-header-task">Task Details</div>
            <div class="gantt-header-timeline">
              <span>📅 ${minDateStr}</span>
              <span>${midDateStr}</span>
              <span>${maxDateStr}</span>
            </div>
          </div>
          <div>
            ${rowsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MILESTONES SECTION
  // =========================================================================
  async renderMilestones() {
    const container = document.getElementById("milestones-display-container");
    if (!container) return;

    const res = await window.api.getMilestones({
      projectId: this.filters.projectId,
      search: this.filters.search
    });

    if (!res.success || res.data.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1;">
          <div class="card">
            <div class="card-body" style="padding: 2rem;">
              <div class="empty-state" style="padding: 1rem;">
                <div class="empty-state-title" style="font-size: 1rem;">No Milestones Registered</div>
                <div class="empty-state-desc" style="font-size: 0.82rem;">Create major stage deliverables and municipal approval checkpoints.</div>
                <button class="btn btn-secondary btn-sm" onclick="window.tasksModule.openCreateMilestoneModal()">+ Create Milestone</button>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    this.milestones = res.data;

    container.innerHTML = this.milestones.map(m => {
      const statusBadgeClass = {
        Completed: "badge-success",
        "In Progress": "badge-info",
        Upcoming: "badge-neutral",
        Delayed: "badge-danger"
      }[m.status] || "badge-neutral";

      const taskChips = (m.relatedTaskIds && m.relatedTaskIds.length > 0)
        ? m.relatedTaskIds.map(tid => `<span class="milestone-task-chip">${tid}</span>`).join("")
        : `<span class="text-muted" style="font-size: 0.75rem;">No linked tasks</span>`;

      return `
        <div class="milestone-card">
          <div class="milestone-top">
            <div>
              <div class="task-project-pill" style="margin-bottom: 0.35rem;">${m.projectName || m.projectId}</div>
              <div class="milestone-title">${m.title}</div>
            </div>
            <span class="badge ${statusBadgeClass}">${m.status}</span>
          </div>

          <div class="milestone-desc">
            ${m.description || 'Sign-off requirement and milestone criteria'}
          </div>

          <div>
            <div class="progress-container">
              <div class="progress-header">
                <span>Progress</span>
                <span class="font-bold">${m.progress}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${m.progress === 100 ? 'success' : ''}" style="width: ${m.progress}%"></div>
              </div>
            </div>
          </div>

          <div>
            <span class="text-muted" style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">Linked Work Packages:</span>
            <div class="milestone-tasks-list">
              ${taskChips}
            </div>
          </div>

          <div class="milestone-footer">
            <span>📅 Due: <strong>${m.dateFormatted || m.dueDate}</strong></span>
            <div class="flex items-center gap-1">
              <button class="btn btn-ghost btn-sm" onclick="window.tasksModule.openEditMilestoneModal('${m.id}')" title="Edit Milestone">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="window.tasksModule.openArchiveMilestoneModal('${m.id}')" title="Archive Milestone" style="color: var(--color-danger);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // =========================================================================
  // TASK CREATION & EDIT MODALS
  // =========================================================================
  async openCreateTaskModal(defaultProjectId = null) {
    const projSelect = document.getElementById("ct-project");
    const assigneeSelect = document.getElementById("ct-assignee");
    const depContainer = document.getElementById("ct-dependencies-container");

    if (projSelect) {
      projSelect.innerHTML = this.projects.map(p =>
        `<option value="${p.id}" ${ (defaultProjectId && defaultProjectId === p.id) || (this.filters.projectId === p.id) ? 'selected' : ''}>${p.name}</option>`
      ).join("");
    }

    if (assigneeSelect) {
      assigneeSelect.innerHTML = this.assignees.map(a =>
        `<option value="${a}">${a}</option>`
      ).join("");
    }

    // Populate available dependencies from all active tasks
    const allTasksRes = await window.api.getTasks();
    const allTasks = allTasksRes.success ? allTasksRes.data : [];

    if (depContainer) {
      if (allTasks.length === 0) {
        depContainer.innerHTML = `<span class="text-muted" style="font-size: 0.78rem;">No existing tasks to link</span>`;
      } else {
        depContainer.innerHTML = allTasks.map(t => `
          <label class="checkbox-label" style="display: flex; margin-bottom: 0.35rem;">
            <input type="checkbox" name="ct-dep" value="${t.id}" class="hidden-input">
            <span class="checkbox-custom"></span>
            <span style="font-size: 0.8rem;">[${t.id}] ${t.title} (${t.projectName || t.projectId})</span>
          </label>
        `).join("");
      }
    }

    // Set default dates
    const todayStr = new Date().toISOString().split("T")[0];
    const dueStr = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    const sDate = document.getElementById("ct-start-date");
    const dDate = document.getElementById("ct-due-date");
    if (sDate) sDate.value = todayStr;
    if (dDate) dDate.value = dueStr;

    // Reset form
    document.getElementById("ct-title").value = "";
    document.getElementById("ct-description").value = "";
    document.getElementById("ct-progress").value = "0";
    document.getElementById("ct-priority").value = "Medium";
    document.getElementById("ct-status").value = "Not Started";

    this.openModal("create-task-modal");
  }

  async handleCreateTask(e) {
    e.preventDefault();

    const projectId = document.getElementById("ct-project").value;
    const assignee = document.getElementById("ct-assignee").value;
    const title = document.getElementById("ct-title").value.trim();
    const description = document.getElementById("ct-description").value.trim();
    const priority = document.getElementById("ct-priority").value;
    const status = document.getElementById("ct-status").value;
    const progress = parseInt(document.getElementById("ct-progress").value, 10);
    const startDate = document.getElementById("ct-start-date").value;
    const dueDate = document.getElementById("ct-due-date").value;

    // Validation
    if (!title || !projectId || !assignee) {
      window.ui.showToast("Please complete all required fields.", "warning");
      return;
    }

    if (dueDate && startDate && dueDate < startDate) {
      window.ui.showToast("Due date cannot be earlier than start date.", "danger");
      return;
    }

    // Gather dependencies
    const depCheckboxes = document.querySelectorAll('input[name="ct-dep"]:checked');
    const dependencies = Array.from(depCheckboxes).map(cb => cb.value);

    const res = await window.api.createTask({
      projectId,
      assignee,
      title,
      description,
      priority,
      status,
      progress,
      startDate,
      dueDate,
      dependencies
    });

    if (res.success) {
      window.ui.showToast("Task created successfully.", "success");
      this.closeModal("create-task-modal");
      await this.refreshAll();
    } else {
      window.ui.showToast(res.message || "Failed to create task", "danger");
    }
  }

  async openEditTaskModal(taskId) {
    const res = await window.api.getTask(taskId);
    if (!res.success) return;

    const task = res.data;

    document.getElementById("et-id").value = task.id;
    document.getElementById("et-title").value = task.title;
    document.getElementById("et-description").value = task.description || "";
    document.getElementById("et-priority").value = task.priority;
    document.getElementById("et-status").value = task.status;
    document.getElementById("et-progress").value = task.progress;
    document.getElementById("et-start-date").value = task.startDate || "";
    document.getElementById("et-due-date").value = task.dueDate || "";

    const projSelect = document.getElementById("et-project");
    if (projSelect) {
      projSelect.innerHTML = this.projects.map(p =>
        `<option value="${p.id}" ${task.projectId === p.id ? 'selected' : ''}>${p.name}</option>`
      ).join("");
    }

    const assigneeSelect = document.getElementById("et-assignee");
    if (assigneeSelect) {
      assigneeSelect.innerHTML = this.assignees.map(a =>
        `<option value="${a}" ${task.assignee === a ? 'selected' : ''}>${a}</option>`
      ).join("");
    }

    // Populate dependencies checkboxes, excluding self to prevent self-dependency
    const allTasksRes = await window.api.getTasks();
    const allTasks = allTasksRes.success ? allTasksRes.data.filter(t => t.id !== task.id) : [];

    const depContainer = document.getElementById("et-dependencies-container");
    if (depContainer) {
      if (allTasks.length === 0) {
        depContainer.innerHTML = `<span class="text-muted" style="font-size: 0.78rem;">No other tasks available</span>`;
      } else {
        depContainer.innerHTML = allTasks.map(t => {
          const isChecked = task.dependencies && task.dependencies.includes(t.id);
          return `
            <label class="checkbox-label" style="display: flex; margin-bottom: 0.35rem;">
              <input type="checkbox" name="et-dep" value="${t.id}" ${isChecked ? 'checked' : ''} class="hidden-input">
              <span class="checkbox-custom"></span>
              <span style="font-size: 0.8rem;">[${t.id}] ${t.title} (${t.projectName || t.projectId})</span>
            </label>
          `;
        }).join("");
      }
    }

    this.openModal("edit-task-modal");
  }

  async handleEditTask(e) {
    e.preventDefault();

    const id = document.getElementById("et-id").value;
    const projectId = document.getElementById("et-project").value;
    const assignee = document.getElementById("et-assignee").value;
    const title = document.getElementById("et-title").value.trim();
    const description = document.getElementById("et-description").value.trim();
    const priority = document.getElementById("et-priority").value;
    const status = document.getElementById("et-status").value;
    const progress = parseInt(document.getElementById("et-progress").value, 10);
    const startDate = document.getElementById("et-start-date").value;
    const dueDate = document.getElementById("et-due-date").value;

    if (!title || !projectId || !assignee) {
      window.ui.showToast("Please fill all required fields.", "warning");
      return;
    }

    if (dueDate && startDate && dueDate < startDate) {
      window.ui.showToast("Due date cannot be earlier than start date.", "danger");
      return;
    }

    const depCheckboxes = document.querySelectorAll('input[name="et-dep"]:checked');
    const dependencies = Array.from(depCheckboxes).map(cb => cb.value);

    const res = await window.api.updateTask(id, {
      projectId,
      assignee,
      title,
      description,
      priority,
      status,
      progress,
      startDate,
      dueDate,
      dependencies
    });

    if (res.success) {
      window.ui.showToast("Task updated successfully.", "success");
      this.closeModal("edit-task-modal");
      await this.refreshAll();
    } else {
      window.ui.showToast(res.message || "Failed to update task", "danger");
    }
  }

  // =========================================================================
  // TASK DETAILS MODAL
  // =========================================================================
  async openTaskDetailsModal(taskId) {
    const res = await window.api.getTask(taskId);
    if (!res.success) return;

    const task = res.data;
    const todayStr = new Date().toISOString().split("T")[0];
    const isOverdue = task.status !== "Completed" && task.dueDate && task.dueDate < todayStr;

    document.getElementById("td-id-badge").textContent = task.id;
    document.getElementById("td-title").textContent = task.title;

    const modalBody = document.getElementById("task-details-modal-body");

    // Format dependencies
    let depHtml = `<span class="text-muted" style="font-size: 0.85rem;">No dependencies</span>`;
    if (task.dependencies && task.dependencies.length > 0) {
      depHtml = task.dependencies.map(dId => `<span class="dependency-tag">↳ ${dId}</span>`).join(" ");
    }

    const priorityClass = `priority-${task.priority.toLowerCase()}`;
    const statusClass = isOverdue && task.status !== "Blocked" ? "overdue" : task.status.toLowerCase().replace(/\s+/g, '-');
    const statusLabel = isOverdue && task.status !== "Blocked" ? "Overdue" : task.status;

    modalBody.innerHTML = `
      ${isOverdue ? `
        <div class="overdue-alert-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          This task has exceeded its due date (${task.dueDate}) and is flagged as Overdue.
        </div>
      ` : ''}

      <div class="task-details-grid">
        <div class="task-detail-item">
          <span class="task-detail-label">Project</span>
          <span class="task-detail-value">
            <a href="project-details.html?id=${task.projectId}" class="text-primary font-bold">
              ${task.projectName || task.projectId} (${task.projectId})
            </a>
          </span>
        </div>

        <div class="task-detail-item">
          <span class="task-detail-label">Assignee</span>
          <span class="task-detail-value">👤 ${task.assignee}</span>
        </div>

        <div class="task-detail-item">
          <span class="task-detail-label">Status</span>
          <span class="task-detail-value">
            <span class="status-pill ${statusClass}">${statusLabel}</span>
          </span>
        </div>

        <div class="task-detail-item">
          <span class="task-detail-label">Priority</span>
          <span class="task-detail-value">
            <span class="priority-badge ${priorityClass}">${task.priority}</span>
          </span>
        </div>

        <div class="task-detail-item">
          <span class="task-detail-label">Start Date</span>
          <span class="task-detail-value">${task.startDate || '—'}</span>
        </div>

        <div class="task-detail-item">
          <span class="task-detail-label">Target Completion</span>
          <span class="task-detail-value ${isOverdue ? 'text-danger font-bold' : ''}">
            ${task.dueDate || '—'}
          </span>
        </div>
      </div>

      <div class="task-detail-item" style="margin-bottom: 1.25rem;">
        <span class="task-detail-label">Execution Progress</span>
        <div class="progress-container" style="margin-top: 0.35rem;">
          <div class="progress-header">
            <span>Completion Velocity</span>
            <span class="font-bold">${task.progress}%</span>
          </div>
          <div class="progress-track thick">
            <div class="progress-fill ${task.progress === 100 ? 'success' : (isOverdue ? 'danger' : '')}" style="width: ${task.progress}%"></div>
          </div>
        </div>
      </div>

      <div class="task-detail-item" style="margin-bottom: 1.25rem;">
        <span class="task-detail-label">Scope & Engineering Specifications</span>
        <p style="font-size: 0.9rem; color: var(--color-text-body); line-height: 1.5; margin-top: 0.25rem;">
          ${task.description || 'No detailed specifications recorded.'}
        </p>
      </div>

      <div class="task-detail-item" style="margin-bottom: 1.25rem;">
        <span class="task-detail-label">Prerequisites & Task Dependencies</span>
        <div style="margin-top: 0.35rem;">
          ${depHtml}
        </div>
      </div>

      <div class="task-detail-item" style="padding-top: 0.75rem; border-top: 1px solid var(--color-border-subtle); font-size: 0.74rem; color: var(--color-text-muted);">
        <span>Created: ${new Date(task.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        <span>Last Updated: ${new Date(task.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    `;

    // Hook up buttons
    const editBtn = document.getElementById("td-edit-btn");
    if (editBtn) {
      editBtn.onclick = () => {
        this.closeModal("task-details-modal");
        this.openEditTaskModal(task.id);
      };
    }

    const archiveBtn = document.getElementById("td-archive-btn");
    if (archiveBtn) {
      archiveBtn.onclick = () => {
        this.closeModal("task-details-modal");
        this.openArchiveTaskModal(task.id);
      };
    }

    this.openModal("task-details-modal");
  }

  // =========================================================================
  // MILESTONE MODALS
  // =========================================================================
  async openCreateMilestoneModal() {
    const projSelect = document.getElementById("cm-project");
    if (projSelect) {
      projSelect.innerHTML = this.projects.map(p =>
        `<option value="${p.id}" ${this.filters.projectId === p.id ? 'selected' : ''}>${p.name}</option>`
      ).join("");
    }

    const allTasksRes = await window.api.getTasks();
    const allTasks = allTasksRes.success ? allTasksRes.data : [];

    const tasksContainer = document.getElementById("cm-related-tasks-container");
    if (tasksContainer) {
      tasksContainer.innerHTML = allTasks.map(t => `
        <label class="checkbox-label" style="display: flex; margin-bottom: 0.35rem;">
          <input type="checkbox" name="cm-task" value="${t.id}" class="hidden-input">
          <span class="checkbox-custom"></span>
          <span style="font-size: 0.8rem;">[${t.id}] ${t.title}</span>
        </label>
      `).join("");
    }

    document.getElementById("cm-title").value = "";
    document.getElementById("cm-description").value = "";
    document.getElementById("cm-due-date").value = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
    document.getElementById("cm-status").value = "Upcoming";
    document.getElementById("cm-progress").value = "0";
    document.getElementById("cm-responsible").value = "Kashish Patel";

    this.openModal("create-milestone-modal");
  }

  async handleCreateMilestone(e) {
    e.preventDefault();

    const projectId = document.getElementById("cm-project").value;
    const title = document.getElementById("cm-title").value.trim();
    const description = document.getElementById("cm-description").value.trim();
    const dueDate = document.getElementById("cm-due-date").value;
    const status = document.getElementById("cm-status").value;
    const progress = parseInt(document.getElementById("cm-progress").value, 10);
    const responsible = document.getElementById("cm-responsible").value.trim();

    if (!title || !projectId || !dueDate) {
      window.ui.showToast("Please fill all required fields.", "warning");
      return;
    }

    const taskCheckboxes = document.querySelectorAll('input[name="cm-task"]:checked');
    const relatedTaskIds = Array.from(taskCheckboxes).map(cb => cb.value);

    const res = await window.api.createMilestone({
      projectId,
      title,
      description,
      dueDate,
      status,
      progress,
      responsible,
      relatedTaskIds
    });

    if (res.success) {
      window.ui.showToast("Milestone created successfully.", "success");
      this.closeModal("create-milestone-modal");
      await this.renderMilestones();
    }
  }

  async openEditMilestoneModal(milestoneId) {
    const res = await window.api.getMilestone(milestoneId);
    if (!res.success) return;

    const m = res.data;

    document.getElementById("em-id").value = m.id;
    document.getElementById("em-title").value = m.title;
    document.getElementById("em-description").value = m.description || "";
    document.getElementById("em-due-date").value = m.dueDate || "";
    document.getElementById("em-status").value = m.status;
    document.getElementById("em-progress").value = m.progress;
    document.getElementById("em-responsible").value = m.responsible || "";

    const projSelect = document.getElementById("em-project");
    if (projSelect) {
      projSelect.innerHTML = this.projects.map(p =>
        `<option value="${p.id}" ${m.projectId === p.id ? 'selected' : ''}>${p.name}</option>`
      ).join("");
    }

    const allTasksRes = await window.api.getTasks();
    const allTasks = allTasksRes.success ? allTasksRes.data : [];

    const tasksContainer = document.getElementById("em-related-tasks-container");
    if (tasksContainer) {
      tasksContainer.innerHTML = allTasks.map(t => {
        const isChecked = m.relatedTaskIds && m.relatedTaskIds.includes(t.id);
        return `
          <label class="checkbox-label" style="display: flex; margin-bottom: 0.35rem;">
            <input type="checkbox" name="em-task" value="${t.id}" ${isChecked ? 'checked' : ''} class="hidden-input">
            <span class="checkbox-custom"></span>
            <span style="font-size: 0.8rem;">[${t.id}] ${t.title}</span>
          </label>
        `;
      }).join("");
    }

    this.openModal("edit-milestone-modal");
  }

  async handleEditMilestone(e) {
    e.preventDefault();

    const id = document.getElementById("em-id").value;
    const projectId = document.getElementById("em-project").value;
    const title = document.getElementById("em-title").value.trim();
    const description = document.getElementById("em-description").value.trim();
    const dueDate = document.getElementById("em-due-date").value;
    const status = document.getElementById("em-status").value;
    const progress = parseInt(document.getElementById("em-progress").value, 10);
    const responsible = document.getElementById("em-responsible").value.trim();

    if (!title || !projectId || !dueDate) {
      window.ui.showToast("Please fill all required fields.", "warning");
      return;
    }

    const taskCheckboxes = document.querySelectorAll('input[name="em-task"]:checked');
    const relatedTaskIds = Array.from(taskCheckboxes).map(cb => cb.value);

    const res = await window.api.updateMilestone(id, {
      projectId,
      title,
      description,
      dueDate,
      status,
      progress,
      responsible,
      relatedTaskIds
    });

    if (res.success) {
      window.ui.showToast("Milestone updated successfully.", "success");
      this.closeModal("edit-milestone-modal");
      await this.renderMilestones();
    }
  }

  // =========================================================================
  // ARCHIVE ACTIONS
  // =========================================================================
  openArchiveTaskModal(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    const name = task ? `Task "${task.title}" (${taskId})` : `Task ${taskId}`;
    this.itemToArchive = { type: 'task', id: taskId, name };

    document.getElementById("archive-item-title-heading").textContent = "Archive Task";
    document.getElementById("archive-item-name").textContent = name;
    this.openModal("archive-task-confirm-modal");
  }

  openArchiveMilestoneModal(milestoneId) {
    const milestone = this.milestones.find(m => m.id === milestoneId);
    const name = milestone ? `Milestone "${milestone.title}"` : `Milestone ${milestoneId}`;
    this.itemToArchive = { type: 'milestone', id: milestoneId, name };

    document.getElementById("archive-item-title-heading").textContent = "Archive Milestone";
    document.getElementById("archive-item-name").textContent = name;
    this.openModal("archive-task-confirm-modal");
  }

  async executeArchive() {
    if (!this.itemToArchive) return;

    if (this.itemToArchive.type === 'task') {
      const res = await window.api.archiveTask(this.itemToArchive.id);
      if (res.success) {
        window.ui.showToast(res.message || "Task archived.", "info");
        this.closeModal("archive-task-confirm-modal");
        this.itemToArchive = null;
        await this.refreshAll();
      }
    } else if (this.itemToArchive.type === 'milestone') {
      const res = await window.api.archiveMilestone(this.itemToArchive.id);
      if (res.success) {
        window.ui.showToast(res.message || "Milestone archived.", "info");
        this.closeModal("archive-task-confirm-modal");
        this.itemToArchive = null;
        await this.renderMilestones();
      }
    }
  }

  // =========================================================================
  // MODAL UTILITIES
  // =========================================================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }
}

window.tasksModule = new TasksController();
