import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Material from '../models/Material.js';
import Approval from '../models/Approval.js';
import Expense from '../models/Expense.js';

/**
 * Build a project-scoping query based on the authenticated user's role.
 * Admin & Finance see all; other roles see only their related projects.
 */
function buildProjectScope(user) {
  if (!user || ['Admin', 'Finance'].includes(user.role)) {
    return { archived: { $ne: true } };
  }

  const scopeConditions = [
    { createdBy: user._id },
    { managerUser: user._id },
    { assignedUsers: user._id },
  ];

  if (user.role === 'Client') {
    scopeConditions.push({ clientUser: user._id });
  }
  if (user.role === 'Project Manager') {
    scopeConditions.push({ manager: user.name });
  }

  return { archived: { $ne: true }, $or: scopeConditions };
}

export async function getDashboardStats(req, res, next) {
  try {
    const isClientOrVendor = req.user && ['Client', 'Vendor'].includes(req.user.role);
    const isAdminOrFinance = req.user && ['Admin', 'Finance'].includes(req.user.role);

    const projectQuery = buildProjectScope(req.user);
    const projects = await Project.find(projectQuery);

    const projectIds = projects.map((p) => p._id);
    const projectIdStrings = projects.map((p) => p.projectId).filter(Boolean);

    // Scope low stock and approvals
    let lowStockCount = 0;
    let pendingApprovals = 0;
    let pendingApprovalsUrgent = 0;

    if (!isClientOrVendor) {
      if (isAdminOrFinance) {
        lowStockCount = await Material.countDocuments({ status: { $in: ['Low Stock', 'Out of Stock'] } });
        pendingApprovals = await Approval.countDocuments({ status: 'Pending' });
        pendingApprovalsUrgent = await Approval.countDocuments({ status: 'Pending', priority: { $in: ['Critical', 'High'] } });
      } else {
        lowStockCount = await Material.countDocuments({
          status: { $in: ['Low Stock', 'Out of Stock'] },
          $or: [{ project: { $in: projectIds } }, { projectId: { $in: projectIdStrings } }],
        });
        pendingApprovals = await Approval.countDocuments({
          status: 'Pending',
          $or: [{ project: { $in: projectIds } }, { projectId: { $in: projectIdStrings } }],
        });
        pendingApprovalsUrgent = await Approval.countDocuments({
          status: 'Pending',
          priority: { $in: ['Critical', 'High'] },
          $or: [{ project: { $in: projectIds } }, { projectId: { $in: projectIdStrings } }],
        });
      }
    }

    const taskQuery = {
      archived: { $ne: true },
      $or: [
        { project: { $in: projectIds } },
        { projectId: { $in: projectIdStrings } },
      ],
    };
    const tasks = await Task.find(taskQuery);

    const activeProjects = projects.filter((p) => p.status === 'Active').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter((t) => {
      if (!t.dueDate || t.status === 'Completed') return false;
      const dStr = t.dueDate.toISOString().split('T')[0];
      return dStr < todayStr;
    }).length;

    // Calculate budget metrics only for internal authorized roles (never Client or Vendor)
    let totalBudget = null;
    let totalBudgetFormatted = null;
    let budgetUsed = null;
    let budgetUsedFormatted = null;
    let budgetPercentage = null;

    if (!isClientOrVendor) {
      totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
      budgetUsed = projects.reduce((sum, p) => sum + (Number(p.actualCost) || 0), 0);
      budgetPercentage = totalBudget > 0 ? Number(((budgetUsed / totalBudget) * 100).toFixed(1)) : 0;
      const totalBudgetCr = (totalBudget / 10000000).toFixed(1);
      const budgetUsedCr = (budgetUsed / 10000000).toFixed(1);
      totalBudgetFormatted = `₹${totalBudgetCr} Cr`;
      budgetUsedFormatted = `₹${budgetUsedCr} Cr`;
    }

    return res.status(200).json({
      success: true,
      data: {
        activeProjects,
        totalProjects: projects.length,
        activeProjectsTrend: `+${activeProjects} operational`,
        totalBudget,
        totalBudgetFormatted,
        budgetUsed,
        budgetUsedFormatted,
        budgetPercentage,
        pendingApprovals,
        pendingApprovalsUrgent,
        overdueTasks,
        lowStockItems: lowStockCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnalyticsSummary(req, res, next) {
  try {
    const isClientOrVendor = req.user && ['Client', 'Vendor'].includes(req.user.role);
    const projectQuery = buildProjectScope(req.user);
    const projects = await Project.find(projectQuery);

    const completed = projects.filter((p) => p.status === 'Completed').length;
    const active = projects.filter((p) => p.status === 'Active').length;
    const planning = projects.filter((p) => p.status === 'Planning').length;
    const delayed = projects.filter((p) => p.status === 'Delayed').length;

    // Generate real expense trends from database records over the past 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      });
    }

    const labels = months.map((m) => m.label);
    const projectIds = projects.map((p) => p._id);
    const projectIdStrings = projects.map((p) => p.projectId).filter(Boolean);

    // Sum real expenses per month
    const actualMonthly = [];
    const budgetedMonthly = [];

    const totalProjectBudgetCr = projects.reduce((s, p) => s + (p.budget || 0), 0) / 10000000;
    const avgMonthlyBudget = Number((totalProjectBudgetCr / 12).toFixed(2));

    for (const m of months) {
      if (isClientOrVendor) {
        actualMonthly.push(0);
        budgetedMonthly.push(0);
      } else {
        const monthExpenses = await Expense.find({
          status: { $in: ['Approved', 'Paid'] },
          $or: [{ project: { $in: projectIds } }, { projectId: { $in: projectIdStrings } }],
          date: { $gte: m.start, $lte: m.end },
        });
        const sum = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
        actualMonthly.push(Number((sum / 10000000).toFixed(2)));
        budgetedMonthly.push(avgMonthlyBudget);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        expenseTrends: {
          labels,
          budgeted: budgetedMonthly,
          actual: actualMonthly,
        },
        projectHealth: {
          labels: ['Completed', 'Active On-Track', 'Under Review', 'Planning'],
          counts: [completed, active, delayed, planning],
          colors: ['#2E7D32', '#6B4F3A', '#D97706', '#8A684C'],
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
