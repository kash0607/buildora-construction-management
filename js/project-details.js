/**
 * BUILDORA — Project Details Controller
 * Handles comprehensive Project Workspace, Overview metrics, Budget math, Timeline, and Tab routing
 */

class ProjectDetailsController {
  constructor() {
    this.project = null;
    this.currentTab = "overview";
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id") || "PRJ-101";

    const res = await window.api.getProject(projectId);
    if (res.success) {
      this.project = res.data;
      this.renderHeader();
      this.renderOverview();
      this.bindTabEvents();
      this.bindEditModalEvents();
    } else {
      this.renderNotFound();
    }
  }

  renderHeader() {
    const p = this.project;
    const headerContainer = document.getElementById("project-hero-banner");
    if (!headerContainer) return;

    const statusBadgeClass = {
      Active: "badge-success",
      Planning: "badge-neutral",
      Delayed: "badge-danger",
      "On Hold": "badge-warning",
      Completed: "badge-info"
    }[p.status] || "badge-neutral";

    const budgetCr = "₹" + (p.budget / 10000000).toFixed(1) + " Cr";
    const spentCr = "₹" + (p.actualCost / 10000000).toFixed(1) + " Cr";

    headerContainer.innerHTML = `
      <div class="project-details-hero-info">
        <div class="project-details-tagline">
          <span>PROJECT ID: ${p.id}</span> • <span>${p.client}</span>
        </div>
        <h1 class="project-details-title">${p.name}</h1>
        <div class="project-details-meta-row">
          <span>📍 ${p.location}</span>
          <span>👤 Lead PM: <strong>${p.manager}</strong></span>
          <span>📅 Target Handover: <strong>${p.deadline}</strong></span>
          <span class="badge ${statusBadgeClass}">${p.status}</span>
        </div>

        <div class="project-details-quick-stats">
          <div class="hero-quick-stat">
            <span class="hero-quick-stat-label">Overall Progress</span>
            <span class="hero-quick-stat-val">${p.progress}%</span>
          </div>
          <div class="hero-quick-stat">
            <span class="hero-quick-stat-label">Total Budget</span>
            <span class="hero-quick-stat-val">${budgetCr}</span>
          </div>
          <div class="hero-quick-stat">
            <span class="hero-quick-stat-label">Incurred Cost</span>
            <span class="hero-quick-stat-val" style="color: var(--color-warm-beige);">${spentCr}</span>
          </div>
          <div class="hero-quick-stat">
            <span class="hero-quick-stat-label">Active Work Force</span>
            <span class="hero-quick-stat-val">${p.workersOnSite || 0} Workers</span>
          </div>
        </div>
      </div>

      <div class="project-details-actions">
        <button class="btn btn-secondary btn-sm" onclick="window.projectDetails.openEditModal()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          Edit Project
        </button>
        <button class="btn btn-outline btn-sm" style="background: rgba(255,255,255,0.15); color: var(--color-white); border-color: rgba(255,255,255,0.3);" onclick="window.ui.showToast('Exporting project summary PDF...', 'info')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Export Summary
        </button>
      </div>
    `;
  }

