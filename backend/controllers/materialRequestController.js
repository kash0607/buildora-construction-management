import MaterialRequest from '../models/MaterialRequest.js';
import { inventoryService } from '../services/inventoryService.js';
import { validateApprovalTransition } from '../services/businessRules.js';

/**
 * @desc    Get all material requests with filtering
 * @route   GET /api/material-requests
 * @access  Private
 */
export async function getMaterialRequests(req, res, next) {
  try {
    const { status, project } = req.query;
    const requests = await inventoryService.getMaterialRequests({ status, project });
    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Create a new material request
 * @route   POST /api/material-requests
 * @access  Private (Site Supervisor, PM, Admin)
 */
export async function createMaterialRequest(req, res, next) {
  try {
    const { materialName, projectId, projectName, quantity, unit, requiredByDate, notes } = req.body;

    if (!materialName || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Material name and quantity are required.',
      });
    }

    const request = await inventoryService.createMaterialRequest(
      {
        materialName,
        projectId: projectId || 'PRJ-101',
        projectName: projectName || 'Site Project',
        quantity: Number(quantity),
        unit: unit || 'units',
        requiredByDate,
        notes,
      },
      req.user
    );

    return res.status(201).json({
      success: true,
      message: 'Material request submitted for procurement approval.',
      data: request,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update material request status (Approve, Reject, Fulfill)
 * @route   PUT /api/material-requests/:id
 * @access  Private (PM, Procurement Manager, Admin)
 */
export async function updateMaterialRequestStatus(req, res, next) {
  try {
    const { status, reviewNotes } = req.body;
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const request = await MaterialRequest.findOne(query);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Material request '${req.params.id}' not found`,
      });
    }

    if (status) {
      // Validate state transition if moving to Approved or Rejected
      if (['Approved', 'Rejected'].includes(status)) {
        const check = validateApprovalTransition(request.status, status);
        if (!check.valid) {
          return res.status(400).json({
            success: false,
            message: check.error,
          });
        }
      }

      request.status = status;
      request.reviewedBy = req.user ? req.user.name : 'Procurement Head';
      request.reviewedAt = new Date();
      if (reviewNotes) request.reviewNotes = reviewNotes;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: `Material request status updated to '${status}'.`,
      data: request,
    });
  } catch (err) {
    next(err);
  }
}
