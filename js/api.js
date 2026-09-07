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
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      localStorage.setItem(this.storageKey, JSON.stringify(window.BUILDORA_MOCK_DATA));
    } else {
      try {
        const parsed = JSON.parse(existing);
        // Ensure tasks and updated milestones exist in storage if upgraded
        let modified = false;
        if (!parsed.tasks || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
          parsed.tasks = window.BUILDORA_MOCK_DATA.tasks || [];
          modified = true;
        }
        if (!parsed.milestones || parsed.milestones.length === 0 || !parsed.milestones[0].projectId) {
          parsed.milestones = window.BUILDORA_MOCK_DATA.milestones || [];
          modified = true;
        }
        if (modified) {
          localStorage.setItem(this.storageKey, JSON.stringify(parsed));
        }
      } catch (e) {
        localStorage.setItem(this.storageKey, JSON.stringify(window.BUILDORA_MOCK_DATA));
      }
    }
  }

  _getState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const state = data ? JSON.parse(data) : window.BUILDORA_MOCK_DATA;
      if (!state.tasks) state.tasks = window.BUILDORA_MOCK_DATA.tasks || [];
      if (!state.milestones) state.milestones = window.BUILDORA_MOCK_DATA.milestones || [];
      return state;
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
    let projects = [...(state.projects || [])];

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
    const project = (state.projects || []).find(p => p.id === id);
    if (!project) return { success: false, message: "Project not found" };
    return { success: true, data: project };
  }

  async createProject(projectData) {
    await this._delay();
    const state = this._getState();
    if (!state.projects) state.projects = [];
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
    if (!state.projects) state.projects = [];
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
    if (!state.projects) state.projects = [];
    const project = state.projects.find(p => p.id === id);
    if (!project) return { success: false, message: "Project not found" };

    project.status = "Archived";
    state.stats.activeProjects = state.projects.filter(p => p.status === "Active").length;
    this._saveState(state);
    return { success: true, data: project, message: `Project "${project.name}" archived.` };
  }

  // --- Tasks ---
  async getTasks(filters = {}) {
    await this._delay();
    const state = this._getState();
    let tasks = [...(state.tasks || [])];
    const projects = state.projects || [];
    const projectMap = new Map(projects.map(p => [p.id, p]));

    // Exclude archived unless requested
    if (!filters.includeArchived) {
      tasks = tasks.filter(t => t.status !== "Archived");
    }

    // Filter by Project
    if (filters.projectId && filters.projectId !== "All") {
      tasks = tasks.filter(t => t.projectId === filters.projectId);
    }

    // Filter by Status
    if (filters.status && filters.status !== "All") {
      if (filters.status === "Overdue") {
        const today = new Date().toISOString().split("T")[0];
        tasks = tasks.filter(t => t.status !== "Completed" && t.dueDate && t.dueDate < today);
      } else {
        tasks = tasks.filter(t => t.status === filters.status);
      }
    }

    // Filter by Priority
    if (filters.priority && filters.priority !== "All") {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }

    // Filter by Assignee
    if (filters.assignee && filters.assignee !== "All") {
      tasks = tasks.filter(t => t.assignee === filters.assignee);
    }

    // Filter by Due Date timeframe
    if (filters.dueDateFilter && filters.dueDateFilter !== "All") {
      const todayStr = new Date().toISOString().split("T")[0];
      const today = new Date();
      if (filters.dueDateFilter === "overdue") {
        tasks = tasks.filter(t => t.status !== "Completed" && t.dueDate && t.dueDate < todayStr);
      } else if (filters.dueDateFilter === "today") {
        tasks = tasks.filter(t => t.dueDate === todayStr);
      } else if (filters.dueDateFilter === "week") {
        const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        tasks = tasks.filter(t => t.dueDate >= todayStr && t.dueDate <= weekLater);
      } else if (filters.dueDateFilter === "month") {
        const monthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        tasks = tasks.filter(t => t.dueDate >= todayStr && t.dueDate <= monthLater);
      }
    }

    // Search query across title, description, assignee, project name
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      tasks = tasks.filter(t => {
        const proj = projectMap.get(t.projectId);
        const projName = proj ? proj.name.toLowerCase() : "";
        const title = (t.title || "").toLowerCase();
        const desc = (t.description || "").toLowerCase();
        const assignee = (t.assignee || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || assignee.includes(q) || projName.includes(q);
      });
    }

    // Enrich with projectName for easy UI consumption
    const enriched = tasks.map(t => {
      const proj = projectMap.get(t.projectId);
      return {
        ...t,
        projectName: proj ? proj.name : t.projectId
      };
    });

    return { success: true, data: enriched };
  }

  async getTask(id) {
    await this._delay();
    const state = this._getState();
    const task = (state.tasks || []).find(t => t.id === id);
    if (!task) return { success: false, message: "Task not found" };

    const project = (state.projects || []).find(p => p.id === task.projectId);
    return {
      success: true,
      data: {
        ...task,
        projectName: project ? project.name : task.projectId
      }
    };
  }

  async createTask(taskData) {
    await this._delay();
    const state = this._getState();
    if (!state.tasks) state.tasks = [];

    const newId = "TASK-" + Math.floor(100 + Math.random() * 900);
    const now = new Date().toISOString();

    const newTask = {
      id: newId,
      projectId: taskData.projectId,
      title: taskData.title.trim(),
      description: taskData.description ? taskData.description.trim() : "",
      assignee: taskData.assignee || "Unassigned",
      status: taskData.status || "Not Started",
      priority: taskData.priority || "Medium",
      startDate: taskData.startDate || now.split("T")[0],
      dueDate: taskData.dueDate || now.split("T")[0],
      progress: Math.min(100, Math.max(0, parseInt(taskData.progress, 10) || 0)),
      dependencies: Array.isArray(taskData.dependencies) ? taskData.dependencies : [],
      createdAt: now,
      updatedAt: now
    };

    // Recalculate status if completed / overdue
    if (newTask.progress === 100) {
      newTask.status = "Completed";
    }

    state.tasks.unshift(newTask);

    // Update project stats
    const project = (state.projects || []).find(p => p.id === newTask.projectId);
    if (project) {
      const projTasks = state.tasks.filter(t => t.projectId === project.id && t.status !== "Archived");
      project.tasksTotal = projTasks.length;
      project.tasksCompleted = projTasks.filter(t => t.status === "Completed").length;
    }

    this._saveState(state);
    return { success: true, data: newTask, message: "Task created successfully." };
  }

  async updateTask(id, updatedFields) {
    await this._delay();
    const state = this._getState();
    if (!state.tasks) state.tasks = [];
    const index = state.tasks.findIndex(t => t.id === id);
    if (index === -1) return { success: false, message: "Task not found" };

    const oldTask = state.tasks[index];
    const now = new Date().toISOString();

    const progressVal = updatedFields.progress !== undefined ? parseInt(updatedFields.progress, 10) : oldTask.progress;
    let statusVal = updatedFields.status !== undefined ? updatedFields.status : oldTask.status;
    if (progressVal === 100 && statusVal !== "Archived") {
      statusVal = "Completed";
    }

    state.tasks[index] = {
      ...oldTask,
      ...updatedFields,
      progress: Math.min(100, Math.max(0, isNaN(progressVal) ? 0 : progressVal)),
      status: statusVal,
      updatedAt: now
    };

    // Update project stats
    const updatedTask = state.tasks[index];
    const project = (state.projects || []).find(p => p.id === updatedTask.projectId);
    if (project) {
      const projTasks = state.tasks.filter(t => t.projectId === project.id && t.status !== "Archived");
      project.tasksTotal = projTasks.length;
      project.tasksCompleted = projTasks.filter(t => t.status === "Completed").length;
    }

    this._saveState(state);
    return { success: true, data: state.tasks[index], message: "Task updated successfully." };
  }

  async archiveTask(id) {
    await this._delay();
    const state = this._getState();
    if (!state.tasks) state.tasks = [];
    const task = state.tasks.find(t => t.id === id);
    if (!task) return { success: false, message: "Task not found" };

    task.status = "Archived";
    task.updatedAt = new Date().toISOString();

    // Update project stats
    const project = (state.projects || []).find(p => p.id === task.projectId);
    if (project) {
      const projTasks = state.tasks.filter(t => t.projectId === project.id && t.status !== "Archived");
      project.tasksTotal = projTasks.length;
      project.tasksCompleted = projTasks.filter(t => t.status === "Completed").length;
    }

    this._saveState(state);
    return { success: true, data: task, message: `Task "${task.title}" archived.` };
  }

  async getTaskStats(projectId = null) {
    await this._delay();
    const state = this._getState();
    let tasks = (state.tasks || []).filter(t => t.status !== "Archived");
    if (projectId && projectId !== "All") {
      tasks = tasks.filter(t => t.projectId === projectId);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed" || t.progress === 100).length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const blocked = tasks.filter(t => t.status === "Blocked").length;
    const overdue = tasks.filter(t => t.status !== "Completed" && t.dueDate && t.dueDate < todayStr).length;

    return {
      success: true,
      data: {
        total,
        inProgress,
        completed,
        overdue,
        blocked
      }
    };
  }

  // --- Milestones ---
  async getMilestones(filters = {}) {
    await this._delay();
    const state = this._getState();
    let milestones = [...(state.milestones || [])];
    const projects = state.projects || [];
    const projectMap = new Map(projects.map(p => [p.id, p]));

    if (!filters.includeArchived) {
      milestones = milestones.filter(m => m.status !== "Archived");
    }

    if (filters.projectId && filters.projectId !== "All") {
      milestones = milestones.filter(m => m.projectId === filters.projectId);
    }

    if (filters.status && filters.status !== "All") {
      milestones = milestones.filter(m => m.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      milestones = milestones.filter(m => {
        const proj = projectMap.get(m.projectId);
        const projName = proj ? proj.name.toLowerCase() : "";
        return (m.title || "").toLowerCase().includes(q) ||
               (m.description || "").toLowerCase().includes(q) ||
               (m.responsible || "").toLowerCase().includes(q) ||
               projName.includes(q);
      });
    }

    const enriched = milestones.map(m => {
      const proj = projectMap.get(m.projectId);
      return {
        ...m,
        projectName: proj ? proj.name : (m.project || m.projectId)
      };
    });

    return { success: true, data: enriched };
  }

  async getMilestone(id) {
    await this._delay();
    const state = this._getState();
    const milestone = (state.milestones || []).find(m => m.id === id);
    if (!milestone) return { success: false, message: "Milestone not found" };
    const project = (state.projects || []).find(p => p.id === milestone.projectId);
    return {
      success: true,
      data: {
        ...milestone,
        projectName: project ? project.name : (milestone.project || milestone.projectId)
      }
    };
  }

  async createMilestone(milestoneData) {
    await this._delay();
    const state = this._getState();
    if (!state.milestones) state.milestones = [];

    const newId = "MLS-" + Math.floor(10 + Math.random() * 90);
    const dateFormatted = milestoneData.dueDate ? new Date(milestoneData.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "TBD";

    const newMilestone = {
      id: newId,
      projectId: milestoneData.projectId,
      title: milestoneData.title.trim(),
      description: milestoneData.description ? milestoneData.description.trim() : "",
      dueDate: milestoneData.dueDate || new Date().toISOString().split("T")[0],
      dateFormatted: dateFormatted,
      status: milestoneData.status || "Upcoming",
      progress: Math.min(100, Math.max(0, parseInt(milestoneData.progress, 10) || 0)),
      responsible: milestoneData.responsible || "Kashish Patel",
      relatedTaskIds: Array.isArray(milestoneData.relatedTaskIds) ? milestoneData.relatedTaskIds : []
    };

    if (newMilestone.progress === 100) {
      newMilestone.status = "Completed";
    }

    state.milestones.unshift(newMilestone);

    // Update project stats
    const project = (state.projects || []).find(p => p.id === newMilestone.projectId);
    if (project) {
      const projMilestones = state.milestones.filter(m => m.projectId === project.id && m.status !== "Archived");
      project.milestonesTotal = projMilestones.length;
      project.milestonesCompleted = projMilestones.filter(m => m.status === "Completed").length;
    }

    this._saveState(state);
    return { success: true, data: newMilestone, message: "Milestone created successfully." };
  }

  async updateMilestone(id, updatedFields) {
    await this._delay();
    const state = this._getState();
    if (!state.milestones) state.milestones = [];
    const index = state.milestones.findIndex(m => m.id === id);
    if (index === -1) return { success: false, message: "Milestone not found" };

    const old = state.milestones[index];
    const progressVal = updatedFields.progress !== undefined ? parseInt(updatedFields.progress, 10) : old.progress;
    let statusVal = updatedFields.status !== undefined ? updatedFields.status : old.status;
    if (progressVal === 100 && statusVal !== "Archived") {
      statusVal = "Completed";
    }

    let dateFormatted = old.dateFormatted;
    if (updatedFields.dueDate && updatedFields.dueDate !== old.dueDate) {
      dateFormatted = new Date(updatedFields.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    state.milestones[index] = {
      ...old,
      ...updatedFields,
      progress: Math.min(100, Math.max(0, isNaN(progressVal) ? 0 : progressVal)),
      status: statusVal,
      dateFormatted
    };

    const updatedMilestone = state.milestones[index];
    const project = (state.projects || []).find(p => p.id === updatedMilestone.projectId);
    if (project) {
      const projMilestones = state.milestones.filter(m => m.projectId === project.id && m.status !== "Archived");
      project.milestonesTotal = projMilestones.length;
      project.milestonesCompleted = projMilestones.filter(m => m.status === "Completed").length;
    }

    this._saveState(state);
    return { success: true, data: state.milestones[index], message: "Milestone updated successfully." };
  }

  async archiveMilestone(id) {
    await this._delay();
    const state = this._getState();
    if (!state.milestones) state.milestones = [];
    const milestone = state.milestones.find(m => m.id === id);
    if (!milestone) return { success: false, message: "Milestone not found" };

    milestone.status = "Archived";

    const project = (state.projects || []).find(p => p.id === milestone.projectId);
    if (project) {
      const projMilestones = state.milestones.filter(m => m.projectId === project.id && m.status !== "Archived");
      project.milestonesTotal = projMilestones.length;
      project.milestonesCompleted = projMilestones.filter(m => m.status === "Completed").length;
    }

    this._saveState(state);
    return { success: true, data: milestone, message: `Milestone "${milestone.title}" archived.` };
  }

  async getUpcomingMilestones() {
    return this.getMilestones({ status: "In Progress" });
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
