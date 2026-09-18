import { TASK_STATUSES, TASK_PRIORITIES } from '../models/Task.js';

/**
 * Input validators for Task endpoints
 */

export function validateTaskInput(data, isUpdate = false) {
  const errors = {};

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || !data.title.trim()) {
      errors.title = 'Task title is required';
    }
  }

  if (!isUpdate) {
    if (!data.project && !data.projectId) {
      errors.project = 'Project reference is required for task creation';
    }
  }

  if (!isUpdate || data.assignee !== undefined) {
    if (!data.assignee || !data.assignee.trim()) {
      errors.assignee = 'Task assignee is required';
    }
  }

  if (data.status !== undefined) {
    const validStatuses = [...TASK_STATUSES, 'Not Started'];
    if (!validStatuses.includes(data.status)) {
      errors.status = `Status must be one of: ${TASK_STATUSES.join(', ')}`;
    }
  }

  if (data.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(data.priority)) {
      errors.priority = `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`;
    }
  }

  if (data.progress !== undefined) {
    const p = Number(data.progress);
    if (isNaN(p) || p < 0 || p > 100) {
      errors.progress = 'Progress must be a number between 0 and 100';
    }
  }

  if (data.startDate && isNaN(new Date(data.startDate).getTime())) {
    errors.startDate = 'Start date must be a valid date';
  }

  if (!isUpdate || data.dueDate !== undefined) {
    if (!data.dueDate || isNaN(new Date(data.dueDate).getTime())) {
      errors.dueDate = 'Due date must be a valid date';
    }
  }

  if (data.startDate && data.dueDate) {
    const start = new Date(data.startDate);
    const due = new Date(data.dueDate);
    if (due < start) {
      errors.dueDate = 'Due date cannot be before start date';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
