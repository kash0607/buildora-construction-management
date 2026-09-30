/**
 * BUILDORA — Production API Service Layer
 * Connects React UI components to Express REST APIs with JWT authentication.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'buildora_auth_token';

// Local storage token helpers
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Standardized HTTP Request Client with Bearer token header injection,
 * JSON serialization, and structured error handling.
 */
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        data?.message ||
        (data?.errors ? Object.values(data.errors).join(', ') : `Request failed with status ${res.status}`);

      return {
        success: false,
        status: res.status,
        message,
        errors: data?.errors,
      };
    }

    return data || { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network error connecting to Buildora server',
    };
  }
}

class BuildoraAPIService {
  // ==========================================
  // 1. AUTHENTICATION
  // ==========================================
  async register(userData) {
    const body = {
      name: (userData.fullName || userData.name || '').trim(),
      email: (userData.email || '').trim(),
      password: userData.password,
      role: userData.role || 'Project Manager',
      phone: userData.phone || '',
    };

    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }

    return res;
  }

  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }

    return res;
  }

  async getMe() {
    return await request('/auth/me', { method: 'GET' });
  }

  async getUsers(role = null) {
    const q = role && role !== 'All' ? `?role=${encodeURIComponent(role)}` : '';
    return await request(`/auth/users${q}`, { method: 'GET' });
  }

  logout() {
    setAuthToken(null);
    try {
      localStorage.removeItem('buildora_auth_session');
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // 2. PROJECTS
  // ==========================================
  async getProjects(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.manager && filters.manager !== 'All') params.append('manager', filters.manager);
    if (filters.search) params.append('search', filters.search);
    if (filters.includeArchived) params.append('includeArchived', 'true');

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/projects${queryStr}`, { method: 'GET' });

    if (!res.success) return res;

    // Filter location on client side if requested
    let projects = res.data || [];
    if (filters.location && filters.location !== 'All') {
      const loc = filters.location.toLowerCase();
      projects = projects.filter((p) => (p.location || '').toLowerCase().includes(loc));
    }

    return { success: true, data: projects };
  }

  async getProject(id) {
    return await request(`/projects/${id}`, { method: 'GET' });
  }

  async createProject(projectData, currentUser) {
    let budgetNum = parseFloat(projectData.budget) || 0;
    // If entered in Cr (e.g. 15.5), convert to rupees
    if (budgetNum > 0 && budgetNum < 10000) {
      budgetNum = budgetNum * 10000000;
    }

    const payload = {
      name: projectData.name,
      client: projectData.client || 'Client Developer',
      location: projectData.location || 'Site Location, India',
      manager: projectData.manager || (currentUser ? currentUser.name : 'Project Manager'),
      budget: budgetNum,
      status: projectData.status === 'On Hold' ? 'Planning' : (projectData.status || 'Planning'),
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      deadline: projectData.deadline || '2028-12-31',
      description: projectData.description || '',
      image: projectData.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      managerUser: projectData.managerUser || undefined,
      clientUser: projectData.clientUser || undefined,
      assignedUsers: projectData.assignedUsers || undefined,
    };

    return await request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateProject(id, updatedFields, currentUser) {
    const payload = { ...updatedFields };

    if (payload.budget !== undefined) {
      let budgetNum = parseFloat(payload.budget) || 0;
      if (budgetNum > 0 && budgetNum < 10000) {
        payload.budget = budgetNum * 10000000;
      }
    }

    if (payload.status === 'On Hold') {
      payload.status = 'Planning';
    }

    return await request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async archiveProject(id) {
    return await request(`/projects/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 3. TASKS
  // ==========================================
  async getTasks(filterOrProjectId = null) {
    const params = new URLSearchParams();

    if (typeof filterOrProjectId === 'string') {
      params.append('project', filterOrProjectId);
      params.append('includeArchived', 'false');
    } else if (filterOrProjectId && typeof filterOrProjectId === 'object') {
      const f = filterOrProjectId;
      if (f.projectId && f.projectId !== 'All') params.append('project', f.projectId);
      if (f.project && f.project !== 'All') params.append('project', f.project);
      if (f.status && f.status !== 'All' && f.status !== 'Overdue') params.append('status', f.status);
      if (f.priority && f.priority !== 'All') params.append('priority', f.priority);
      if (f.assignee && f.assignee !== 'All') params.append('assignee', f.assignee);
      if (f.search) params.append('search', f.search);
      if (f.includeArchived) params.append('includeArchived', 'true');
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/tasks${queryStr}`, { method: 'GET' });

    if (!res.success) return res;

    const today = new Date().toISOString().split('T')[0];
    let tasks = (res.data || []).map((t) => {
      const dueStr = t.dueDate ? String(t.dueDate).split('T')[0] : '';
      const startStr = t.startDate ? String(t.startDate).split('T')[0] : '';
      return {
        ...t,
        id: t.taskId || t.id || t._id,
        startDate: startStr,
        dueDate: dueStr,
        isOverdue: !!(dueStr && dueStr < today && t.status !== 'Completed'),
      };
    });

    // Handle due date filter on client if specified
    if (typeof filterOrProjectId === 'object' && filterOrProjectId?.dueDate && filterOrProjectId.dueDate !== 'All') {
      const ddf = filterOrProjectId.dueDate;
      if (ddf === 'Overdue') {
        tasks = tasks.filter((t) => t.isOverdue);
      } else if (ddf === 'Today') {
        tasks = tasks.filter((t) => t.dueDate === today);
      } else if (ddf === 'This Week') {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        tasks = tasks.filter((t) => t.dueDate >= today && t.dueDate <= nextWeekStr);
      }
    }

    return { success: true, data: tasks };
  }

  async getTask(id) {
    const res = await request(`/tasks/${id}`, { method: 'GET' });
    if (res.success && res.data) {
      const today = new Date().toISOString().split('T')[0];
      const dueStr = res.data.dueDate ? String(res.data.dueDate).split('T')[0] : '';
      res.data = {
        ...res.data,
        id: res.data.taskId || res.data.id || res.data._id,
        dueDate: dueStr,
        isOverdue: !!(dueStr && dueStr < today && res.data.status !== 'Completed'),
      };
    }
    return res;
  }

  async createTask(taskData) {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      project: taskData.projectId || taskData.project || '',
      projectId: taskData.projectId || taskData.project || '',
      assignee: taskData.assignee || (currentUser ? currentUser.name : 'Unassigned'),
      priority: taskData.priority || 'Medium',
      status: taskData.status === 'Not Started' ? 'To Do' : (taskData.status || 'To Do'),
      startDate: taskData.startDate || today,
      dueDate: taskData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      progress: parseInt(taskData.progress, 10) || 0,
      dependencies: Array.isArray(taskData.dependencies) ? taskData.dependencies : [],
    };

    return await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTask(id, updatedFields) {
    const payload = { ...updatedFields };
    if (payload.status === 'Not Started') payload.status = 'To Do';
    if (payload.status === 'Completed') payload.progress = 100;

    return await request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async updateTaskStatus(taskId, newStatus) {
    const payload = {
      status: newStatus === 'Not Started' ? 'To Do' : newStatus,
    };
    if (newStatus === 'Completed') {
      payload.progress = 100;
    }

    return await request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async archiveTask(id) {
    return await request(`/tasks/${id}`, { method: 'DELETE' });
  }

  async getTaskSummaryStats(projectId = null) {
    const queryStr = projectId && projectId !== 'All' ? `?project=${projectId}` : '';
    return await request(`/tasks/stats/summary${queryStr}`, { method: 'GET' });
  }

  // ==========================================
  // 4. MATERIALS
  // ==========================================
  async getMaterials(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);
    if (filters.search) params.append('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/materials${queryStr}`, { method: 'GET' });

    if (!res.success) return res;

    const materials = (res.data || []).map((m) => ({
      ...m,
      id: m.materialId || m.id || m._id,
    }));

    return { success: true, data: materials };
  }

  async getMaterial(id) {
    const res = await request(`/materials/${id}`, { method: 'GET' });
    if (res.success && res.data) {
      res.data.id = res.data.materialId || res.data.id || res.data._id;
    }
    return res;
  }

  async createMaterial(materialData, currentUser) {
    const payload = {
      name: materialData.name,
      category: materialData.category || 'Structural & Civil',
      unit: materialData.unit || 'bag',
      description: materialData.description || '',
      projectId: materialData.projectId || materialData.project || '',
      projectName: materialData.projectName || materialData.project || 'General Store',
      currentStock: Number(materialData.currentStock) || 0,
      minimumStock: Number(materialData.minimumStock) || 0,
      reorderLevel: Number(materialData.reorderLevel) || 10,
      unitCost: Number(materialData.unitCost) || 0,
    };

    return await request('/materials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMaterial(id, updatedFields) {
    return await request(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
  }

  async getLowStockMaterials() {
    const res = await request('/materials/alerts/low-stock', { method: 'GET' });
    if (res.success && Array.isArray(res.data)) {
      res.data = res.data.map((m) => ({
        ...m,
        id: m.materialId || m.id || m._id,
      }));
    }
    return res;
  }

  // ==========================================
  // 5. INVENTORY MOVEMENTS
  // ==========================================
  async getInventoryTransactions() {
    const res = await request('/inventory/transactions', { method: 'GET' });
    if (res.success && Array.isArray(res.data)) {
      res.data = res.data.map((t) => ({
        ...t,
        id: t.transactionId || t.id || t._id,
        date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
      }));
    }
    return res;
  }

  async receiveStock(data, currentUser) {
    const payload = {
      materialId: data.materialId,
      quantity: Number(data.quantity),
      unit: data.unit,
      reference: data.reference || 'GRN-MANUAL',
      notes: data.notes || '',
    };

    return await request('/inventory/receive', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async issueStock(data, currentUser) {
    const payload = {
      materialId: data.materialId,
      quantity: Number(data.quantity),
      unit: data.unit,
      reference: data.reference || 'ISS-SITE',
      notes: data.notes || '',
    };

    return await request('/inventory/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async adjustStock(data, currentUser) {
    const payload = {
      materialId: data.materialId,
      newStock: Number(data.newStock),
      unit: data.unit,
      reference: data.reference || 'AUDIT-ADJ',
      notes: data.notes || '',
    };

    return await request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 6. MATERIAL REQUESTS
  // ==========================================
  async getMaterialRequests(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/material-requests${queryStr}`, { method: 'GET' });

    if (!res.success) return res;

    const requests = (res.data || []).map((r) => ({
      ...r,
      id: r.requestId || r.id || r._id,
      requiredByDate: r.requiredByDate ? String(r.requiredByDate).split('T')[0] : '',
    }));

    return { success: true, data: requests };
  }

  async createMaterialRequest(reqData, currentUser) {
    const payload = {
      materialName: reqData.materialName,
      projectId: reqData.projectId || reqData.project || '',
      projectName: reqData.projectName || 'Site Operation',
      quantity: Number(reqData.quantity) || 1,
      unit: reqData.unit || 'units',
      requiredByDate: reqData.requiredByDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: reqData.notes || '',
    };

    return await request('/material-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMaterialRequestStatus(id, status, notes = '') {
    return await request(`/material-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewNotes: notes }),
    });
  }

  // ==========================================
  // 7. KPI STATS & ANALYTICS
  // ==========================================
  async getDashboardStats() {
    const res = await request('/dashboard/stats', { method: 'GET' });
    if (res.success && res.data) {
      return res;
    }

    // Fallback if network issue
    return {
      success: true,
      data: {
        activeProjects: 0,
        totalProjects: 0,
        activeProjectsTrend: '0 active',
        totalBudget: 0,
        totalBudgetFormatted: '₹0.0 Cr',
        budgetUsed: 0,
        budgetUsedFormatted: '₹0.0 Cr',
        budgetPercentage: 0,
        pendingApprovals: 0,
        pendingApprovalsUrgent: 0,
        overdueTasks: 0,
        lowStockItems: 0,
      },
    };
  }

  async getAnalyticsSummary() {
    const res = await request('/dashboard/analytics', { method: 'GET' });
    if (res.success && res.data) {
      return res;
    }

    return {
      success: true,
      data: {
        expenseTrends: {
          labels: ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'],
          budgeted: [0, 0, 0, 0, 0, 0],
          actual: [0, 0, 0, 0, 0, 0],
        },
        projectHealth: {
          labels: ['Completed', 'Active On-Track', 'Under Review', 'Planning'],
          counts: [0, 0, 0, 0],
          colors: ['#2E7D32', '#6B4F3A', '#D97706', '#8A684C'],
        },
      },
    };
  }

  // ==========================================
  // 8. SECONDARY WORKSPACE ENTITIES (Milestones, Reports, Issues, Approvals)
  // ==========================================
  async getMilestones(projectId = null) {
    const queryStr = projectId && projectId !== 'All' ? `?project=${encodeURIComponent(projectId)}` : '';
    const res = await request(`/milestones${queryStr}`, { method: 'GET' });

    if (!res.success) return res;

    const milestones = (res.data || []).map((m) => ({
      ...m,
      id: m.milestoneId || m.id || m._id,
      dueDate: m.dueDate ? String(m.dueDate).split('T')[0] : '',
    }));

    return { success: true, data: milestones };
  }

  async getUpcomingMilestones(projectId = null) {
    return this.getMilestones(projectId);
  }

  async getMilestone(id) {
    const res = await request(`/milestones/${id}`, { method: 'GET' });
    if (res.success && res.data) {
      res.data.id = res.data.milestoneId || res.data.id || res.data._id;
      if (res.data.dueDate) {
        res.data.dueDate = String(res.data.dueDate).split('T')[0];
      }
    }
    return res;
  }

  async createMilestone(milestoneData, currentUser) {
    const payload = {
      title: milestoneData.title,
      dueDate: milestoneData.dueDate,
      responsible: milestoneData.responsible || (currentUser ? currentUser.name : 'Project Manager'),
      projectId: milestoneData.projectId || milestoneData.project || '',
      progress: parseInt(milestoneData.progress, 10) || 0,
      status: milestoneData.status || 'Upcoming',
      description: milestoneData.description || '',
    };

    return await request('/milestones', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMilestone(id, updatedFields) {
    return await request(`/milestones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
  }

  async archiveMilestone(id) {
    return await request(`/milestones/${id}`, { method: 'DELETE' });
  }

  async getRecentSiteReports(projectId = null) {
    const queryStr = projectId && projectId !== 'All' ? `?project=${encodeURIComponent(projectId)}` : '';
    const res = await request(`/site-reports${queryStr}`, { method: 'GET' });

    if (!res.success) return res;

    const reports = (res.data || []).map((r) => ({
      ...r,
      id: r.reportId || r.id || r._id,
      project: r.projectName || r.project,
    }));

    return { success: true, data: reports };
  }

  async createSiteReport(reportData, currentUser) {
    const payload = {
      project: reportData.project,
      projectName: reportData.projectName || reportData.project,
      weather: reportData.weather,
      workersPresent: Number(reportData.workersPresent) || 0,
      workCompleted: reportData.workCompleted,
      progressToday: reportData.progressToday || '+0.8%',
      issues: reportData.issues || 'None reported.',
      supervisor: currentUser ? currentUser.name : reportData.supervisor,
    };

    return await request('/site-reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getIssues(projectId = null) {
    const queryStr = projectId && projectId !== 'All' ? `?project=${encodeURIComponent(projectId)}` : '';
    const res = await request(`/issues${queryStr}`, { method: 'GET' });

    if (!res.success) return res;

    const issues = (res.data || []).map((i) => ({
      ...i,
      id: i.issueId || i.id || i._id,
      project: i.projectName || i.project,
    }));

    return { success: true, data: issues };
  }

  async createIssue(issueData, currentUser) {
    const payload = {
      title: issueData.title,
      project: issueData.project,
      priority: issueData.priority || 'Medium',
      assignee: issueData.assignee || (currentUser ? currentUser.name : 'Unassigned'),
      description: issueData.description || '',
    };

    return await request('/issues', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAllApprovals(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/approvals${queryStr}`, { method: 'GET' });

    if (!res.success) return res;

    const approvals = (res.data || []).map((a) => ({
      ...a,
      id: a.approvalId || a.id || a._id,
      project: a.projectName || a.project,
    }));

    return { success: true, data: approvals };
  }

  async getPendingApprovals() {
    const res = await request('/approvals/pending', { method: 'GET' });
    if (!res.success) return res;

    const approvals = (res.data || []).map((a) => ({
      ...a,
      id: a.approvalId || a.id || a._id,
      project: a.projectName || a.project,
    }));

    return { success: true, data: approvals };
  }

  async handleApprovalAction(id, action, note = '') {
    return await request(`/approvals/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, notes: note }),
    });
  }

  async createPurchaseRequest(poData, currentUser) {
    const payload = {
      project: poData.project,
      category: poData.category,
      title: poData.title || poData.category,
      estimatedValue: poData.estimatedValue,
      amount: poData.amount || poData.estimatedValue,
      vendor: poData.vendor,
      priority: poData.priority || 'Normal',
      type: poData.type || 'Purchase Request',
      requestedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : poData.requestedBy,
    };

    return await request('/approvals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  // ==========================================
  // 9. PROCUREMENT & VENDORS
  // ==========================================
  async getVendors(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/procurement/vendors${q}`, { method: 'GET' });
  }

  async getVendor(id) {
    return await request(`/procurement/vendors/${id}`, { method: 'GET' });
  }

  async createVendor(data) {
    return await request('/procurement/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(id, data) {
    return await request(`/procurement/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(id) {
    return await request(`/procurement/vendors/${id}`, { method: 'DELETE' });
  }

  async getProcurementRequests(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/procurement/requests${q}`, { method: 'GET' });
  }

  async createProcurementRequest(data) {
    return await request('/procurement/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProcurementRequestStatus(id, status, notes = '') {
    return await request(`/procurement/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getPurchaseOrders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);
    if (filters.vendor && filters.vendor !== 'All') params.append('vendor', filters.vendor);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/procurement/orders${q}`, { method: 'GET' });
  }

  async getPurchaseOrder(id) {
    return await request(`/procurement/orders/${id}`, { method: 'GET' });
  }

  async createPurchaseOrder(data) {
    return await request('/procurement/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseOrderStatus(id, status, notes = '') {
    return await request(`/procurement/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getDeliveries(filters = {}) {
    const params = new URLSearchParams();
    if (filters.poNumber) params.append('poNumber', filters.poNumber);
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/procurement/deliveries${q}`, { method: 'GET' });
  }

  async createDelivery(data) {
    return await request('/procurement/deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // 10. FINANCE (Expenses, Invoices, Payments, Budget)
  // ==========================================
  async getExpenses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/finance/expenses${q}`, { method: 'GET' });
  }

  async createExpense(data) {
    return await request('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpenseStatus(id, status) {
    return await request(`/finance/expenses/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getInvoices(filters = {}) {
    const params = new URLSearchParams();
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/finance/invoices${q}`, { method: 'GET' });
  }

  async createInvoice(data) {
    return await request('/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.invoiceId) params.append('invoiceId', filters.invoiceId);
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/finance/payments${q}`, { method: 'GET' });
  }

  async recordPayment(data) {
    return await request('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBudgetUtilization(projectId = null) {
    const q = projectId && projectId !== 'All' ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return await request(`/finance/budget-utilization${q}`, { method: 'GET' });
  }

  // ==========================================
  // 11. DOCUMENTS
  // ==========================================
  async getDocuments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.project && filters.project !== 'All') params.append('project', filters.project);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.visibility && filters.visibility !== 'All') params.append('visibility', filters.visibility);
    if (filters.search) params.append('search', filters.search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/documents${q}`, { method: 'GET' });
  }

  async uploadDocument(data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return await request('/documents', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async downloadDocument(id, fileName = 'document.pdf') {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const cleanId = String(id).replace(/^\//, '');
    const res = await fetch(`${API_BASE_URL}/documents/${cleanId}/download`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Download failed' }));
      return { success: false, message: err.message || 'Download failed' };
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  }

  async updateDocumentVisibility(id, visibility) {
    return await request(`/documents/${id}/visibility`, {
      method: 'PUT',
      body: JSON.stringify({ visibility }),
    });
  }

  async deleteDocument(id) {
    return await request(`/documents/${id}`, { method: 'DELETE' });
  }

  // ==========================================
  // 12. CLIENT PORTAL & SITE PHOTOS
  // ==========================================
  async getClientProjects() {
    return await request('/client/projects', { method: 'GET' });
  }

  async getClientProjectDetails(id) {
    return await request(`/client/projects/${id}`, { method: 'GET' });
  }

  async uploadSitePhoto(reportId, photoData) {
    const isFormData = typeof FormData !== 'undefined' && photoData instanceof FormData;
    return await request(`/site-reports/${reportId}/photos`, {
      method: 'POST',
      body: isFormData ? photoData : JSON.stringify(photoData),
    });
  }

  async downloadSitePhoto(reportId, photoId, fileName = 'site-photo.jpg') {
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/site-reports/${reportId}/photos/${photoId}/download`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Photo download failed' }));
      return { success: false, message: err.message || 'Photo download failed' };
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { success: true };
  }

  async approveSitePhoto(reportId, photoId) {
    return await request(`/site-reports/${reportId}/photos/${photoId}/approve`, {
      method: 'PUT',
    });
  }

  async getClientApprovedPhotos(projectId = null) {
    const q = projectId && projectId !== 'All' ? `?project=${encodeURIComponent(projectId)}` : '';
    return await request(`/site-reports/photos/client-approved${q}`, { method: 'GET' });
  }

  // ==========================================
  // 13. NOTIFICATIONS & AUDIT LOGS
  // ==========================================
  async getNotifications() {
    return await request('/notifications', { method: 'GET' });
  }

  async markNotificationRead(id) {
    return await request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return await request('/notifications/read-all', { method: 'PUT' });
  }

  async getAuditLogs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.entity && filters.entity !== 'All') params.append('entity', filters.entity);
    if (filters.action && filters.action !== 'All') params.append('action', filters.action);
    if (filters.search) params.append('search', filters.search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await request(`/audit-logs${q}`, { method: 'GET' });
  }
}

export const api = new BuildoraAPIService();
export default api;

