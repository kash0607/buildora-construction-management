/**
 * BUILDORA — Core Business Rules & Domain Logic Engine
 * Authored for Jitesh's Week 1 & Week 2 Business Rules responsibilities.
 * 
 * All functions are pure, deterministic, and independently testable without Express or database mocks.
 */

// ==========================================
// 1. PROJECT PROGRESS CALCULATION
// ==========================================

/**
 * Calculates project progress as the average progress of active (non-archived) tasks.
 * @param {Array<{ progress: number, archived?: boolean }>} tasks - Array of project tasks
 * @returns {number} Progress percentage between 0 and 100 (rounded integer)
 */
export function calculateProjectProgress(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }

  const activeTasks = tasks.filter((t) => !t.archived);
  if (activeTasks.length === 0) {
    return 0;
  }

  const sumProgress = activeTasks.reduce((acc, t) => {
    const p = typeof t.progress === 'number' ? Math.max(0, Math.min(100, t.progress)) : 0;
    return acc + p;
  }, 0);

  return Math.round(sumProgress / activeTasks.length);
}

/**
 * Computes task status summary counts for a project.
 */
export function calculateTasksSummary(tasks = []) {
  const activeTasks = tasks.filter((t) => !t.archived);
  const today = new Date().toISOString().split('T')[0];

  const summary = {
    total: activeTasks.length,
    toDo: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    blocked: 0,
    overdue: 0,
  };

  for (const t of activeTasks) {
    const status = t.status === 'Not Started' ? 'To Do' : t.status;
    if (status === 'Completed') {
      summary.completed++;
    } else {
      if (status === 'In Progress') summary.inProgress++;
      else if (status === 'Review') summary.review++;
      else if (status === 'Blocked') summary.blocked++;
      else summary.toDo++;

      // Overdue check
      if (t.dueDate) {
        const due = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : t.dueDate.toISOString().split('T')[0];
        if (due < today) {
          summary.overdue++;
        }
      }
    }
  }

  return summary;
}

// ==========================================
// 2. TASK DEPENDENCY RULES & CYCLE DETECTION
// ==========================================

/**
 * Validates dependency relationships for a task.
 * Rules:
 * - A task cannot depend on itself.
 * - Dependency must exist in the same project.
 * - Circular dependencies are strictly rejected.
 * 
 * @param {string} taskId - The ID of the task being created or updated
 * @param {Array<string>} newDependencyIds - Proposed dependency IDs
 * @param {Array<{ id: string, _id?: any, projectId?: string, project?: any, dependencies?: Array<any> }>} allTasks - All tasks in the project
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDependencies(taskId, newDependencyIds = [], allTasks = []) {
  if (!Array.isArray(newDependencyIds) || newDependencyIds.length === 0) {
    return { valid: true };
  }

  const strTaskId = String(taskId);
  const normalizedDeps = newDependencyIds.map(String);

  // Rule 1: Cannot depend on itself
  if (normalizedDeps.includes(strTaskId)) {
    return {
      valid: false,
      error: 'Self-dependency rejected: A task cannot depend on itself.',
    };
  }

  // Create lookup map of all project tasks
  const taskMap = new Map();
  for (const t of allTasks) {
    const id = String(t.id || t._id || '');
    if (id) taskMap.set(id, t);
  }

  // Rule 2: All dependencies must exist in taskMap
  for (const depId of normalizedDeps) {
    if (!taskMap.has(depId)) {
      return {
        valid: false,
        error: `Dependency task '${depId}' does not exist in this project.`,
      };
    }
  }

  // Rule 3: Cycle Detection via Graph Traversal (DFS with recursion stack)
  // Construct adjacency list where node -> dependencies it relies on
  const adj = new Map();
  for (const [id, t] of taskMap.entries()) {
    const rawDeps = id === strTaskId ? normalizedDeps : (t.dependencies || []).map((d) => String(d.id || d._id || d));
    adj.set(id, rawDeps);
  }

  // Ensure current task is also mapped with proposed dependencies
  adj.set(strTaskId, normalizedDeps);

  // Detect cycle reachable from strTaskId
  const visited = new Set();
  const recStack = new Set();

  function hasCycle(curr) {
    visited.add(curr);
    recStack.add(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true; // Cycle detected!
      }
    }

    recStack.delete(curr);
    return false;
  }

  if (hasCycle(strTaskId)) {
    return {
      valid: false,
      error: 'Circular dependency rejected: Adding this dependency creates a dependency cycle.',
    };
  }

  return { valid: true };
}

// ==========================================
// 3. TASK COMPLETION RULES
// ==========================================

/**
 * Validates whether a task can transition to 'Completed'.
 * Rules:
 * - Task cannot be archived.
 * - All prerequisite dependencies must be in 'Completed' state.
 * 
 * @param {object} task - The task attempting to be marked complete
 * @param {Array<object>} allTasks - All tasks in the project to resolve dependencies
 * @returns {{ canComplete: boolean, error?: string, normalizedTask?: object }}
 */
