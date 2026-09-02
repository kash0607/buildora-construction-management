/**
 * BUILDORA — API Client & Service Abstraction
 * Asynchronous service layer ready for future Node.js/Express backend integration
 */

const API_BASE_URL = "/api"; // Prepared for backend mount
const SIMULATE_DELAY = 100; // ms for smooth responsive UI feel

class BuildoraAPI {
  constructor() {
    this.storageKey = "buildora_app_state_v2";
    this._initStorage();
  }

  _initStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(window.BUILDORA_MOCK_DATA));
    }
  }

  _getState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : window.BUILDORA_MOCK_DATA;
    } catch (e) {
      return window.BUILDORA_MOCK_DATA;
    }
  }

  _saveState(state) {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  async _delay() {
    return new Promise(res => setTimeout(res, SIMULATE_DELAY));
  }

  // --- KPI Stats ---
  async getDashboardStats() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.stats };
  }

  // --- Projects ---
  async getProjects(filters = {}) {
    await this._delay();
    const state = this._getState();
    let projects = [...state.projects];

    // Exclude archived unless specifically requested
    if (!filters.includeArchived) {
      projects = projects.filter(p => p.status !== "Archived");
    }

    // Filter by Status
    if (filters.status && filters.status !== "All") {
      projects = projects.filter(p => p.status === filters.status);
    }

    // Filter by Manager
    if (filters.manager && filters.manager !== "All") {
      projects = projects.filter(p => p.manager === filters.manager);
    }

    // Filter by Location
    if (filters.location && filters.location !== "All") {
      projects = projects.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
    }

    // Search query across name, client, location, manager
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      projects = projects.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.manager.toLowerCase().includes(q)
      );
    }

    return { success: true, data: projects };
  }

  async getProject(id) {
    await this._delay();
    const state = this._getState();
    const project = state.projects.find(p => p.id === id);
    if (!project) return { success: false, message: "Project not found" };
    return { success: true, data: project };
  }

  async createProject(projectData) {
    await this._delay();
    const state = this._getState();
    const newId = "PRJ-" + Math.floor(100 + Math.random() * 900);
    const newProject = {
      id: newId,
      name: projectData.name,
      client: projectData.client || "Client Not Specified",
      location: projectData.location || "India",
      manager: projectData.manager || "Kashish Patel",
      progress: parseInt(projectData.progress, 10) || 0,
      budget: parseFloat(projectData.budget) || 10000000,
      committedCost: 0,
      actualCost: 0,
      startDate: projectData.startDate || new Date().toISOString().split("T")[0],
      deadline: projectData.deadline || "2027-12-31",
      status: projectData.status || "Planning",
      description: projectData.description || "Project description...",
      image: projectData.image || "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
      workersOnSite: 0,
      tasksTotal: 0,
      tasksCompleted: 0,
      milestonesTotal: 0,
      milestonesCompleted: 0,
      team: [
        { name: projectData.manager || "Kashish Patel", role: "Project Manager", email: "kashish.patel@buildora.com", phone: "+91 98765 43210" }
      ],
      issues: [],
      recentActivities: [
        { user: projectData.manager || "Kashish Patel", action: "Created Project Workspace", time: "Just now" }
      ]
    };

    state.projects.unshift(newProject);
    state.stats.activeProjects = state.projects.filter(p => p.status === "Active").length;
    this._saveState(state);
    return { success: true, data: newProject, message: "Project created successfully." };
  }

  async updateProject(id, updatedFields) {
    await this._delay();
    const state = this._getState();
    const index = state.projects.findIndex(p => p.id === id);
    if (index === -1) return { success: false, message: "Project not found" };

    state.projects[index] = {
      ...state.projects[index],
      ...updatedFields
    };

    if (updatedFields.recentActivities) {
      state.projects[index].recentActivities = updatedFields.recentActivities;
    } else {
      state.projects[index].recentActivities.unshift({
        user: window.auth ? window.auth.getCurrentUser().name : "User",
        action: "Updated project details",
        time: "Just now"
      });
    }

    state.stats.activeProjects = state.projects.filter(p => p.status === "Active").length;
    this._saveState(state);
    return { success: true, data: state.projects[index], message: "Project updated successfully." };
  }

  async archiveProject(id) {
    await this._delay();
    const state = this._getState();
    const project = state.projects.find(p => p.id === id);
    if (!project) return { success: false, message: "Project not found" };

    project.status = "Archived";
    state.stats.activeProjects = state.projects.filter(p => p.status === "Active").length;
    this._saveState(state);
    return { success: true, data: project, message: `Project "${project.name}" archived.` };
  }

  // --- Milestones ---
  async getUpcomingMilestones() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.milestones };
  }

  // --- Approvals ---
  async getPendingApprovals() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.approvals.filter(a => a.status === "Pending") };
  }

  async handleApprovalAction(id, action, note = "") {
    await this._delay();
    const state = this._getState();
    const item = state.approvals.find(a => a.id === id);
    if (!item) return { success: false, message: "Item not found" };

    item.status = action === "approve" ? "Approved" : "Rejected";
    item.reviewNote = note;
    item.reviewedAt = new Date().toISOString();
    state.stats.pendingApprovals = Math.max(0, state.stats.pendingApprovals - 1);
    
    this._saveState(state);
    return { 
      success: true, 
      data: item, 
      message: `Request ${id} ${action === "approve" ? "Approved" : "Rejected"} successfully.` 
    };
  }

  // --- Site Reports ---
  async getRecentSiteReports() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.siteReports };
  }

  // --- Inventory & Low Stock ---
  async getLowStockMaterials() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.lowStockMaterials };
  }

  // --- Charts / Analytics ---
  async getAnalyticsSummary() {
    await this._delay();
    const state = this._getState();
    return {
      success: true,
      data: {
        expenseTrends: state.monthlyExpenseData,
        projectHealth: state.projectProgressData
      }
    };
  }
}

window.api = new BuildoraAPI();
