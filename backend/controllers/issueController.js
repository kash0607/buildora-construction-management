import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import { getNextSequence } from '../models/Counter.js';
import { sendNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

export async function getIssues(req, res, next) {
  try {
    const { project, priority } = req.query;
    const query = {};

    if (project && project !== 'All') {
      const isObjectId = project.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        query.project = project;
      } else {
        query.$or = [{ projectId: project }, { projectName: new RegExp(project, 'i') }];
      }
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    const issues = await Issue.find(query)
      .populate('siteReport', 'reportId supervisor date')
      .populate('task', 'taskId title status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (err) {
    next(err);
  }
}

export async function getIssue(req, res, next) {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { issueId: id };

    const issue = await Issue.findOne(query)
      .populate('siteReport', 'reportId supervisor date')
      .populate('task', 'taskId title status');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (err) {
    next(err);
  }
}

export async function createIssue(req, res, next) {
  try {
    const { title, project, priority, assignee, description, siteReport, task } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Issue title is required',
      });
    }

    let projDoc = null;
    if (project) {
      projDoc = (project.startsWith('PRJ-') || !project.match(/^[0-9a-fA-F]{24}$/))
        ? await Project.findOne({ projectId: project })
        : await Project.findById(project);
      if (!projDoc) {
        projDoc = await Project.findOne({ name: new RegExp(`^${project}$`, 'i') });
      }
    }

    let seq = await getNextSequence('issue');
    let issueId = `ISS-${String(seq + 100).padStart(3, '0')}`;
    while (await Issue.exists({ issueId })) {
      seq = await getNextSequence('issue');
      issueId = `ISS-${String(seq + 100).padStart(3, '0')}`;
    }

    const issue = await Issue.create({
      issueId,
      title: title.trim(),
      project: projDoc ? projDoc._id : null,
      projectId: projDoc ? projDoc.projectId : '',
      projectName: projDoc ? projDoc.name : '',
      priority: priority || 'Medium',
      status: 'Open',
      assignee: assignee || (req.user ? req.user.name : 'Unassigned'),
      description: description || '',
      date: 'Today',
      siteReport: siteReport || null,
      task: task || null,
      createdBy: req.user?._id,
    });

    if (projDoc) {
      await sendNotification({
        targetRole: 'Project Manager',
        project: projDoc._id,
        title: `New Issue Reported: ${issue.title}`,
        message: `Priority: ${issue.priority}. Assignee: ${issue.assignee}`,
        type: 'Issue',
        link: '/issues',
      });
    }

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'CREATE',
      entity: 'Issue',
      entityId: issue.issueId,
      project: projDoc?._id,
      projectId: projDoc?.projectId,
      details: { title: issue.title, priority: issue.priority },
    });

    return res.status(201).json({
      success: true,
      message: 'Issue registered in QA tracker.',
      data: issue,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateIssue(req, res, next) {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { issueId: id };

    const issue = await Issue.findOneAndUpdate(query, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue '${id}' not found`,
      });
    }

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'UPDATE',
      entity: 'Issue',
      entityId: issue.issueId,
      project: issue.project,
      projectId: issue.projectId,
      details: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: issue,
    });
  } catch (err) {
    next(err);
  }
}
