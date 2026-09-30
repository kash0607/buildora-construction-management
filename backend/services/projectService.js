import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { getNextSequence } from '../models/Counter.js';
import { calculateProjectProgress, calculateBudgetMetrics } from './businessRules.js';

export class ProjectService {
  /**
   * Helper to resolve user ObjectId from an ObjectId string, email, or name
   */
  async resolveUser(input, expectedRole = null) {
    if (!input) return null;
    const str = String(input).trim();
    if (str.match(/^[0-9a-fA-F]{24}$/)) {
      return str;
    }
    const query = { $or: [{ email: str.toLowerCase() }, { name: str }] };
    if (expectedRole) {
      query.role = expectedRole;
    }
    const user = await User.findOne(query);
    return user ? user._id : null;
  }

  /**
   * Get all projects with optional filtering, live progress calculation,
   * and role-based data scoping.
   * @param {Object} filters - Query filters
   * @param {Object} [user] - The authenticated user (from req.user)
   */
  async getProjects(filters = {}, user = null) {
    const query = {};

    if (!filters.includeArchived) {
      query.status = { $ne: 'Archived' };
    }

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.manager && filters.manager !== 'All') {
      query.manager = filters.manager;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { client: searchRegex },
        { location: searchRegex },
        { manager: searchRegex },
      ];
    }

    // ── Role-based data scoping ──
    // Admin & Finance see all projects.
    // Other roles see only projects they are related to.
    if (user && !['Admin', 'Finance'].includes(user.role)) {
      const scopeConditions = [
        { createdBy: user._id },
        { managerUser: user._id },
        { assignedUsers: user._id },
      ];

      if (user.role === 'Client') {
        scopeConditions.push({ clientUser: user._id });
      }

      // Also match by manager name string for backward compatibility
      if (user.role === 'Project Manager') {
        scopeConditions.push({ manager: user.name });
      }

      // Merge with any existing $or (e.g. from search)
      if (query.$or) {
        // search + scope: must match BOTH
        const searchOr = query.$or;
        delete query.$or;
        query.$and = [{ $or: searchOr }, { $or: scopeConditions }];
      } else {
        query.$or = scopeConditions;
      }
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });

    // Enhance projects with live progress & budget calculation
    const enhanced = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({
          $or: [{ project: project._id }, { projectId: project.projectId }],
          archived: false,
        });

        const derivedProgress = tasks.length > 0 ? calculateProjectProgress(tasks) : project.progress;
        const budgetMetrics = calculateBudgetMetrics(project.budget, project.actualCost, project.committedCost);

        const projectObj = project.toJSON();
        projectObj.progress = derivedProgress;
        projectObj.tasksTotal = tasks.length;
        projectObj.tasksCompleted = tasks.filter((t) => t.status === 'Completed').length;
        projectObj.remainingBudget = budgetMetrics.remainingBudget;
        projectObj.budgetUtilization = budgetMetrics.budgetUtilization;

        return projectObj;
      })
    );

    return enhanced;
  }

  /**
   * Get single project by ID with related task summary and user access verification
   */
  async getProjectById(id, user = null) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { projectId: id };

    const project = await Project.findOne(query);
    if (!project) return null;

    // Verify access if user context provided and not Admin/Finance
    if (user && !['Admin', 'Finance'].includes(user.role)) {
      const userIdStr = String(user._id);
      const isManagerUser = project.managerUser && String(project.managerUser) === userIdStr;
      const isClientUser = project.clientUser && String(project.clientUser) === userIdStr;
      const isCreator = project.createdBy && String(project.createdBy) === userIdStr;
      const isAssigned = project.assignedUsers && project.assignedUsers.some((u) => String(u) === userIdStr);
      const isNamedManager = user.role === 'Project Manager' && project.manager === user.name;

      let hasAccess = false;
      if (user.role === 'Client') {
        hasAccess = isClientUser;
      } else if (user.role === 'Project Manager') {
        hasAccess = isManagerUser || isCreator || isAssigned || isNamedManager;
      } else if (user.role === 'Site Supervisor') {
        hasAccess = isAssigned || isManagerUser || isCreator;
      } else {
        hasAccess = isAssigned || isCreator;
      }

      if (!hasAccess) {
        return { unauthorized: true };
      }
    }

    const tasks = await Task.find({
      $or: [{ project: project._id }, { projectId: project.projectId }],
      archived: false,
    });

    const derivedProgress = tasks.length > 0 ? calculateProjectProgress(tasks) : project.progress;
    const budgetMetrics = calculateBudgetMetrics(project.budget, project.actualCost, project.committedCost);

    const projectObj = project.toJSON();
    projectObj.progress = derivedProgress;
    projectObj.tasksTotal = tasks.length;
    projectObj.tasksCompleted = tasks.filter((t) => t.status === 'Completed').length;
    projectObj.remainingBudget = budgetMetrics.remainingBudget;
    projectObj.budgetUtilization = budgetMetrics.budgetUtilization;

    return projectObj;
  }

  /**
   * Create a new project
   */
  async createProject(projectData, userId) {
    let seq = await getNextSequence('project');
    let projectId = 'PRJ-' + String(100 + seq);
    while (await Project.exists({ projectId })) {
      seq = await getNextSequence('project');
      projectId = 'PRJ-' + String(100 + seq);
    }

    // Resolve user associations
    let managerUser = projectData.managerUser || null;
    if (!managerUser && projectData.manager) {
      managerUser = await this.resolveUser(projectData.manager, 'Project Manager') || await this.resolveUser(projectData.manager);
    }

    let clientUser = projectData.clientUser || null;
    if (!clientUser && projectData.client) {
      clientUser = await this.resolveUser(projectData.client, 'Client') || await this.resolveUser(projectData.client);
    }

    let assignedUsers = projectData.assignedUsers || [];
    if (Array.isArray(assignedUsers) && assignedUsers.length > 0) {
      assignedUsers = await Promise.all(
        assignedUsers.map(async (u) => await this.resolveUser(u) || u)
      );
    }

    const newProject = new Project({
      ...projectData,
      projectId,
      managerUser,
      clientUser,
      assignedUsers,
      createdBy: userId,
    });

    return await newProject.save();
  }

  /**
   * Update existing project
   */
  async updateProject(id, updatedFields) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { projectId: id };

    // Prevent overwriting protected audit fields
    delete updatedFields.createdBy;
    delete updatedFields._id;
    delete updatedFields.projectId;

    // Resolve user associations if updated
    if (updatedFields.managerUser) {
      updatedFields.managerUser = await this.resolveUser(updatedFields.managerUser);
    } else if (updatedFields.manager) {
      const resolved = await this.resolveUser(updatedFields.manager, 'Project Manager') || await this.resolveUser(updatedFields.manager);
      if (resolved) updatedFields.managerUser = resolved;
    }

    if (updatedFields.clientUser) {
      updatedFields.clientUser = await this.resolveUser(updatedFields.clientUser);
    } else if (updatedFields.client) {
      const resolved = await this.resolveUser(updatedFields.client, 'Client') || await this.resolveUser(updatedFields.client);
      if (resolved) updatedFields.clientUser = resolved;
    }

    if (Array.isArray(updatedFields.assignedUsers)) {
      updatedFields.assignedUsers = await Promise.all(
        updatedFields.assignedUsers.map(async (u) => await this.resolveUser(u) || u)
      );
    }

    const project = await Project.findOneAndUpdate(query, updatedFields, {
      returnDocument: 'after',
      runValidators: true,
    });

    return project;
  }

  /**
   * Archive a project
   */
  async archiveProject(id) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { projectId: id };

    const project = await Project.findOneAndUpdate(
      query,
      { status: 'Archived' },
      { returnDocument: 'after' }
    );

    return project;
  }
}

export const projectService = new ProjectService();
