import Project from '../models/Project.js';
import Milestone from '../models/Milestone.js';
import SiteReport from '../models/SiteReport.js';
import Document from '../models/Document.js';

/**
 * Client-safe Project List
 * Returns high-level executive metrics without internal cost or margin data.
 */
export async function getClientProjects(req, res, next) {
  try {
    const filter = { archived: { $ne: true } };

    // Strict project isolation for Client role; Admin can access all
    if (req.user && req.user.role === 'Client') {
      filter.clientUser = req.user._id;
    }

    const projects = await Project.find(filter).select(
      'projectId name client location status progress startDate deadline image workersOnSite description'
    );

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Client-safe Project Overview & Full Progress Data
 * Sanitized of all internal procurement, inventory, internal expense logs, and internal notes.
 */
export async function getClientProjectDetails(req, res, next) {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { projectId: id };

    const project = await Project.findOne(query).select(
      'projectId name client clientUser location status progress startDate deadline image workersOnSite description'
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Strict project isolation for Client role; Admin can access all
    if (req.user && req.user.role === 'Client') {
      if (!project.clientUser || String(project.clientUser) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to access this project',
        });
      }
    }

    // Fetch Milestones
    const milestones = await Milestone.find({
      $or: [{ project: project._id }, { projectId: project.projectId }],
    }).sort({ dueDate: 1 });

    // Fetch Approved Site Photos
    const reports = await SiteReport.find({
      $or: [{ project: project._id }, { projectId: project.projectId }],
    }).select('reportId projectName supervisor date photos createdAt');

    const approvedPhotos = [];
    reports.forEach((r) => {
      (r.photos || []).forEach((p) => {
        if (p.clientApproved) {
          approvedPhotos.push({
            id: p._id,
            url: p.url,
            caption: p.caption,
            uploadedByName: p.uploadedByName,
            approvedAt: p.approvedAt,
            reportId: r.reportId,
            date: r.date,
          });
        }
      });
    });

    // Fetch Client-Visible Documents
    const documents = await Document.find({
      $or: [{ project: project._id }, { projectId: project.projectId }],
      visibility: { $in: ['Client Visible', 'Approved'] },
    }).select('documentId title fileName fileUrl fileType fileSize category updatedAt');

    // Recent executive progress notes
    const recentReports = reports
      .filter((r) => r.status === 'Approved')
      .slice(0, 5)
      .map((r) => ({
        reportId: r.reportId,
        date: r.date,
        supervisor: r.supervisor,
      }));

    return res.status(200).json({
      success: true,
      data: {
        project,
        milestones,
        approvedPhotos,
        documents,
        recentApprovedUpdates: recentReports,
      },
    });
  } catch (err) {
    next(err);
  }
}
