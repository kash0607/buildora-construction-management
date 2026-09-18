import { PROJECT_STATUSES } from '../models/Project.js';

/**
 * Input validators for Project endpoints
 */

export function validateProjectInput(data, isUpdate = false) {
  const errors = {};

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || !data.name.trim()) {
      errors.name = 'Project name is required';
    }
  }

  if (!isUpdate || data.client !== undefined) {
    if (!data.client || !data.client.trim()) {
      errors.client = 'Client name is required';
    }
  }

  if (!isUpdate || data.manager !== undefined) {
    if (!data.manager || !data.manager.trim()) {
      errors.manager = 'Project manager name is required';
    }
  }

  if (!isUpdate || data.budget !== undefined) {
    if (data.budget === undefined || data.budget === null || isNaN(Number(data.budget)) || Number(data.budget) < 0) {
      errors.budget = 'Budget must be a non-negative number';
    }
  }

  if (!isUpdate || data.startDate !== undefined) {
    if (!data.startDate || isNaN(new Date(data.startDate).getTime())) {
      errors.startDate = 'A valid start date is required';
    }
  }

  if (!isUpdate || data.deadline !== undefined) {
    if (!data.deadline || isNaN(new Date(data.deadline).getTime())) {
      errors.deadline = 'A valid deadline date is required';
    }
  }

  if (data.startDate && data.deadline) {
    const start = new Date(data.startDate);
    const deadline = new Date(data.deadline);
    if (deadline < start) {
      errors.deadline = 'Deadline cannot be before the start date';
    }
  }

  if (data.status !== undefined) {
    if (!PROJECT_STATUSES.includes(data.status)) {
      errors.status = `Status must be one of: ${PROJECT_STATUSES.join(', ')}`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