export function canCompleteTask(task, allTasks = []) {
  if (task.archived) {
    return {
      canComplete: false,
      error: 'Cannot complete an archived task.',
    };
  }

  const rawDeps = (task.dependencies || []).map((d) => String(d.id || d._id || d));
  if (rawDeps.length > 0) {
    const taskMap = new Map();
    for (const t of allTasks) {
      const id = String(t.id || t._id || '');
      if (id) taskMap.set(id, t);
    }

    for (const depId of rawDeps) {
      const depTask = taskMap.get(depId);
      if (depTask && depTask.status !== 'Completed') {
        return {
          canComplete: false,
          error: `Cannot complete task: Prerequisite task '${depTask.title || depId}' is '${depTask.status}'. All dependencies must be Completed first.`,
        };
      }
    }
  }

  return {
    canComplete: true,
  };
}

/**
 * Normalizes task state when marked Completed or given progress.
 * Prevents contradictory states (e.g. Completed with 40% progress).
 */
export function normalizeTaskState(taskData) {
  const normalized = { ...taskData };

  if (normalized.status === 'Completed') {
    normalized.progress = 100;
  } else if (normalized.progress === 100 && normalized.status !== 'Completed') {
    normalized.status = 'Completed';
  }

  if (normalized.status === 'Not Started') {
    normalized.status = 'To Do';
  }

  if (typeof normalized.progress === 'number') {
    normalized.progress = Math.max(0, Math.min(100, normalized.progress));
  }

  return normalized;
}

// ==========================================
// 4. BUDGET CALCULATION RULES
// ==========================================

/**
 * Calculates budget metrics cleanly handling edge cases like 0 budget.
 * @param {number} budget - Total project budget
 * @param {number} actualCost - Incurred expenditure
 * @param {number} committedCost - Committed purchase orders / contracts
 * @returns {{ budget: number, actualCost: number, committedCost: number, remainingBudget: number, budgetUtilization: number, isOverBudget: boolean }}
 */
export function calculateBudgetMetrics(budget = 0, actualCost = 0, committedCost = 0) {
  const b = Math.max(0, Number(budget) || 0);
  const a = Math.max(0, Number(actualCost) || 0);
  const c = Math.max(0, Number(committedCost) || 0);

  const remainingBudget = Math.max(0, b - a);
  const budgetUtilization = b > 0 ? Number(((a / b) * 100).toFixed(2)) : 0;
  const isOverBudget = a > b;

  return {
    budget: b,
    actualCost: a,
    committedCost: c,
    remainingBudget,
    budgetUtilization,
    isOverBudget,
  };
}

// ==========================================
// 5. APPROVAL STATE TRANSITION RULES
// ==========================================

export const VALID_APPROVAL_STATES = ['Pending', 'Approved', 'Rejected'];

/**
 * Validates approval state transitions for procurement and expense requests.
 * Rules:
 * - Pending can transition to Approved or Rejected.
 * - Approved or Rejected are terminal; cannot transition back to Pending without re-evaluation.
 * 
 * @param {string} currentStatus - Current approval state
 * @param {string} nextStatus - Desired new approval state
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateApprovalTransition(currentStatus, nextStatus) {
  if (!VALID_APPROVAL_STATES.includes(nextStatus)) {
    return {
      valid: false,
      error: `Invalid status '${nextStatus}'. Allowed states: ${VALID_APPROVAL_STATES.join(', ')}`,
    };
  }

  if (currentStatus === nextStatus) {
    return { valid: true };
  }

  if (currentStatus === 'Pending') {
    if (nextStatus === 'Approved' || nextStatus === 'Rejected') {
      return { valid: true };
    }
  }

  if (currentStatus === 'Approved' || currentStatus === 'Rejected') {
    return {
      valid: false,
      error: `Invalid transition: Request is already '${currentStatus}' and cannot transition directly to '${nextStatus}'.`,
    };
  }

  return {
    valid: false,
    error: `Invalid approval state transition from '${currentStatus}' to '${nextStatus}'.`,
  };
}

// ==========================================
// 6. INVENTORY & STOCK CALCULATION RULES
// ==========================================

/**
 * Deterministically derives material status from stock numbers.
 * @param {number} currentStock
 * @param {number} reorderLevel
 * @returns {'In Stock' | 'Low Stock' | 'Out of Stock'}
 */
export function calculateStockStatus(currentStock, reorderLevel) {
  const stock = Number(currentStock) || 0;
  const reorder = Number(reorderLevel) || 0;

  if (stock <= 0) return 'Out of Stock';
  if (stock <= reorder) return 'Low Stock';
  return 'In Stock';
}

/**
 * Validates stock issue movement to prevent negative inventory.
 * @param {number} currentStock - Available inventory
 * @param {number} quantityToIssue - Requested quantity
 * @returns {{ valid: boolean, error?: string, balanceAfter?: number }}
 */
export function validateStockIssue(currentStock, quantityToIssue) {
  const stock = Number(currentStock) || 0;
  const qty = Number(quantityToIssue);

  if (isNaN(qty) || qty <= 0) {
    return {
      valid: false,
      error: 'Quantity to issue must be a positive number greater than zero.',
    };
  }

  if (qty > stock) {
    return {
      valid: false,
      error: `Insufficient inventory: Requested ${qty}, but only ${stock} available in stock. Stock cannot become negative.`,
    };
  }

  return {
    valid: true,
    balanceAfter: stock - qty,
  };
}
