import path from 'path';
import fs from 'fs';
import SiteReport from '../models/SiteReport.js';
import Project from '../models/Project.js';
import { getNextSequence } from '../models/Counter.js';
import { sendNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

/**
 * Validates that a resolved file path is safely within the allowed uploads directory.
 */
function isSafePath(filePath, allowedBaseDir) {
  const resolved = path.resolve(filePath);
  const base = path.resolve(allowedBaseDir);
  return resolved.startsWith(base + path.sep) || resolved === base;
}

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

    const reports = await SiteReport.find(query)
      .populate('relatedTasks', 'title taskId status')
      .populate('relatedIssues', 'title issueId priority status')
      .sort({ createdAt: -1 });

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

    const report = await SiteReport.findOne(query)
      .populate('relatedTasks', 'title taskId status')
      .populate('relatedIssues', 'title issueId priority status');

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
    const {
      project,
      projectName,
      weather,
      workersPresent,
      workCompleted,
      issues,
      progressToday,
      relatedTasks,
      relatedIssues,
    } = req.body;

    if (!workCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Work completed details are required',
      });
    }

    if (!project && !projectName) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Project is required for site report',
      });
    }

    const targetProject = project || projectName;
    let projDoc = (typeof targetProject === 'string' && (targetProject.startsWith('PRJ-') || !targetProject.match(/^[0-9a-fA-F]{24}$/)))
      ? await Project.findOne({ projectId: targetProject })
      : await Project.findById(targetProject);

    if (!projDoc && typeof targetProject === 'string') {
      projDoc = await Project.findOne({ name: new RegExp(`^${targetProject}$`, 'i') });
    }

    if (!projDoc) {
      return res.status(400).json({
        success: false,
        message: `Project '${targetProject}' not found`,
      });
    }

    let seq = await getNextSequence('siteReport');
    let reportId = `REP-${String(seq + 900).padStart(3, '0')}`;
    while (await SiteReport.exists({ reportId })) {
      seq = await getNextSequence('siteReport');
      reportId = `REP-${String(seq + 900).padStart(3, '0')}`;
    }
    const supervisor = req.user ? req.user.name : (req.body.supervisor || 'Site Supervisor');

    const report = await SiteReport.create({
      reportId,
      project: projDoc._id,
      projectId: projDoc.projectId,
      projectName: projDoc.name,
      supervisor,
      weather: weather || 'Clear, 31°C',
      workersPresent: Number(workersPresent) || 0,
      workCompleted,
      progressToday: progressToday || '+0.8%',
      issues: issues || 'None reported.',
      status: 'Submitted',
      relatedTasks: Array.isArray(relatedTasks) ? relatedTasks : [],
      relatedIssues: Array.isArray(relatedIssues) ? relatedIssues : [],
      createdBy: req.user?._id,
    });

    await sendNotification({
      targetRole: 'Project Manager',
      project: projDoc._id,
      title: 'Daily Site Report Submitted',
      message: `Supervisor ${supervisor} logged daily report ${report.reportId} for ${projDoc.name}.`,
      type: 'Site Report',
      link: '/site-reports',
    });

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'CREATE',
      entity: 'SiteReport',
      entityId: report.reportId,
      project: projDoc._id,
      projectId: projDoc.projectId,
      details: { workersPresent: report.workersPresent, progressToday: report.progressToday },
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
      { returnDocument: 'after', runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Site report '${id}' not found`,
      });
    }

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'UPDATE_STATUS',
      entity: 'SiteReport',
      entityId: report.reportId,
      project: report.project,
      projectId: report.projectId,
      details: { status },
    });

    return res.status(200).json({
      success: true,
      message: 'Site report status updated',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadSitePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    let photoUrl = req.body.url;
    if (req.file) {
      photoUrl = `/uploads/photos/${req.file.filename}`;
    }

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo file or URL is required' });
    }

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { reportId: id };

    const report = await SiteReport.findOne(query);
    if (!report) {
      return res.status(404).json({ success: false, message: `Site report '${id}' not found` });
    }

    const photoObj = {
      url: photoUrl,
      caption: caption || '',
      uploadedBy: req.user._id,
      uploadedByName: req.user.name,
      timestamp: new Date(),
      clientApproved: false,
    };

    report.photos.push(photoObj);
    await report.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPLOAD_PHOTO',
      entity: 'SiteReport',
      entityId: report.reportId,
      project: report.project,
      projectId: report.projectId,
      details: { photoUrl, clientApproved: false },
    });

    return res.status(201).json({
      success: true,
      message: 'Site photo uploaded successfully for internal review',
      data: photoObj,
    });
  } catch (err) {
    next(err);
  }
}

export async function approveSitePhoto(req, res, next) {
  try {
    const { id, photoId } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { reportId: id };

    const report = await SiteReport.findOne(query);
    if (!report) {
      return res.status(404).json({ success: false, message: `Site report '${id}' not found` });
    }

    const photo = report.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found in site report' });
    }

    photo.clientApproved = true;
    photo.approvedBy = req.user._id;
    photo.approvedAt = new Date();

    await report.save();

    // Notify project client
    const project = await Project.findById(report.project);
    if (project && project.clientUser) {
      await sendNotification({
        recipient: project.clientUser,
        targetRole: 'Client',
        project: project._id,
        title: 'New Site Progress Photo Approved',
        message: `A new verified progress photo has been published to your portal for ${project.name}.`,
        type: 'Site Report',
        link: '/client-portal',
      });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'APPROVE_PHOTO',
      entity: 'SiteReport',
      entityId: report.reportId,
      project: report.project,
      projectId: report.projectId,
      details: { photoId, approved: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Photo approved for Client Portal visibility',
      data: photo,
    });
  } catch (err) {
    next(err);
  }
}

export async function getApprovedClientPhotos(req, res, next) {
  try {
    const { project } = req.query;
    const query = {};

    // Strict client isolation: Clients only see photos for their assigned projects
    if (req.user && req.user.role === 'Client') {
      const clientProjects = await Project.find({ clientUser: req.user._id }).select('_id projectId');
      const allowedIds = clientProjects.map((p) => p._id);
      const allowedIdStrings = clientProjects.map((p) => p.projectId).filter(Boolean);
      query.$or = [{ project: { $in: allowedIds } }, { projectId: { $in: allowedIdStrings } }];
    } else if (project && project !== 'All') {
      const isObjectId = project.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) query.project = project;
      else query.$or = [{ projectId: project }, { projectName: new RegExp(project, 'i') }];
    }

    const reports = await SiteReport.find(query).select('reportId projectName supervisor date photos createdAt');

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
            projectName: r.projectName,
            date: r.date,
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      data: approvedPhotos,
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadSitePhoto(req, res, next) {
  try {
    const { reportId, photoId } = req.params;
    const isObjectId = reportId.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: reportId } : { reportId };

    const report = await SiteReport.findOne(query);
    if (!report) {
      return res.status(404).json({ success: false, message: `Site report '${reportId}' not found` });
    }

    const photo = report.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found in site report' });
    }

    // Client: only approved photos for their assigned projects
    if (req.user.role === 'Client') {
      if (!photo.clientApproved) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: This photo has not been approved for client viewing',
        });
      }
      const project = await Project.findById(report.project);
      if (!project || !project.clientUser || String(project.clientUser) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have access to this project\'s photos',
        });
      }
    }

    // Vendor: only approved photos for projects they are associated with
    if (req.user.role === 'Vendor') {
      if (!photo.clientApproved) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: This photo has not been approved for viewing',
        });
      }
      const project = await Project.findById(report.project);
      if (!project) {
        return res.status(403).json({ success: false, message: 'Forbidden: Project not found' });
      }
      const { default: Vendor } = await import('../models/Vendor.js');
      const { default: PurchaseOrder } = await import('../models/PurchaseOrder.js');
      const vendorRecord = await Vendor.findOne({
        $or: [{ userAccount: req.user._id }, { email: req.user.email }],
      });
      if (!vendorRecord) {
        return res.status(403).json({ success: false, message: 'Forbidden: Vendor profile not found' });
      }
      const hasPO = await PurchaseOrder.exists({ vendor: vendorRecord._id, project: project._id });
      if (!hasPO) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are not associated with this project',
        });
      }
    }

    const photoUrl = photo.url || '';
    if (!photoUrl.startsWith('/uploads/')) {
      return res.status(400).json({
        success: false,
        message: 'Photo file is not available for download (external reference)',
      });
    }

    const uploadsBase = path.resolve('uploads');
    const filePath = path.resolve(photoUrl.replace(/^\//, ''));

    // Path traversal guard
    if (!isSafePath(filePath, uploadsBase)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid file path detected',
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Photo file not found on server' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}
