import { INITIAL_MOCK_DATA } from './mockData';

const STORAGE_KEY = 'buildora_app_state_v4';
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
      const state = data ? JSON.parse(data) : INITIAL_MOCK_DATA;
      if (state && Array.isArray(state.tasks)) {
        state.tasks = state.tasks.map(t => ({
          ...t,
          status: t.status === 'Not Started' ? 'To Do' : (t.status || 'To Do')
        }));
      }
      return state;
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
  async getMilestones(projectId = null) {
    await this._delay();
    const state = this._getState();
    let milestones = state.milestones || [];
    if (projectId) {
      milestones = milestones.filter(m => m.projectId === projectId);
    }
    return { success: true, data: milestones };
  }

  async getUpcomingMilestones(projectId = null) {
    return this.getMilestones(projectId);
  }

  async getMilestone(id) {
    await this._delay();
    const state = this._getState();
    const milestone = (state.milestones || []).find(m => m.id === id);
    if (!milestone) return { success: false, message: 'Milestone not found' };
    return { success: true, data: milestone };
  }

  async createMilestone(milestoneData) {
    await this._delay();
    const state = this._getState();
    const newId = 'MLS-' + Math.floor(10 + Math.random() * 90);
    const newMilestone = {
      id: newId,
      projectId: milestoneData.projectId || 'PRJ-101',
      project: milestoneData.project || 'Skyline Heights',
      title: milestoneData.title,
      description: milestoneData.description || '',
      dueDate: milestoneData.dueDate || new Date().toISOString().split('T')[0],
      dateFormatted: milestoneData.dueDate || new Date().toISOString().split('T')[0],
      progress: parseInt(milestoneData.progress, 10) || 0,
      responsible: milestoneData.responsible || 'Kashish Patel',
      status: milestoneData.status || 'Upcoming',
      relatedTaskIds: milestoneData.relatedTaskIds || []
    };

    if (!state.milestones) state.milestones = [];
    state.milestones.unshift(newMilestone);
    this._saveState(state);
    return { success: true, data: newMilestone, message: 'Milestone created successfully.' };
  }

  async updateMilestone(id, updatedFields) {
    await this._delay();
    const state = this._getState();
    const index = (state.milestones || []).findIndex(m => m.id === id);
    if (index === -1) return { success: false, message: 'Milestone not found' };

    state.milestones[index] = {
      ...state.milestones[index],
      ...updatedFields
    };
    this._saveState(state);
    return { success: true, data: state.milestones[index], message: 'Milestone updated successfully.' };
  }

  async archiveMilestone(id) {
    await this._delay();
    const state = this._getState();
    state.milestones = (state.milestones || []).filter(m => m.id !== id);
    this._saveState(state);
    return { success: true, message: 'Milestone archived successfully.' };
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
  async getTasks(filterOrProjectId = null) {
    await this._delay();
    const state = this._getState();
    let tasks = [...(state.tasks || [])];
    const today = new Date().toISOString().split('T')[0];

    // Mark isOverdue dynamically
    tasks = tasks.map(t => ({
      ...t,
      isOverdue: !!(t.dueDate && t.dueDate < today && t.status !== 'Completed')
    }));

    // If string passed (e.g. 'PRJ-101')
    if (typeof filterOrProjectId === 'string') {
      tasks = tasks.filter(t => t.projectId === filterOrProjectId && !t.archived);
      return { success: true, data: tasks };
    }

    const filters = filterOrProjectId || {};

    if (!filters.includeArchived) {
      tasks = tasks.filter(t => !t.archived);
    }

    if (filters.projectId && filters.projectId !== 'All') {
      tasks = tasks.filter(t => t.projectId === filters.projectId);
    }

    if (filters.status && filters.status !== 'All') {
      if (filters.status === 'Overdue') {
        tasks = tasks.filter(t => t.isOverdue);
      } else if (filters.status === 'To Do') {
        tasks = tasks.filter(t => t.status === 'To Do' || t.status === 'Not Started');
      } else {
        tasks = tasks.filter(t => t.status === filters.status);
      }
    }

    if (filters.priority && filters.priority !== 'All') {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }

    if (filters.assignee && filters.assignee !== 'All') {
      tasks = tasks.filter(t => t.assignee === filters.assignee);
    }

    if (filters.dueDate && filters.dueDate !== 'All') {
      if (filters.dueDate === 'Overdue') {
        tasks = tasks.filter(t => t.isOverdue);
      } else if (filters.dueDate === 'Today') {
        tasks = tasks.filter(t => t.dueDate === today);
      } else if (filters.dueDate === 'This Week') {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        tasks = tasks.filter(t => t.dueDate >= today && t.dueDate <= nextWeekStr);
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      tasks = tasks.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.project && t.project.toLowerCase().includes(q)) ||
        (t.assignee && t.assignee.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return { success: true, data: tasks };
  }

  async getTask(id) {
    await this._delay();
    const state = this._getState();
    const task = (state.tasks || []).find(t => t.id === id);
    if (!task) return { success: false, message: 'Task not found' };
    const today = new Date().toISOString().split('T')[0];
    return {
      success: true,
      data: {
        ...task,
        isOverdue: !!(task.dueDate && task.dueDate < today && task.status !== 'Completed')
      }
    };
  }

  async createTask(taskData) {
    await this._delay();
    const state = this._getState();
    const today = new Date().toISOString().split('T')[0];
    const newId = 'TSK-' + Math.floor(100 + Math.random() * 900);
    const newTask = {
      id: newId,
      title: taskData.title,
      description: taskData.description || '',
      projectId: taskData.projectId || 'PRJ-101',
      project: taskData.project || 'Skyline Heights',
      assignee: taskData.assignee || 'Sanjay Verma',
      priority: taskData.priority || 'Medium',
      status: taskData.status === 'Not Started' ? 'To Do' : (taskData.status || 'To Do'),
      startDate: taskData.startDate || today,
      dueDate: taskData.dueDate || '2026-09-30',
      progress: parseInt(taskData.progress, 10) || 0,
      dependencies: Array.isArray(taskData.dependencies) ? taskData.dependencies : [],
      createdAt: today,
      updatedAt: today,
      archived: false
    };

    if (newTask.status === 'Completed' && newTask.progress < 100) {
      newTask.progress = 100;
    } else if (newTask.progress === 100 && newTask.status !== 'Completed') {
      newTask.status = 'Completed';
    }

    if (!state.tasks) state.tasks = [];
    state.tasks.unshift(newTask);
    this._saveState(state);
    return { success: true, data: newTask, message: 'Task created successfully.' };
  }

  async updateTask(id, updatedFields) {
    await this._delay();
    const state = this._getState();
    const index = (state.tasks || []).findIndex(t => t.id === id);
    if (index === -1) return { success: false, message: 'Task not found' };

    const today = new Date().toISOString().split('T')[0];
    const current = state.tasks[index];
    const updated = {
      ...current,
      ...updatedFields,
      updatedAt: today
    };

    if (updated.status === 'Completed' && updated.progress < 100) {
      updated.progress = 100;
    } else if (updated.progress === 100 && updated.status !== 'Completed') {
      updated.status = 'Completed';
    }

    state.tasks[index] = updated;
    this._saveState(state);
    return { success: true, data: updated, message: 'Task updated successfully.' };
  }

  async updateTaskStatus(taskId, newStatus) {
    await this._delay();
    const state = this._getState();
    const task = (state.tasks || []).find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Task not found' };
    task.status = newStatus === 'Not Started' ? 'To Do' : newStatus;
    if (task.status === 'Completed') task.progress = 100;
    task.updatedAt = new Date().toISOString().split('T')[0];
    this._saveState(state);
    return { success: true, data: task, message: `Task moved to ${newStatus}.` };
  }

  async archiveTask(id) {
    await this._delay();
    const state = this._getState();
    const task = (state.tasks || []).find(t => t.id === id);
    if (!task) return { success: false, message: 'Task not found' };
    task.archived = true;
    task.updatedAt = new Date().toISOString().split('T')[0];
    this._saveState(state);
    return { success: true, data: task, message: 'Task archived successfully.' };
  }

  async getTaskSummaryStats(projectId = null) {
    await this._delay();
    const state = this._getState();
    let tasks = (state.tasks || []).filter(t => !t.archived);
    if (projectId) {
      tasks = tasks.filter(t => t.projectId === projectId);
    }
    const today = new Date().toISOString().split('T')[0];

    const total = tasks.length;
    const toDo = tasks.filter(t => t.status === 'To Do' || t.status === 'Not Started').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const review = tasks.filter(t => t.status === 'Review').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'Completed').length;
    const blocked = tasks.filter(t => t.status === 'Blocked').length;

    return {
      success: true,
      data: { total, toDo, inProgress, review, completed, overdue, blocked }
    };
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
