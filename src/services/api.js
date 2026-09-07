import { INITIAL_MOCK_DATA } from './mockData';

const STORAGE_KEY = 'buildora_app_state_v3';
const SIMULATE_DELAY = 60; // smooth latency simulation

class BuildoraAPIService {
  constructor() {
    this._initStorage();
  }

  _initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
    }
  }

  _getState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_MOCK_DATA;
    } catch {
      return INITIAL_MOCK_DATA;
    }
  }

  _saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

    if (!filters.includeArchived) {
      projects = projects.filter(p => p.status !== 'Archived');
    }

    if (filters.status && filters.status !== 'All') {
      projects = projects.filter(p => p.status === filters.status);
    }

    if (filters.manager && filters.manager !== 'All') {
      projects = projects.filter(p => p.manager === filters.manager);
    }

    if (filters.location && filters.location !== 'All') {
      projects = projects.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
    }

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
    if (!project) return { success: false, message: 'Project not found' };
    return { success: true, data: project };
  }

  async createProject(projectData, currentUser) {
    await this._delay();
    const state = this._getState();
    const newId = 'PRJ-' + Math.floor(100 + Math.random() * 900);
    const newProject = {
      id: newId,
      name: projectData.name,
      client: projectData.client || 'Client Developer',
      location: projectData.location || 'Site Location, India',
      manager: projectData.manager || (currentUser ? currentUser.name : 'Kashish Patel'),
      progress: parseInt(projectData.progress, 10) || 0,
      budget: (parseFloat(projectData.budget) || 10) * 10000000,
      committedCost: 0,
      actualCost: 0,
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      deadline: projectData.deadline || '2027-12-31',
      status: projectData.status || 'Planning',
      description: projectData.description || 'Project specifications and scope.',
      image: projectData.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      workersOnSite: 0,
      tasksTotal: 0,
      tasksCompleted: 0,
      milestonesTotal: 0,
      milestonesCompleted: 0,
      team: [
        { name: projectData.manager || (currentUser ? currentUser.name : 'Kashish Patel'), role: 'Project Manager', email: 'pm@buildora.com', phone: '+91 98765 43210' }
      ],
      issues: [],
      recentActivities: [
        { user: currentUser ? currentUser.name : 'Admin', action: 'Created Project Workspace', time: 'Just now' }
      ]
    };

    if (!state.projects) state.projects = [];
    state.projects.unshift(newProject);
    state.stats.activeProjects = state.projects.filter(p => p.status === 'Active').length;
    this._saveState(state);
    return { success: true, data: newProject, message: 'Project created successfully.' };
  }

  async updateProject(id, updatedFields, currentUser) {
    await this._delay();
    const state = this._getState();
    const index = (state.projects || []).findIndex(p => p.id === id);
    if (index === -1) return { success: false, message: 'Project not found' };

    state.projects[index] = {
      ...state.projects[index],
      ...updatedFields
    };

    if (!state.projects[index].recentActivities) {
      state.projects[index].recentActivities = [];
    }
    state.projects[index].recentActivities.unshift({
      user: currentUser ? currentUser.name : 'Kashish Patel',
      action: 'Updated project details',
      time: 'Just now'
    });

    state.stats.activeProjects = state.projects.filter(p => p.status === 'Active').length;
    this._saveState(state);
    return { success: true, data: state.projects[index], message: 'Project updated successfully.' };
  }

  async archiveProject(id) {
    await this._delay();
    const state = this._getState();
    const project = (state.projects || []).find(p => p.id === id);
    if (!project) return { success: false, message: 'Project not found' };

    project.status = 'Archived';
    state.stats.activeProjects = state.projects.filter(p => p.status === 'Active').length;
    this._saveState(state);
    return { success: true, data: project, message: `Project "${project.name}" archived.` };
  }

  // --- Milestones ---
  async getUpcomingMilestones() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.milestones || [] };
  }

  // --- Approvals ---
  async getPendingApprovals() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: (state.approvals || []).filter(a => a.status === 'Pending') };
  }

  async getAllApprovals() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.approvals || [] };
  }

  async handleApprovalAction(id, action, note = '') {
    await this._delay();
    const state = this._getState();
    const item = (state.approvals || []).find(a => a.id === id);
    if (!item) return { success: false, message: 'Item not found' };

    item.status = action === 'approve' ? 'Approved' : 'Rejected';
    item.reviewNote = note;
    item.reviewedAt = new Date().toISOString();
    state.stats.pendingApprovals = Math.max(0, (state.stats.pendingApprovals || 1) - 1);

    this._saveState(state);
    return {
      success: true,
      data: item,
      message: `Request ${id} ${action === 'approve' ? 'Approved' : 'Rejected'} successfully.`
    };
  }

  async createPurchaseRequest(poData, currentUser) {
    await this._delay();
    const state = this._getState();
    const newApproval = {
      id: 'APP-' + Math.floor(400 + Math.random() * 600),
      type: 'Purchase Request',
      title: poData.category || 'Material Requisition',
      project: poData.project || 'Skyline Heights',
      requestedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Site Supervisor',
      amount: poData.estimatedValue || '₹5,00,000',
      date: 'Today, Just now',
      status: 'Pending',
      vendor: poData.vendor || 'Pending Vendor Bid',
      priority: poData.priority || 'Normal'
    };

    if (!state.approvals) state.approvals = [];
    state.approvals.unshift(newApproval);
    state.stats.pendingApprovals = (state.stats.pendingApprovals || 0) + 1;
    this._saveState(state);
    return { success: true, data: newApproval, message: 'Purchase request routed for approval.' };
  }

  // --- Site Reports ---
  async getRecentSiteReports() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.siteReports || [] };
  }

  async createSiteReport(reportData, currentUser) {
    await this._delay();
    const state = this._getState();
    const newReport = {
      id: 'REP-' + Math.floor(900 + Math.random() * 100),
      date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      project: reportData.project || 'Skyline Heights',
      supervisor: currentUser ? currentUser.name : 'Sanjay Verma',
      weather: reportData.weather || 'Clear, 30°C',
      workersPresent: parseInt(reportData.workersPresent, 10) || 120,
      workCompleted: reportData.workCompleted || 'Daily concrete pouring & inspection.',
      progressToday: '+1.0%',
      issues: reportData.issues || 'None reported.',
      status: 'Submitted'
    };

    if (!state.siteReports) state.siteReports = [];
    state.siteReports.unshift(newReport);
    this._saveState(state);
    return { success: true, data: newReport, message: 'Site report submitted and synced to cloud.' };
  }

  // --- Tasks ---
  async getTasks(projectId = null) {
    await this._delay();
    const state = this._getState();
    let tasks = state.tasks || [];
    if (projectId) {
      tasks = tasks.filter(t => t.projectId === projectId);
    }
    return { success: true, data: tasks };
  }

  async createTask(taskData) {
    await this._delay();
    const state = this._getState();
    const newTask = {
      id: 'TSK-' + Math.floor(100 + Math.random() * 900),
      title: taskData.title,
      projectId: taskData.projectId || 'PRJ-101',
      project: taskData.project || 'Skyline Heights',
      assignee: taskData.assignee || 'Sanjay Verma',
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'To Do',
      startDate: taskData.startDate || new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate || '2026-09-30',
      progress: parseInt(taskData.progress, 10) || 0
    };

    if (!state.tasks) state.tasks = [];
    state.tasks.unshift(newTask);
    this._saveState(state);
    return { success: true, data: newTask, message: 'Task created successfully.' };
  }

  async updateTaskStatus(taskId, newStatus) {
    await this._delay();
    const state = this._getState();
    const task = (state.tasks || []).find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found' };
    task.status = newStatus;
    if (newStatus === 'Completed') task.progress = 100;
    this._saveState(state);
    return { success: true, data: task, message: 'Task status updated.' };
  }

  // --- Issues ---
  async getIssues(projectId = null) {
    await this._delay();
    const state = this._getState();
    let issues = state.issuesList || [];
    if (projectId) {
      issues = issues.filter(i => i.projectId === projectId);
    }
    return { success: true, data: issues };
  }

  async createIssue(issueData, currentUser) {
    await this._delay();
    const state = this._getState();
    const newIssue = {
      id: 'ISS-' + Math.floor(100 + Math.random() * 900),
      title: issueData.title,
      projectId: issueData.projectId || 'PRJ-101',
      project: issueData.project || 'Skyline Heights',
      priority: issueData.priority || 'Medium',
      status: 'Open',
      assignee: issueData.assignee || (currentUser ? currentUser.name : 'Sanjay Verma'),
      date: 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: issueData.description || 'Issue logged from site.'
    };

    if (!state.issuesList) state.issuesList = [];
    state.issuesList.unshift(newIssue);
    this._saveState(state);
    return { success: true, data: newIssue, message: 'Issue registered.' };
  }

  // --- Inventory & Low Stock ---
  async getLowStockMaterials() {
    await this._delay();
    const state = this._getState();
    return { success: true, data: state.lowStockMaterials || [] };
  }

  // --- Charts / Analytics ---
  async getAnalyticsSummary() {
    await this._delay();
    const state = this._getState();
    return {
      success: true,
      data: {
        expenseTrends: state.monthlyExpenseData || INITIAL_MOCK_DATA.monthlyExpenseData,
        projectHealth: state.projectProgressData || INITIAL_MOCK_DATA.projectProgressData
      }
    };
  }
}

export const api = new BuildoraAPIService();
