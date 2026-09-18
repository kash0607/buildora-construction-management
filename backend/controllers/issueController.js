import Issue from '../models/Issue.js';
import Project from '../models/Project.js';

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

    const issues = await Issue.find(query).sort({ createdAt: -1 });
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

    const issue = await Issue.findOne(query);
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
    const { title, project, priority, assignee, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Issue title is required',
      });
    }

    const pName = project || 'Skyline Heights';
    let projId = 'PRJ-101';
    let projectRef = null;

    const foundProject = await Project.findOne({
      $or: [{ name: pName }, { projectId: project }],
    });
    if (foundProject) {
      projId = foundProject.projectId;
      projectRef = foundProject._id;
    }

    const count = await Issue.countDocuments();
    const issueId = `ISS-${101 + count}`;

    const issue = await Issue.create({
      issueId,
      title,
      project: projectRef,
      projectId: projId,
      projectName: foundProject ? foundProject.name : pName,
      priority: priority || 'Medium',
      status: 'Open',
      assignee: assignee || (req.user ? req.user.name : 'Sanjay Verma'),
      description: description || '',
      date: 'Today',
      createdBy: req.user?._id,
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
      new: true,
      runValidators: true,
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: issue,
    });
  } catch (err) {
    next(err);
  }
}
