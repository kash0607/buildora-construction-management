import Approval from '../models/Approval.js';
import Project from '../models/Project.js';

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

    const count = await Approval.countDocuments();
    const approvalId = `APP-${401 + count}`;
    const requestedBy = req.user
      ? `${req.user.name} (${req.user.role})`
      : (req.body.requestedBy || 'Site Supervisor');

    const approval = await Approval.create({
      approvalId,
      type: type || 'Purchase Request',
      title: title || category || 'Material Requisition',
      project: projectRef,
      projectId: projId,
      projectName: foundProject ? foundProject.name : pName,
      requestedBy,
      amount: amount || estimatedValue || '₹5,00,000',
      vendor: vendor || 'Pending Vendor Bid',
      priority: priority || 'Normal',
      status: 'Pending',
      createdBy: req.user?._id,
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
      { new: true }
    );

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: `Approval request '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Request ${id} ${newStatus} successfully.`,
      data: approval,
    });
  } catch (err) {
    next(err);
  }
}
