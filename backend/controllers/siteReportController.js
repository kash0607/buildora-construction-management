import SiteReport from '../models/SiteReport.js';
import Project from '../models/Project.js';

export async function getSiteReports(req, res, next) {
  try {
    const { project } = req.query;
    const query = {};

    if (project && project !== 'All') {
      const isObjectId = project.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        query.project = project;
      } else {
        query.$or = [{ projectId: project }, { projectName: new RegExp(project, 'i') }];
      }
    }

    const reports = await SiteReport.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSiteReport(req, res, next) {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { reportId: id };

    const report = await SiteReport.findOne(query);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Site report '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

export async function createSiteReport(req, res, next) {
  try {
    const { project, projectName, weather, workersPresent, workCompleted, issues, progressToday } = req.body;

    if (!workCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Work completed details are required',
      });
    }

    const pName = projectName || project || 'Skyline Heights';
    let projId = 'PRJ-101';
    let projectRef = null;

    const foundProject = await Project.findOne({
      $or: [{ name: pName }, { projectId: project }],
    });
    if (foundProject) {
      projId = foundProject.projectId;
      projectRef = foundProject._id;
    }

    const count = await SiteReport.countDocuments();
    const reportId = `REP-${901 + count}`;
    const supervisor = req.user ? req.user.name : (req.body.supervisor || 'Sanjay Verma');

    const report = await SiteReport.create({
      reportId,
      project: projectRef,
      projectId: projId,
      projectName: foundProject ? foundProject.name : pName,
      supervisor,
      weather: weather || 'Clear, 31°C',
      workersPresent: Number(workersPresent) || 0,
      workCompleted,
      progressToday: progressToday || '+0.8%',
      issues: issues || 'None reported.',
      status: 'Submitted',
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Daily site report synced to database.',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSiteReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { reportId: id };

    const report = await SiteReport.findOneAndUpdate(
      query,
      { status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Site report '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Site report status updated',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}
