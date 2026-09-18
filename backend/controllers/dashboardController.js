import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Material from '../models/Material.js';
import Approval from '../models/Approval.js';

export async function getDashboardStats(req, res, next) {
  try {
    const [projects, tasks, lowStockCount, pendingApprovals, pendingApprovalsUrgent] =
      await Promise.all([
        Project.find({ isArchived: { $ne: true } }),
        Task.find({ archived: { $ne: true } }),
        Material.countDocuments({ status: { $in: ['Low Stock', 'Out of Stock'] } }),
        Approval.countDocuments({ status: 'Pending' }),
        Approval.countDocuments({ status: 'Pending', priority: { $in: ['Critical', 'High'] } }),
      ]);

    const activeProjects = projects.filter((p) => p.status === 'Active').length;
    const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    const budgetUsed = projects.reduce((sum, p) => sum + (Number(p.actualCost) || 0), 0);
    const budgetPercentage =
      totalBudget > 0 ? Number(((budgetUsed / totalBudget) * 100).toFixed(1)) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasks = tasks.filter((t) => {
      if (!t.dueDate || t.status === 'Completed') return false;
      const dStr = t.dueDate.toISOString().split('T')[0];
      return dStr < todayStr;
    }).length;

    const totalBudgetCr = (totalBudget / 10000000).toFixed(1);
    const budgetUsedCr = (budgetUsed / 10000000).toFixed(1);

    return res.status(200).json({
      success: true,
      data: {
        activeProjects,
        totalProjects: projects.length,
        activeProjectsTrend: `+${activeProjects} operational`,
        totalBudget,
        totalBudgetFormatted: `₹${totalBudgetCr} Cr`,
        budgetUsed,
        budgetUsedFormatted: `₹${budgetUsedCr} Cr`,
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
    const projects = await Project.find({ isArchived: { $ne: true } });

    const completed = projects.filter((p) => p.status === 'Completed').length;
    const active = projects.filter((p) => p.status === 'Active').length;
    const planning = projects.filter((p) => p.status === 'Planning').length;
    const delayed = projects.filter((p) => p.status === 'Delayed').length;

    const totalBudgetCr = Number((projects.reduce((s, p) => s + (p.budget || 0), 0) / 10000000).toFixed(1));
    const totalActualCr = Number((projects.reduce((s, p) => s + (p.actualCost || 0), 0) / 10000000).toFixed(1));

    return res.status(200).json({
      success: true,
      data: {
        expenseTrends: {
          labels: ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'],
          budgeted: [2.8, 3.2, 3.8, 4.2, 4.5, totalBudgetCr > 0 ? totalBudgetCr : 4.0],
          actual: [2.6, 3.5, 3.7, 4.6, 4.3, totalActualCr > 0 ? totalActualCr : 3.8],
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
