/**
 * BUILDORA — Dashboard Controller
 * Connects API data to the Operations Control Center UI with Chart.js
 */

class DashboardController {
  constructor() {
    this.charts = {};
  }

  async init() {
    await this.renderKPIs();
    await this.initCharts();
    await this.renderRecentProjects();
    await this.renderUpcomingMilestones();
    await this.renderPendingApprovals();
    await this.renderSiteActivity();
    this.bindModalEvents();
  }

  // --- Render KPI Stat Cards ---
  async renderKPIs() {
    const res = await window.api.getDashboardStats();
    if (!res.success) return;
    const stats = res.data;

    const kpiContainer = document.getElementById("kpi-cards-grid");
    if (!kpiContainer) return;

    kpiContainer.innerHTML = `
      <!-- Active Projects -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-label">Active Projects</span>
          <div class="stat-icon primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
        </div>
        <div class="stat-value">${stats.activeProjects}</div>
        <div class="stat-footer">
          <span class="stat-trend up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            +2
          </span>
          <span>sites active this mo.</span>
        </div>
      </div>

      <!-- Total Budget -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-label">Total Portfolio Budget</span>
          <div class="stat-icon info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        <div class="stat-value">${stats.totalBudgetFormatted}</div>
        <div class="stat-footer">
          <span class="text-muted">Across 12 major sites</span>
        </div>
      </div>

      <!-- Budget Used -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-label">Budget Utilized</span>
          <div class="stat-icon warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
        </div>
        <div class="stat-value">${stats.budgetUsedFormatted}</div>
        <div class="stat-footer">
          <span class="stat-trend neutral font-semibold">${stats.budgetPercentage}%</span>
          <span>committed to date</span>
        </div>
      </div>

      <!-- Pending Approvals -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-label">Pending Approvals</span>
          <div class="stat-icon warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
        </div>
        <div class="stat-value text-primary" id="kpi-approvals-count">${stats.pendingApprovals}</div>
        <div class="stat-footer">
          <span class="stat-trend down font-semibold">5 Urgent</span>
          <span>require PM sign-off</span>
        </div>
      </div>

      <!-- Overdue Tasks -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-label">Overdue Tasks</span>
          <div class="stat-icon danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <div class="stat-value" style="color: var(--color-danger);">${stats.overdueTasks}</div>
        <div class="stat-footer">
          <span class="stat-trend down">Critical path</span>
          <span>flagged</span>
        </div>
      </div>

      <!-- Low Stock Items -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-label">Low Stock Alerts</span>
          <div class="stat-icon danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
          </div>
        </div>
        <div class="stat-value">${stats.lowStockItems}</div>
        <div class="stat-footer">
          <span class="text-muted">Rebar & Cement reorder</span>
        </div>
      </div>
    `;
  }

