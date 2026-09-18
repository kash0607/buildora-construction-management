import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { calculateProjectProgress, calculateBudgetMetrics } from './businessRules.js';

export class ProjectService {
  /**
   * Get all projects with optional filtering and live progress calculation
   */
  async getProjects(filters = {}) {
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
   * Get single project by ID with related task summary
   */
  async getProjectById(id) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { projectId: id };

    const project = await Project.findOne(query);
    if (!project) return null;

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
    const count = await Project.countDocuments();
    const projectId = 'PRJ-' + String(101 + count);

    const newProject = new Project({
      ...projectData,
      projectId,
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
