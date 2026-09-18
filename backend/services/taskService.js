import Task from '../models/Task.js';
import Project from '../models/Project.js';
import {
  validateDependencies,
  canCompleteTask,
  normalizeTaskState,
  calculateTasksSummary,
} from './businessRules.js';

export class TaskService {
  /**
   * Get tasks with rich filtering
   */
  async getTasks(filters = {}) {
    const query = {};

    if (!filters.includeArchived) {
      query.archived = false;
    }

    if (filters.project && filters.project !== 'All') {
      const isObjectId = filters.project.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        query.project = filters.project;
      } else {
        query.projectId = filters.project;
      }
    }

    if (filters.status && filters.status !== 'All') {
      if (filters.status === 'To Do') {
        query.status = { $in: ['To Do', 'Not Started'] };
      } else {
        query.status = filters.status;
      }
    }

    if (filters.priority && filters.priority !== 'All') {
      query.priority = filters.priority;
    }

    if (filters.assignee && filters.assignee !== 'All') {
      query.assignee = filters.assignee;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { assignee: searchRegex },
        { projectName: searchRegex },
      ];
    }

    const tasks = await Task.find(query)
      .populate('dependencies', 'title status progress')
      .sort({ createdAt: -1 });

    return tasks;
  }

  /**
   * Get single task by ID
   */
  async getTaskById(id) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { taskId: id };

    const task = await Task.findOne(query).populate('dependencies', 'title status progress');
    return task;
  }

  /**
   * Create a new task with strict dependency and date validation
   */
  async createTask(taskData, userId) {
    // Resolve project
    let projectDoc;
    if (taskData.project) {
      const isObjectId = String(taskData.project).match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        projectDoc = await Project.findById(taskData.project);
      } else {
        projectDoc = await Project.findOne({
          $or: [{ projectId: taskData.project }, { name: taskData.project }],
        });
      }
    }
    if (!projectDoc && taskData.projectId) {
      const isObjectId = String(taskData.projectId).match(/^[0-9a-fA-F]{24}$/);
      projectDoc = isObjectId
        ? await Project.findById(taskData.projectId)
        : await Project.findOne({ projectId: taskData.projectId });
    }

    if (!projectDoc) {
      throw new Error('Valid project reference is required to create a task.');
    }

    // Generate unique taskId
    const count = await Task.countDocuments();
    const taskId = 'TSK-' + String(101 + count);

    // Validate date logic
    if (taskData.startDate && taskData.dueDate) {
      const start = new Date(taskData.startDate);
      const due = new Date(taskData.dueDate);
      if (due < start) {
        throw new Error('Due date cannot be before start date.');
      }
    }

    // Validate dependencies
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      const allProjectTasks = await Task.find({
        $or: [{ project: projectDoc._id }, { projectId: projectDoc.projectId }],
        archived: false,
      });

      const depCheck = validateDependencies(taskId, taskData.dependencies, allProjectTasks);
      if (!depCheck.valid) {
        throw new Error(depCheck.error);
      }
    }

    const normalizedData = normalizeTaskState({
      ...taskData,
      taskId,
      project: projectDoc._id,
      projectId: projectDoc.projectId || 'PRJ-101',
      projectName: projectDoc.name,
      createdBy: userId,
    });

    const newTask = new Task(normalizedData);
    return await newTask.save();
  }

  /**
   * Update task with dependency and completion validation
   */
  async updateTask(id, updatedFields) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { taskId: id };

    const currentTask = await Task.findOne(query);
    if (!currentTask) {
      return null;
    }

    // Validate date logic if dates are modified
    const startDate = updatedFields.startDate || currentTask.startDate;
    const dueDate = updatedFields.dueDate || currentTask.dueDate;
    if (startDate && dueDate) {
      if (new Date(dueDate) < new Date(startDate)) {
        throw new Error('Due date cannot be before start date.');
      }
    }

    // Validate dependencies if updated
    if (updatedFields.dependencies) {
      const allProjectTasks = await Task.find({
        project: currentTask.project,
        archived: false,
      });

      const depCheck = validateDependencies(
        currentTask._id.toString(),
        updatedFields.dependencies,
        allProjectTasks
      );
      if (!depCheck.valid) {
        throw new Error(depCheck.error);
      }
    }

    // Validate completion rules if status or progress transitions to Completed
    if (updatedFields.status === 'Completed' || updatedFields.progress === 100) {
      const allProjectTasks = await Task.find({
        project: currentTask.project,
        archived: false,
      });

      const completionCheck = canCompleteTask(
        {
          ...currentTask.toObject(),
          ...updatedFields,
        },
        allProjectTasks
      );

      if (!completionCheck.canComplete) {
        throw new Error(completionCheck.error);
      }
    }

    const normalizedFields = normalizeTaskState(updatedFields);

    // Prevent overwriting protected audit fields
    delete normalizedFields.createdBy;
    delete normalizedFields.taskId;
    delete normalizedFields._id;

    const updatedTask = await Task.findOneAndUpdate(query, normalizedFields, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('dependencies', 'title status progress');

    return updatedTask;
  }

  /**
   * Archive a task
   */
  async archiveTask(id) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { taskId: id };

    const task = await Task.findOneAndUpdate(
      query,
      { archived: true },
      { returnDocument: 'after' }
    );

    return task;
  }

  /**
   * Get task summary stats for a project
   */
  async getSummaryStats(projectId = null) {
    const query = { archived: false };
    if (projectId && projectId !== 'All') {
      const isObjectId = projectId.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        query.project = projectId;
      } else {
        query.projectId = projectId;
      }
    }

    const tasks = await Task.find(query);
    return calculateTasksSummary(tasks);
  }
}

export const taskService = new TaskService();
