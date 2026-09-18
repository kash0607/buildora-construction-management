import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateProjectProgress,
  calculateTasksSummary,
  validateDependencies,
  canCompleteTask,
  normalizeTaskState,
  calculateBudgetMetrics,
  validateApprovalTransition,
  calculateStockStatus,
  validateStockIssue,
} from '../services/businessRules.js';

import {
  validateRegisterInput,
  validateLoginInput,
} from '../validators/authValidator.js';

import { validateProjectInput } from '../validators/projectValidator.js';
import { validateTaskInput } from '../validators/taskValidator.js';

// ==========================================
// 1. PROJECT PROGRESS CALCULATION TESTS
// ==========================================
test('Project Progress: calculates average progress of active tasks', () => {
  const tasks = [
    { progress: 100, archived: false },
    { progress: 50, archived: false },
    { progress: 0, archived: false },
  ];
  const progress = calculateProjectProgress(tasks);
  assert.equal(progress, 50); // (100 + 50 + 0) / 3 = 50
});

test('Project Progress: ignores archived tasks in calculation', () => {
  const tasks = [
    { progress: 100, archived: false },
    { progress: 0, archived: true }, // archived, should be ignored
  ];
  const progress = calculateProjectProgress(tasks);
  assert.equal(progress, 100);
});

test('Project Progress: returns 0 for empty or invalid task lists', () => {
  assert.equal(calculateProjectProgress([]), 0);
  assert.equal(calculateProjectProgress(null), 0);
  assert.equal(calculateProjectProgress([{ progress: 50, archived: true }]), 0);
});

// ==========================================
// 2. BUDGET CALCULATION RULES TESTS
// ==========================================
test('Budget Rules: calculates remaining budget and utilization correctly', () => {
  const metrics = calculateBudgetMetrics(10000000, 6000000, 2000000);
  assert.equal(metrics.budget, 10000000);
  assert.equal(metrics.actualCost, 6000000);
  assert.equal(metrics.remainingBudget, 4000000);
  assert.equal(metrics.budgetUtilization, 60.0);
  assert.equal(metrics.isOverBudget, false);
});

test('Budget Rules: handles zero budget gracefully without division by zero', () => {
  const metrics = calculateBudgetMetrics(0, 5000, 0);
  assert.equal(metrics.budget, 0);
  assert.equal(metrics.actualCost, 5000);
  assert.equal(metrics.remainingBudget, 0);
  assert.equal(metrics.budgetUtilization, 0);
  assert.equal(metrics.isOverBudget, true);
});

// ==========================================
// 3. TASK DEPENDENCY & CYCLE DETECTION TESTS
// ==========================================
test('Task Dependencies: rejects self-dependency', () => {
  const result = validateDependencies('TSK-101', ['TSK-101'], []);
  assert.equal(result.valid, false);
  assert.match(result.error, /cannot depend on itself/i);
});

test('Task Dependencies: rejects non-existent dependency in project', () => {
  const allTasks = [{ id: 'TSK-101' }, { id: 'TSK-102' }];
  const result = validateDependencies('TSK-101', ['TSK-999'], allTasks);
  assert.equal(result.valid, false);
  assert.match(result.error, /does not exist in this project/i);
});

test('Task Dependencies: accepts valid linear dependencies', () => {
  const allTasks = [
    { id: 'TSK-101', dependencies: [] },
    { id: 'TSK-102', dependencies: ['TSK-101'] },
  ];
  const result = validateDependencies('TSK-103', ['TSK-102'], allTasks);
  assert.equal(result.valid, true);
});

test('Task Dependencies: detects and rejects circular dependencies (A -> B -> A)', () => {
  const allTasks = [
    { id: 'TSK-101', dependencies: ['TSK-102'] },
    { id: 'TSK-102', dependencies: [] },
  ];
  // Attempting to make TSK-102 depend on TSK-101 creates a 2-node cycle
  const result = validateDependencies('TSK-102', ['TSK-101'], allTasks);
  assert.equal(result.valid, false);
  assert.match(result.error, /circular dependency rejected/i);
});

test('Task Dependencies: detects and rejects 3-node circular dependency (A -> B -> C -> A)', () => {
  const allTasks = [
    { id: 'TSK-A', dependencies: ['TSK-B'] },
    { id: 'TSK-B', dependencies: ['TSK-C'] },
    { id: 'TSK-C', dependencies: [] },
  ];
  // Setting TSK-C to depend on TSK-A completes the cycle
  const result = validateDependencies('TSK-C', ['TSK-A'], allTasks);
  assert.equal(result.valid, false);
  assert.match(result.error, /circular dependency/i);
});