  renderOverview() {
    const p = this.project;
    const container = document.getElementById("tab-content-overview");
    if (!container) return;

    // Financial formulas
    const totalBudget = p.budget;
    const committedCost = p.committedCost || 0;
    const actualCost = p.actualCost || 0;
    const remainingBudget = Math.max(0, totalBudget - committedCost - actualCost);
    const budgetUtilizationPct = totalBudget > 0 ? ((actualCost / totalBudget) * 100).toFixed(1) : 0;

    const fmtCr = (val) => "₹" + (val / 10000000).toFixed(2) + " Cr";

    container.innerHTML = `
      <div class="project-overview-grid">
        
        <!-- Left Main Column -->
        <div class="flex-col gap-6">
          
          <!-- Progress Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Project Execution & Progress</div>
                <div class="card-subtitle">Task completion and milestone velocity</div>
              </div>
              <span class="badge ${p.progress >= 70 ? 'badge-success' : 'badge-neutral'} font-bold">${p.progress}% Completed</span>
            </div>
            <div class="card-body">
              <div class="progress-container" style="margin-bottom: 1.5rem;">
                <div class="progress-track thick">
                  <div class="progress-fill ${p.progress >= 70 ? 'success' : ''}" style="width: ${p.progress}%"></div>
                </div>
              </div>

              <div class="form-row three-col" style="margin-bottom: 0;">
                <div class="stat-card" style="padding: 1rem; border-color: var(--color-border-subtle);">
                  <span class="stat-label">Tasks Finished</span>
                  <div class="stat-value" style="font-size: 1.4rem;">${p.tasksCompleted || 0} / ${p.tasksTotal || 0}</div>
                  <div class="stat-footer">
                    <span>${((p.tasksCompleted / (p.tasksTotal || 1)) * 100).toFixed(0)}% task completion</span>
                  </div>
                </div>

                <div class="stat-card" style="padding: 1rem; border-color: var(--color-border-subtle);">
                  <span class="stat-label">Milestones Achieved</span>
                  <div class="stat-value" style="font-size: 1.4rem;">${p.milestonesCompleted || 0} / ${p.milestonesTotal || 0}</div>
                  <div class="stat-footer">
                    <span>${p.milestonesTotal - p.milestonesCompleted} remaining</span>
                  </div>
                </div>

                <div class="stat-card" style="padding: 1rem; border-color: var(--color-border-subtle);">
                  <span class="stat-label">Active Field Crew</span>
                  <div class="stat-value text-primary" style="font-size: 1.4rem;">${p.workersOnSite || 0}</div>
                  <div class="stat-footer">
                    <span>Workers logged today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Budget Math Summary Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Cost & Budget Allocation
                </div>
                <div class="card-subtitle">Real-time expenditure formula: Remaining = Total - Committed - Actual</div>
              </div>
              <div class="badge badge-neutral font-semibold">Utilization: ${budgetUtilizationPct}%</div>
            </div>
            <div class="card-body">
              <div class="budget-math-box">
                <div class="budget-math-item">
                  <span class="budget-math-label">Total Allocated</span>
                  <span class="budget-math-value">${fmtCr(totalBudget)}</span>
                </div>
                <div class="budget-math-item">
                  <span class="budget-math-label">Committed (POs)</span>
                  <span class="budget-math-value text-muted">${fmtCr(committedCost)}</span>
                </div>
                <div class="budget-math-item">
                  <span class="budget-math-label">Actual Incurred</span>
                  <span class="budget-math-value text-primary">${fmtCr(actualCost)}</span>
                </div>
                <div class="budget-math-item">
                  <span class="budget-math-label">Remaining Budget</span>
                  <span class="budget-math-value" style="color: var(--color-success);">${fmtCr(remainingBudget)}</span>
                </div>
              </div>

              <div class="progress-container">
                <div class="progress-header">
                  <span>Budget Utilization Velocity</span>
                  <span class="font-semibold text-dark">${budgetUtilizationPct}% used</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill ${budgetUtilizationPct > 85 ? 'danger' : ''}" style="width: ${budgetUtilizationPct}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Project Description & Specifications -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Scope & Specifications</div>
            </div>
            <div class="card-body">
              <p style="color: var(--color-text-body); font-size: 0.95rem; line-height: 1.6;">
                ${p.description || "No specific scope document provided."}
              </p>
            </div>
          </div>

          <!-- Open Issues & Safety Concerns -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title" style="color: var(--color-danger);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y2="16"/></svg>
                  Site Issues & Quality Flags (${(p.issues || []).length})
                </div>
                <div class="card-subtitle">Active bottlenecks awaiting resolution</div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="window.ui.showToast('Issue reporting form opened', 'info')">+ Log Issue</button>
            </div>
            <div class="card-body" style="padding: 0.5rem 1.5rem 1rem;">
              ${(p.issues && p.issues.length > 0) ? p.issues.map(iss => {
                const prioBadge = {
                  Critical: "badge-danger",
                  High: "badge-danger",
                  Medium: "badge-warning",
                  Low: "badge-neutral"
                }[iss.priority] || "badge-neutral";

                return `
                  <div class="flex items-center justify-between" style="padding: 0.85rem 0; border-bottom: 1px solid var(--color-border-subtle);">
                    <div>
                      <div class="font-bold text-dark" style="font-size: 0.9rem;">${iss.title}</div>
                      <div class="text-muted" style="font-size: 0.78rem;">Reported: ${iss.date} • Assigned to: <strong>${iss.assignee}</strong></div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="badge ${prioBadge}">${iss.priority}</span>
                      <span class="badge badge-neutral">${iss.status}</span>
                    </div>
                  </div>
                `;
              }).join("") : `
                <div class="empty-state" style="padding: 1.5rem;">
                  <div class="empty-state-title" style="font-size: 0.95rem;">No Active Issues</div>
                  <div class="empty-state-desc" style="font-size: 0.8rem;">All site safety and quality flags are cleared.</div>
                </div>
              `}
            </div>
          </div>

        </div>

        <!-- Right Sidebar Column -->
        <div class="flex-col gap-6">
          
          <!-- Project Timeline & Milestones Preview -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Schedule Timeline</div>
                <div class="card-subtitle">Milestones & completion roadmap</div>
              </div>
            </div>
            <div class="card-body">
              <div class="overview-timeline">
                <div class="overview-timeline-node">
                  <div class="overview-timeline-dot done"></div>
                  <div>
                    <div class="font-bold text-dark" style="font-size: 0.88rem;">Project Groundbreaking & Piling</div>
                    <div class="text-muted" style="font-size: 0.78rem;">${p.startDate || "2025-04-01"} • Completed</div>
                  </div>
                </div>

                <div class="overview-timeline-node">
                  <div class="overview-timeline-dot done"></div>
                  <div>
                    <div class="font-bold text-dark" style="font-size: 0.88rem;">Substructure & Retaining Raft</div>
                    <div class="text-muted" style="font-size: 0.78rem;">100% Sign-off • Quality Approved</div>
                  </div>
                </div>

                <div class="overview-timeline-node">
                  <div class="overview-timeline-dot"></div>
                  <div>
                    <div class="font-bold text-dark" style="font-size: 0.88rem;">Superstructure Structural Framework</div>
                    <div class="text-muted" style="font-size: 0.78rem;">Current Phase • Target: Dec 2026</div>
                  </div>
                </div>

                <div class="overview-timeline-node">
                  <div class="overview-timeline-dot"></div>
                  <div>
                    <div class="font-bold text-dark" style="font-size: 0.88rem;">MEP 1st Fix & Architectural Glazing</div>
                    <div class="text-muted" style="font-size: 0.78rem;">Target: Early 2027</div>
                  </div>
                </div>

                <div class="overview-timeline-node">
                  <div class="overview-timeline-dot"></div>
                  <div>
                    <div class="font-bold text-dark" style="font-size: 0.88rem;">Occupancy Certificate & Handover</div>
                    <div class="text-muted" style="font-size: 0.78rem;">Target: ${p.deadline}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Project Team Summary -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Assigned Project Team</div>
                <div class="card-subtitle">Key engineering and site leadership</div>
              </div>
            </div>
            <div class="card-body">
              <div class="flex-col gap-3">
                ${(p.team || []).map(member => `
                  <div class="team-mini-card">
                    <div class="user-avatar-sm" style="background: var(--color-primary-brown); font-size: 0.8rem;">
                      ${member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div class="font-bold text-dark" style="font-size: 0.85rem;">${member.name}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">${member.role}</div>
                      <div class="text-muted" style="font-size: 0.72rem;">${member.phone}</div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- Recent Project Activity Feed -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Recent Activity</div>
            </div>
            <div class="card-body" style="padding: 0.75rem 1.25rem;">
              ${(p.recentActivities || []).map(act => `
                <div style="padding: 0.65rem 0; border-bottom: 1px solid var(--color-border-subtle);">
                  <div class="font-semibold text-dark" style="font-size: 0.82rem;">${act.action}</div>
                  <div class="flex justify-between text-muted" style="font-size: 0.74rem; margin-top: 0.2rem;">
                    <span>👤 ${act.user}</span>
                    <span>${act.time}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

        </div>

      </div>
    `;
  }

  bindTabEvents() {
    const tabButtons = document.querySelectorAll(".project-tab-btn");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const tabKey = btn.dataset.tab;
        this.currentTab = tabKey;

        // Hide all tab panes
        document.querySelectorAll(".project-tab-pane").forEach(pane => {
          pane.style.display = "none";
        });

        // Show selected tab pane
        const targetPane = document.getElementById(`tab-content-${tabKey}`);
        if (targetPane) {
          targetPane.style.display = "block";
        }
      });
    });
  }

  bindEditModalEvents() {
    const editForm = document.getElementById("modal-edit-project-form");
    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const p = this.project;

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

        const res = await window.api.updateProject(p.id, {
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
          this.project = res.data;
          window.ui.showToast("Project updated successfully.", "success");
          this.closeModal("edit-project-modal");
          this.renderHeader();
          this.renderOverview();
        }
      });
    }
  }

  openEditModal() {
    const p = this.project;
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

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }

  renderNotFound() {
    const mainContainer = document.querySelector(".content-container");
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="empty-state" style="background: var(--color-white); border-radius: var(--radius-lg); border: 1px solid var(--color-border); margin-top: 2rem;">
          <div class="empty-state-icon">✕</div>
          <div class="empty-state-title">Project Not Found</div>
          <div class="empty-state-desc">The requested project does not exist or has been archived.</div>
          <a href="projects.html" class="btn btn-primary btn-sm">Return to Projects</a>
        </div>
      `;
    }
  }
}

window.projectDetails = new ProjectDetailsController();