  // --- Initialize Earthy Warm Brown Chart.js ---
  async initCharts() {
    const analyticsRes = await window.api.getAnalyticsSummary();
    if (!analyticsRes.success) return;
    const { expenseTrends, projectHealth } = analyticsRes.data;

    // 1. Budget vs Actual Expenses Chart (Line / Area)
    const expenseCtx = document.getElementById("expenseTrendsChart");
    if (expenseCtx && window.Chart) {
      if (this.charts.expense) this.charts.expense.destroy();

      this.charts.expense = new Chart(expenseCtx, {
        type: "line",
        data: {
          labels: expenseTrends.labels,
          datasets: [
            {
              label: "Planned Budget (₹ Cr)",
              data: expenseTrends.budgeted,
              borderColor: "#8A684C",
              backgroundColor: "rgba(138, 104, 76, 0.08)",
              borderDash: [5, 5],
              borderWidth: 2,
              fill: false,
              tension: 0.35,
              pointRadius: 4,
              pointBackgroundColor: "#8A684C"
            },
            {
              label: "Actual Expenses (₹ Cr)",
              data: expenseTrends.actual,
              borderColor: "#6B4F3A",
              backgroundColor: "rgba(184, 138, 90, 0.2)",
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              pointRadius: 5,
              pointBackgroundColor: "#463326",
              pointHoverRadius: 7
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              align: "end",
              labels: {
                boxWidth: 12,
                font: { family: "Inter", size: 12 },
                color: "#4A4642"
              }
            },
            tooltip: {
              backgroundColor: "#463326",
              titleFont: { family: "Plus Jakarta Sans", size: 13, weight: "bold" },
              bodyFont: { family: "Inter", size: 12 },
              padding: 10,
              cornerRadius: 6,
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ₹${context.raw} Cr`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: "rgba(229, 222, 213, 0.5)" },
              ticks: { color: "#77716B", font: { family: "Inter", size: 11 } }
            },
            y: {
              grid: { color: "rgba(229, 222, 213, 0.5)" },
              ticks: {
                color: "#77716B",
                font: { family: "Inter", size: 11 },
                callback: function(val) { return "₹" + val + " Cr"; }
              }
            }
          }
        }
      });
    }

    // 2. Project Health Doughnut Chart
    const healthCtx = document.getElementById("projectHealthChart");
    if (healthCtx && window.Chart) {
      if (this.charts.health) this.charts.health.destroy();

      this.charts.health = new Chart(healthCtx, {
        type: "doughnut",
        data: {
          labels: projectHealth.labels,
          datasets: [{
            data: projectHealth.counts,
            backgroundColor: [
              "#2E7D32", // Completed
              "#6B4F3A", // Active On-Track
              "#D97706", // Delayed/Review
              "#E9E0D5"  // Planning
            ],
            borderColor: "#FFFFFF",
            borderWidth: 3,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                boxWidth: 10,
                font: { family: "Inter", size: 11 },
                color: "#4A4642",
                padding: 14
              }
            },
            tooltip: {
              backgroundColor: "#463326",
              padding: 10,
              cornerRadius: 6,
              callbacks: {
                label: function(context) {
                  return ` ${context.label}: ${context.raw} Projects`;
                }
              }
            }
          }
        }
      });
    }
  }

  // --- Render Recent Projects Table ---
  async renderRecentProjects() {
    const res = await window.api.getProjects();
    if (!res.success) return;
    const projects = res.data.slice(0, 4);

    const tbody = document.getElementById("recent-projects-tbody");
    if (!tbody) return;

    tbody.innerHTML = projects.map(p => {
      const statusBadgeClass = {
        Active: "badge-success",
        Planning: "badge-neutral",
        Delayed: "badge-danger",
        "On Hold": "badge-warning",
        Completed: "badge-info"
      }[p.status] || "badge-neutral";

      const budgetFormatted = "₹" + (p.budget / 10000000).toFixed(1) + " Cr";

      return `
        <tr>
          <td>
            <div class="flex items-center gap-3">
              <div style="width: 42px; height: 42px; border-radius: 8px; overflow: hidden; background: #eee; flex-shrink: 0;">
                <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div>
                <span class="project-cell-name">${p.name}</span>
                <span class="project-cell-sub">${p.client} • ${p.location}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="text-dark font-semibold">${p.manager}</span>
            <div class="text-muted" style="font-size: 0.75rem;">${p.workersOnSite} on site</div>
          </td>
          <td class="project-progress-cell">
            <div class="progress-container">
              <div class="progress-header">
                <span>Progress</span>
                <span class="font-semibold text-dark">${p.progress}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${p.progress > 70 ? 'success' : ''}" style="width: ${p.progress}%"></div>
              </div>
            </div>
          </td>
          <td>
            <span class="font-semibold text-dark">${budgetFormatted}</span>
          </td>
          <td>
            <span class="badge ${statusBadgeClass}">${p.status}</span>
          </td>
          <td style="text-align: right;">
            <a href="projects.html" class="btn btn-outline btn-sm">Manage</a>
          </td>
        </tr>
      `;
    }).join("");
  }

  // --- Render Upcoming Milestones ---
  async renderUpcomingMilestones() {
    const res = await window.api.getUpcomingMilestones();
    if (!res.success) return;
    const milestones = res.data;

    const container = document.getElementById("milestones-timeline-container");
    if (!container) return;

    container.innerHTML = milestones.map(m => {
      let dotClass = "";
      if (m.status === "Completed") dotClass = "completed";
      if (m.status === "Delayed") dotClass = "delayed";

      return `
        <div class="timeline-item">
          <div class="timeline-dot ${dotClass}"></div>
          <div class="timeline-content">
            <div class="flex items-center justify-between">
              <div class="timeline-title">${m.title}</div>
              <span class="badge ${m.status === 'Completed' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.7rem;">${m.dueDate}</span>
            </div>
            <div class="timeline-meta">
              <span>🏗️ ${m.project}</span>
              <span>👤 ${m.responsible}</span>
            </div>
            <div class="progress-track" style="height: 5px; margin-top: 0.4rem;">
              <div class="progress-fill" style="width: ${m.progress}%;"></div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- Render Urgent Approvals ---
  async renderPendingApprovals() {
    const res = await window.api.getPendingApprovals();
    if (!res.success) return;
    const approvals = res.data;

    const container = document.getElementById("pending-approvals-list");
    if (!container) return;

    if (approvals.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem;">
          <div class="empty-state-icon" style="width: 44px; height: 44px; font-size: 1.2rem;">✓</div>
          <div class="empty-state-title">All Caught Up</div>
          <div class="empty-state-desc" style="font-size: 0.8rem;">No pending approvals require your action.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = approvals.slice(0, 3).map(a => `
      <div class="approval-item" id="approval-item-${a.id}">
        <div class="approval-info">
          <div class="approval-title">${a.title}</div>
          <div class="approval-meta">
            <span>${a.project}</span> • <span>${a.requestedBy}</span>
          </div>
          <div class="approval-amount">${a.amount}</div>
        </div>
        <div class="approval-actions">
          <button class="btn btn-outline btn-sm" style="color: var(--color-danger); border-color: var(--color-danger-border);" onclick="window.dashboard.handleApproval('${a.id}', 'reject')">
            Reject
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.dashboard.handleApproval('${a.id}', 'approve')">
            Approve
          </button>
        </div>
      </div>
    `).join("");
  }

  async handleApproval(id, action) {
    const res = await window.api.handleApprovalAction(id, action);
    if (res.success) {
      window.ui.showToast(res.message, action === "approve" ? "success" : "warning");
      const itemEl = document.getElementById(`approval-item-${id}`);
      if (itemEl) {
        itemEl.style.opacity = "0";
        setTimeout(() => itemEl.remove(), 250);
      }
      // Update badge
      const countEl = document.getElementById("kpi-approvals-count");
      if (countEl) {
        let current = parseInt(countEl.innerText, 10);
        if (current > 0) countEl.innerText = current - 1;
      }
    }
  }

  // --- Render Site Activity ---
  async renderSiteActivity() {
    const res = await window.api.getRecentSiteReports();
    if (!res.success) return;
    const reports = res.data;

    const container = document.getElementById("site-activity-container");
    if (!container) return;

    container.innerHTML = reports.map(r => `
      <div class="site-log-card">
        <div class="site-log-header">
          <span>${r.project}</span>
          <span class="badge badge-success badge-no-dot" style="font-size: 0.7rem;">${r.progressToday}</span>
        </div>
        <div class="site-log-details">${r.workCompleted}</div>
        <div class="site-log-meta">
          <span>👷 ${r.workersPresent} Workers</span>
          <span>🌤️ ${r.weather}</span>
          <span>👤 ${r.supervisor}</span>
        </div>
      </div>
    `).join("");
  }

  // --- Modals Controller ---
  bindModalEvents() {
    // Quick New Project Modal form submit
    const newProjectForm = document.getElementById("create-project-form");
    if (newProjectForm) {
      newProjectForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("np-name").value;
        const client = document.getElementById("np-client").value;
        const location = document.getElementById("np-location").value;
        const budget = parseFloat(document.getElementById("np-budget").value) * 10000000;
        const deadline = document.getElementById("np-deadline").value;

        const res = await window.api.createProject({
          name,
          client,
          location,
          budget,
          deadline,
          manager: window.auth.getCurrentUser().name,
          image: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
          workersOnSite: 0
        });

        if (res.success) {
          window.ui.showToast("Project created successfully!", "success");
          this.closeModal("create-project-modal");
          await this.renderRecentProjects();
          await this.renderKPIs();
          newProjectForm.reset();
        }
      });
    }
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

window.dashboard = new DashboardController();