// ==========================================
// 4. TASK COMPLETION RULES TESTS
// ==========================================
test('Task Completion: allows completion when all dependencies are Completed', () => {
  const allTasks = [
    { id: 'TSK-101', status: 'Completed', title: 'Foundation' },
  ];
  const task = {
    id: 'TSK-102',
    status: 'In Progress',
    dependencies: ['TSK-101'],
    archived: false,
  };
  const result = canCompleteTask(task, allTasks);
  assert.equal(result.canComplete, true);
});

test('Task Completion: blocks completion if any dependency is incomplete', () => {
  const allTasks = [
    { id: 'TSK-101', status: 'In Progress', title: 'Foundation' },
  ];
  const task = {
    id: 'TSK-102',
    status: 'In Progress',
    dependencies: ['TSK-101'],
    archived: false,
  };
  const result = canCompleteTask(task, allTasks);
  assert.equal(result.canComplete, false);
  assert.match(result.error, /prerequisite task.*is 'In Progress'/i);
});

test('Task Completion: blocks completion of archived task', () => {
  const task = { id: 'TSK-101', archived: true, dependencies: [] };
  const result = canCompleteTask(task, []);
  assert.equal(result.canComplete, false);
  assert.match(result.error, /archived/i);
});

test('Task State Normalization: sets progress to 100 on Completed status', () => {
  const normalized = normalizeTaskState({ status: 'Completed', progress: 40 });
  assert.equal(normalized.progress, 100);
});

test('Task State Normalization: sets status to Completed when progress is 100', () => {
  const normalized = normalizeTaskState({ status: 'In Progress', progress: 100 });
  assert.equal(normalized.status, 'Completed');
});

// ==========================================
// 5. APPROVAL STATE RULES TESTS
// ==========================================
test('Approval Rules: allows valid transition from Pending to Approved or Rejected', () => {
  assert.equal(validateApprovalTransition('Pending', 'Approved').valid, true);
  assert.equal(validateApprovalTransition('Pending', 'Rejected').valid, true);
});

test('Approval Rules: rejects invalid transition from Approved back to Pending', () => {
  const result = validateApprovalTransition('Approved', 'Pending');
  assert.equal(result.valid, false);
  assert.match(result.error, /already 'Approved'/i);
});

test('Approval Rules: rejects unknown status value', () => {
  const result = validateApprovalTransition('Pending', 'RandomStatus');
  assert.equal(result.valid, false);
  assert.match(result.error, /invalid status/i);
});

// ==========================================
// 6. INVENTORY & STOCK RULES TESTS
// ==========================================
test('Stock Calculation: correctly calculates stock status', () => {
  assert.equal(calculateStockStatus(0, 100), 'Out of Stock');
  assert.equal(calculateStockStatus(-5, 100), 'Out of Stock');
  assert.equal(calculateStockStatus(80, 100), 'Low Stock');
  assert.equal(calculateStockStatus(100, 100), 'Low Stock');
  assert.equal(calculateStockStatus(150, 100), 'In Stock');
});

test('Stock Movement: permits issue when sufficient quantity is in stock', () => {
  const result = validateStockIssue(500, 200);
  assert.equal(result.valid, true);
  assert.equal(result.balanceAfter, 300);
});

test('Stock Movement: prevents negative stock when requested qty exceeds stock', () => {
  const result = validateStockIssue(100, 150);
  assert.equal(result.valid, false);
  assert.match(result.error, /insufficient inventory/i);
});

test('Stock Movement: rejects zero or negative issue quantity', () => {
  assert.equal(validateStockIssue(100, 0).valid, false);
  assert.equal(validateStockIssue(100, -10).valid, false);
});

// ==========================================
// 7. INPUT VALIDATORS TESTS
// ==========================================
test('Auth Validators: validateRegisterInput requires name, valid email, and 6+ char password', () => {
  const invalid = validateRegisterInput({ name: '', email: 'bademail', password: '123' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.password);

  const valid = validateRegisterInput({
    name: 'Test User',
    email: 'test@buildora.com',
    password: 'password123',
  });
  assert.equal(valid.valid, true);
});

test('Project Validators: validateProjectInput validates dates and budget', () => {
  const invalidDates = validateProjectInput({
    name: 'Project Alpha',
    client: 'Client A',
    manager: 'Manager M',
    budget: -100,
    startDate: '2026-10-10',
    deadline: '2026-09-01', // before start date
  });
  assert.equal(invalidDates.valid, false);
  assert.ok(invalidDates.errors.budget);
  assert.ok(invalidDates.errors.deadline);
});

test('Task Validators: validateTaskInput validates progress range and date order', () => {
  const invalid = validateTaskInput({
    title: 'Install Rebars',
    projectId: 'PRJ-101',
    assignee: 'Sanjay',
    progress: 150, // invalid > 100
    startDate: '2026-09-10',
    dueDate: '2026-09-05', // before start
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.progress);
  assert.ok(invalid.errors.dueDate);
});
