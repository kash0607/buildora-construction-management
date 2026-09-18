import { taskService } from '../services/taskService.js';
import { validateTaskInput } from '../validators/taskValidator.js';

/**
 * @desc    Get all tasks with filtering
 * @route   GET /api/tasks
 * @access  Private
 */
export async function getTasks(req, res, next) {
  try {
    const { project, assignee, status, priority, search, includeArchived } = req.query;
    const tasks = await taskService.getTasks({
      project,
      assignee,
      status,
      priority,
      search,
      includeArchived: includeArchived === 'true',
    });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export async function getTask(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task '${req.params.id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private
 */
export async function createTask(req, res, next) {
  try {
    const validation = validateTaskInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const task = await taskService.createTask(req.body, req.user?._id);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (err) {
    // If business rules threw an error (dependency cycle, self-dep, etc.)
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export async function updateTask(req, res, next) {
  try {
    const validation = validateTaskInput(req.body, true);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const task = await taskService.updateTask(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task '${req.params.id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * @desc    Archive task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export async function deleteTask(req, res, next) {
  try {
    const task = await taskService.archiveTask(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task '${req.params.id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task archived successfully',
      data: task,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get task summary statistics
 * @route   GET /api/tasks/stats/summary
 * @access  Private
 */
export async function getTaskStats(req, res, next) {
  try {
    const stats = await taskService.getSummaryStats(req.query.project);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}
