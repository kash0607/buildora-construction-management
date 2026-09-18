import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';

export async function getMilestones(req, res, next) {
  try {
    const { project } = req.query;
    const query = {};

    if (project && project !== 'All') {
      const isObjectId = project.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        query.project = project;
      } else {
        query.projectId = project;
      }
    }

    const milestones = await Milestone.find(query).sort({ dueDate: 1 });
    return res.status(200).json({
      success: true,
      data: milestones,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMilestone(req, res, next) {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { milestoneId: id };

    const milestone = await Milestone.findOne(query);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: `Milestone '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (err) {
    next(err);
  }
}

export async function createMilestone(req, res, next) {
  try {
    const { title, dueDate, projectId, responsible, progress, status, description } = req.body;

    if (!title || !dueDate || !responsible) {
      return res.status(400).json({
        success: false,
        message: 'Title, dueDate, and responsible person are required',
      });
    }

    let projectObjId = null;
    let projId = projectId || 'PRJ-101';
    if (projId) {
      const foundProject = await Project.findOne({
        $or: [{ projectId: projId }, ...(projId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: projId }] : [])],
      });
      if (foundProject) {
        projectObjId = foundProject._id;
        projId = foundProject.projectId;
      }
    }

    const count = await Milestone.countDocuments();
    const milestoneId = `MLS-${101 + count}`;

    const milestone = await Milestone.create({
      milestoneId,
      project: projectObjId,
      projectId: projId,
      title,
      dueDate: new Date(dueDate),
      responsible,
      progress: parseInt(progress, 10) || 0,
      status: status || 'Upcoming',
      description: description || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: milestone,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMilestone(req, res, next) {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { milestoneId: id };

    const milestone = await Milestone.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: `Milestone '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: milestone,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMilestone(req, res, next) {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { milestoneId: id };

    const milestone = await Milestone.findOneAndDelete(query);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: `Milestone '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Milestone archived successfully',
    });
  } catch (err) {
    next(err);
  }
}
