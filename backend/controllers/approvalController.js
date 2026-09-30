import Approval from '../models/Approval.js';
import Project from '../models/Project.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import { getNextSequence } from '../models/Counter.js';
import { sendNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

export async function getAllApprovals(req, res, next) {
  try {
    const { status, type, project } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (type && type !== 'All') {
      query.type = type;
    }
    if (project && project !== 'All') {
      const isObjectId = project.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        query.project = project;
      } else {
        query.$or = [{ projectId: project }, { projectName: new RegExp(project, 'i') }];
      }
    }

    const approvals = await Approval.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: approvals,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPendingApprovals(req, res, next) {
  try {
    const approvals = await Approval.find({ status: 'Pending' }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: approvals,
    });
  } catch (err) {
    next(err);
  }
}

export async function createApproval(req, res, next) {
  try {
    const { project, category, title, estimatedValue, amount, vendor, priority, type } = req.body;

    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Project is required for approval requests',
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

    if (!projDoc) {
      return res.status(400).json({
        success: false,
        message: `Project '${project}' not found`,
      });
    }

    let candidateAppId;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('approval');
      candidateAppId = `APP-${String(seq + 400).padStart(3, '0')}`;
      exists = await Approval.exists({ approvalId: candidateAppId });
    }
    const approvalId = candidateAppId;
    const requestedBy = req.user
      ? `${req.user.name} (${req.user.role})`
      : (req.body.requestedBy || 'Site Supervisor');

    const approval = await Approval.create({
      approvalId,
      type: type || 'Purchase Request',
      title: title || category || 'Material Requisition',
      project: projDoc._id,
      projectId: projDoc.projectId,
      projectName: projDoc.name,
      requestedBy,
      amount: amount || estimatedValue || '₹0',
      vendor: vendor || 'Pending Vendor Bid',
      priority: priority || 'Normal',
      status: 'Pending',
      createdBy: req.user?._id,
    });

    await sendNotification({
      targetRole: 'Project Manager',
      project: projDoc._id,
      title: 'New Approval Request',
      message: `${approval.title} (${approval.approvalId}) requires review.`,
      type: 'Approval',
      link: '/approvals',
    });

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'CREATE',
      entity: 'Approval',
      entityId: approval.approvalId,
      project: projDoc._id,
      projectId: projDoc.projectId,
      details: { title: approval.title, amount: approval.amount },
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase request routed for approval.',
      data: approval,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleApprovalAction(req, res, next) {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'approve' or 'reject'",
      });
    }

    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { approvalId: id };

    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
    const approval = await Approval.findOneAndUpdate(
      query,
      {
        status: newStatus,
        reviewedBy: req.user ? `${req.user.name} (${req.user.role})` : 'Project Manager',
        reviewedAt: new Date(),
        reviewNotes: notes || '',
      },
      { returnDocument: 'after' }
    );

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: `Approval request '${id}' not found`,
      });
    }

    // Sync with linked Purchase Request
    if (approval.purchaseRequest) {
      await PurchaseRequest.findByIdAndUpdate(approval.purchaseRequest, {
        status: newStatus,
      });
    }

    // Dispatch notification
    await sendNotification({
      recipient: approval.createdBy,
      project: approval.project,
      title: `Approval Request ${newStatus}`,
      message: `Your approval request ${approval.approvalId} was ${newStatus.toLowerCase()}.`,
      type: 'Approval',
      link: '/approvals',
    });

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: action.toUpperCase(),
      entity: 'Approval',
      entityId: approval.approvalId,
      project: approval.project,
      projectId: approval.projectId,
      details: { status: newStatus, notes },
    });

    return res.status(200).json({
      success: true,
      message: `Request ${id} ${newStatus} successfully.`,
      data: approval,
    });
  } catch (err) {
    next(err);
  }
}
