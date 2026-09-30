import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Delivery from '../models/Delivery.js';
import Material from '../models/Material.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Approval from '../models/Approval.js';
import { getNextSequence } from '../models/Counter.js';
import { sendNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';
import {
  validatePOTransition,
  calculatePOFulfillmentStatus,
  validateDeliveryQuantities,
} from '../services/businessRules.js';

async function resolveMaterialId(mat) {
  if (!mat) return null;
  if (typeof mat === 'object' && mat._id) return mat._id;
  const str = String(mat).trim();
  if (str.match(/^[0-9a-fA-F]{24}$/)) return str;
  if (str.startsWith('MAT-')) {
    const doc = await Material.findOne({ materialId: str });
    return doc ? doc._id : null;
  }
  return null;
}

// ==========================================
// 1. VENDORS
// ==========================================

export async function getVendors(req, res, next) {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { vendorId: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
      ];
    }

    const vendors = await Vendor.find(filter).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (err) {
    next(err);
  }
}

export async function getVendorById(req, res, next) {
  try {
    const { id } = req.params;
    const vendor = (id.startsWith('VND-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await Vendor.findOne({ vendorId: id })
      : await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    return res.status(200).json({ success: true, data: vendor });
  } catch (err) {
    next(err);
  }
}

export async function createVendor(req, res, next) {
  try {
    const { name, email, phone, contactPerson, address, categories, taxId, paymentTerms } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Vendor name and email are required',
      });
    }

    const vendor = await Vendor.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      contactPerson: contactPerson || '',
      address: address || '',
      categories: Array.isArray(categories) ? categories : [categories || 'General Construction'],
      taxId: taxId || '',
      paymentTerms: paymentTerms || 'Net 30 Days',
    });

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'CREATE',
      entity: 'Vendor',
      entityId: vendor.vendorId,
      details: { name: vendor.name, email: vendor.email },
    });

    return res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateVendor(req, res, next) {
  try {
    const { id } = req.params;
    const vendor = (id.startsWith('VND-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await Vendor.findOne({ vendorId: id })
      : await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    Object.assign(vendor, req.body);
    await vendor.save();

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'UPDATE',
      entity: 'Vendor',
      entityId: vendor.vendorId,
      details: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteVendor(req, res, next) {
  try {
    const { id } = req.params;
    const vendor = (id.startsWith('VND-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await Vendor.findOne({ vendorId: id })
      : await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendor.status = 'Inactive';
    await vendor.save();

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'DELETE',
      entity: 'Vendor',
      entityId: vendor.vendorId,
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor marked as inactive',
      data: vendor,
    });
  } catch (err) {
    next(err);
  }
}

export async function provisionVendorAccount(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const vendor = (id.startsWith('VND-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await Vendor.findOne({ vendorId: id })
      : await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (vendor.userAccount) {
      const existingUser = await User.findById(vendor.userAccount);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `Vendor already has an active portal user account (${existingUser.email})`,
        });
      }
    }

    let user = await User.findOne({ email: vendor.email });
    if (!user) {
      user = await User.create({
        name: vendor.contactPerson || vendor.name,
        email: vendor.email,
        password: password || 'Vendor@123',
        role: 'Vendor',
        phone: vendor.phone || '',
      });
    } else {
      user.role = 'Vendor';
      await user.save();
    }

    vendor.userAccount = user._id;
    await vendor.save();

    await sendNotification({
      recipient: user._id,
      targetRole: 'Vendor',
      title: 'Vendor Portal Account Activated',
      message: `Your Buildora Vendor Portal account is ready for ${vendor.name}.`,
      type: 'System',
      link: '/vendor-portal',
    });

    await logAudit({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'System',
      action: 'PROVISION',
      entity: 'Vendor',
      entityId: vendor.vendorId,
      details: { userAccount: user._id, email: user.email },
    });

    return res.status(201).json({
      success: true,
      message: `Vendor portal account provisioned for ${vendor.name}`,
      data: {
        vendor,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. PURCHASE REQUESTS (PR)
// ==========================================

export async function getPurchaseRequests(req, res, next) {
  try {
    const { status, project } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (project && project !== 'All') {
      filter.$or = [{ project }, { projectId: project }, { projectName: project }];
    }

    const prs = await PurchaseRequest.find(filter)
      .populate('project', 'name projectId')
      .populate('requestedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: prs,
    });
  } catch (err) {
    next(err);
  }
}

export async function createPurchaseRequest(req, res, next) {
  try {
    const { title, project, items, requiredDate, priority, notes } = req.body;

    if (!title || !project || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Title, project, and at least one item are required',
      });
    }

    // Resolve project strictly from DB (no fallbacks)
    let projDoc = (project.startsWith('PRJ-') || !project.match(/^[0-9a-fA-F]{24}$/))
      ? await Project.findOne({ projectId: project })
      : await Project.findById(project);

    if (!projDoc) {
      projDoc = await Project.findOne({ name: new RegExp(`^${project}$`, 'i') });
    }

    if (!projDoc) {
      return res.status(400).json({
        success: false,
        message: `Project '${project}' not found. Valid project required.`,
      });
    }

    const resolvedItems = await Promise.all(
      items.map(async (it) => ({
        ...it,
        material: await resolveMaterialId(it.material),
      }))
    );

    const pr = await PurchaseRequest.create({
      title: title.trim(),
      project: projDoc._id,
      projectId: projDoc.projectId,
      projectName: projDoc.name,
      requestedBy: req.user._id,
      requestedByName: req.user.name,
      items: resolvedItems,
      requiredDate: requiredDate || new Date(Date.now() + 7 * 86400000),
      priority: priority || 'Medium',
      notes: notes || '',
      status: 'Pending Approval',
    });

    // Authoritative approval link
    let candidateAppId;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('approval');
      candidateAppId = `APP-${String(seq + 400).padStart(3, '0')}`;
      exists = await Approval.exists({ approvalId: candidateAppId });
    }
    const approvalId = candidateAppId;
    const approval = await Approval.create({
      approvalId,
      type: 'Purchase Request',
      title: `PR: ${pr.title}`,
      project: projDoc._id,
      projectId: projDoc.projectId,
      projectName: projDoc.name,
      requestedBy: `${req.user.name} (${req.user.role})`,
      amount: `₹${(pr.totalEstimatedAmount || 0).toLocaleString('en-IN')}`,
      amountNum: pr.totalEstimatedAmount || 0,
      priority: pr.priority || 'Normal',
      status: 'Pending',
      createdBy: req.user._id,
      purchaseRequest: pr._id,
      purchaseRequestId: pr.requestId,
    });

    pr.approval = approval._id;
    await pr.save();

    await sendNotification({
      targetRole: 'Project Manager',
      project: projDoc._id,
      title: 'New Purchase Request Pending Approval',
      message: `Purchase Request ${pr.requestId} (${pr.title}) requires approval.`,
      type: 'Procurement',
      link: '/procurement',
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entity: 'PurchaseRequest',
      entityId: pr.requestId,
      project: projDoc._id,
      projectId: projDoc.projectId,
      details: { totalEstimatedAmount: pr.totalEstimatedAmount, approvalId: approval.approvalId },
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase request created successfully and routed to Authoritative Approval workflow',
      data: pr,
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePurchaseRequestStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const pr = (id.startsWith('PR-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await PurchaseRequest.findOne({ requestId: id })
      : await PurchaseRequest.findById(id);

    if (!pr) {
      return res.status(404).json({ success: false, message: 'Purchase request not found' });
    }

    const validStatuses = ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Converted', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid PR status: ${status}` });
    }

    // Direct status change to Approved without Approval record is disallowed (except by Admin)
    if (status === 'Approved' && req.user.role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'Direct status change to Approved is disallowed. Purchase Requests must be approved via the Authoritative Approval workflow.',
      });
    }

    pr.status = status;
    if (notes) pr.notes = `${pr.notes ? pr.notes + ' | ' : ''}${notes}`;
    await pr.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_STATUS',
      entity: 'PurchaseRequest',
      entityId: pr.requestId,
      project: pr.project,
      projectId: pr.projectId,
      details: { status, notes },
    });

    return res.status(200).json({
      success: true,
      message: `Purchase request status updated to ${status}`,
      data: pr,
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. PURCHASE ORDERS (PO)
// ==========================================

export async function getPurchaseOrders(req, res, next) {
  try {
    const { status, project, vendor } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (project && project !== 'All') {
      filter.$or = [{ project }, { projectId: project }, { projectName: project }];
    }
    if (vendor && vendor !== 'All') {
      filter.$or = [{ vendor }, { vendorName: vendor }];
    }

    // Role-specific scoping for Vendor: Vendors only see their assigned POs
    if (req.user && req.user.role === 'Vendor') {
      const vDoc = await Vendor.findOne({
        $or: [{ userAccount: req.user._id }, { email: req.user.email }],
      });
      if (vDoc) {
        filter.vendor = vDoc._id;
      } else {
        filter.vendor = null;
      }
    }

    const pos = await PurchaseOrder.find(filter)
      .populate('project', 'name projectId location')
      .populate('vendor', 'name vendorId email phone')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: pos,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPurchaseOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const po = (id.startsWith('PO-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await PurchaseOrder.findOne({ poNumber: id })
      : await PurchaseOrder.findById(id);

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    // Role check for vendor
    if (req.user && req.user.role === 'Vendor') {
      const vDoc = await Vendor.findOne({
        $or: [{ userAccount: req.user._id }, { email: req.user.email }],
      });
      if (!vDoc || String(po.vendor) !== String(vDoc._id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Access denied to this order' });
      }
    }

    await po.populate('project', 'name projectId');
    await po.populate('vendor', 'name vendorId email phone address');
    await po.populate('createdBy', 'name email role');

    return res.status(200).json({ success: true, data: po });
  } catch (err) {
    next(err);
  }
}

export async function createPurchaseOrder(req, res, next) {
  try {
    const {
      title,
      project,
      vendor,
      purchaseRequest,
      items,
      deliveryDate,
      taxRate,
      paymentTerms,
      notes,
    } = req.body;

    if (!title || !vendor || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Title, Vendor, and at least one item are required',
      });
    }

    // Enforce Item 8: Purchase Request approval required before PO creation
    if (!purchaseRequest) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: An approved Purchase Request reference is required to create a Purchase Order',
      });
    }

    const pr = (purchaseRequest.startsWith('PR-') || !purchaseRequest.match(/^[0-9a-fA-F]{24}$/))
      ? await PurchaseRequest.findOne({ requestId: purchaseRequest })
      : await PurchaseRequest.findById(purchaseRequest);

    if (!pr) {
      return res.status(400).json({
        success: false,
        message: `Referenced Purchase Request '${purchaseRequest}' not found`,
      });
    }

    if (pr.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot create Purchase Order: Purchase Request '${pr.requestId}' is not approved (current status: '${pr.status}'). PO creation requires an Approved PR.`,
      });
    }

    // Resolve Project strictly from PR or explicit project
    const targetProject = project || pr.project;
    let projDoc = (typeof targetProject === 'string' && (targetProject.startsWith('PRJ-') || !targetProject.match(/^[0-9a-fA-F]{24}$/)))
      ? await Project.findOne({ projectId: targetProject })
      : await Project.findById(targetProject);

    if (!projDoc) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: A valid project is required for Purchase Order',
      });
    }

    // Resolve Vendor strictly (no fallback to 'Selected Vendor')
    let vDoc = (vendor.startsWith('VND-') || !vendor.match(/^[0-9a-fA-F]{24}$/))
      ? await Vendor.findOne({ vendorId: vendor })
      : await Vendor.findById(vendor);

    if (!vDoc) {
      return res.status(400).json({
        success: false,
        message: `Vendor '${vendor}' not found`,
      });
    }

    const resolvedItems = await Promise.all(
      items.map(async (it) => ({
        ...it,
        material: await resolveMaterialId(it.material),
      }))
    );

    const po = await PurchaseOrder.create({
      title: title.trim(),
      project: projDoc._id,
      projectId: projDoc.projectId,
      projectName: projDoc.name,
      vendor: vDoc._id,
      vendorName: vDoc.name,
      purchaseRequest: pr._id,
      items: resolvedItems,
      deliveryDate: deliveryDate || new Date(Date.now() + 14 * 86400000),
      taxRate: taxRate !== undefined ? Number(taxRate) : 18,
      paymentTerms: paymentTerms || vDoc.paymentTerms || 'Net 30 Days',
      notes: notes || '',
      status: 'Issued',
      issuedDate: new Date(),
      createdBy: req.user._id,
    });

    // Update PR to Converted
    pr.status = 'Converted';
    pr.convertedPO = po._id;
    await pr.save();

    await sendNotification({
      recipient: vDoc.userAccount || null,
      targetRole: 'Vendor',
      project: projDoc._id,
      title: 'New Purchase Order Issued',
      message: `Purchase Order ${po.poNumber} has been issued to ${vDoc.name}.`,
      type: 'Procurement',
      link: '/vendor-portal',
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE',
      entity: 'PurchaseOrder',
      entityId: po.poNumber,
      project: projDoc._id,
      projectId: projDoc.projectId,
      details: { vendor: vDoc.name, grandTotal: po.grandTotal, purchaseRequest: pr.requestId },
    });

    return res.status(201).json({
      success: true,
      message: `Purchase Order ${po.poNumber} created and issued successfully`,
      data: po,
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePurchaseOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const po = (id.startsWith('PO-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await PurchaseOrder.findOne({ poNumber: id })
      : await PurchaseOrder.findById(id);

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    const validation = validatePOTransition(po.status, status);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    po.status = status;
    if (status === 'Issued' && !po.issuedDate) {
      po.issuedDate = new Date();
    }
    if (notes) po.notes = `${po.notes ? po.notes + ' | ' : ''}${notes}`;
    await po.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_STATUS',
      entity: 'PurchaseOrder',
      entityId: po.poNumber,
      project: po.project,
      projectId: po.projectId,
      details: { status, notes },
    });

    return res.status(200).json({
      success: true,
      message: `Purchase Order ${po.poNumber} transitioned to ${status}`,
      data: po,
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. DELIVERIES & GOODS RECEIPT (GRN)
// ==========================================

export async function getDeliveries(req, res, next) {
  try {
    const { poNumber, project } = req.query;
    const filter = {};

    if (poNumber) filter.poNumber = poNumber;
    if (project && project !== 'All') {
      filter.$or = [{ project }, { projectId: project }];
    }

    const deliveries = await Delivery.find(filter)
      .populate('purchaseOrder', 'poNumber title status totalAmount')
      .populate('project', 'name projectId')
      .populate('vendor', 'name vendorId')
      .populate('receivedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: deliveries,
    });
  } catch (err) {
    next(err);
  }
}

export async function createDelivery(req, res, next) {
  let session = null;
  let useTransaction = false;

  const isReplicaSet = Boolean(
    mongoose.connection?.client?.topology?.description?.setName ||
    mongoose.connection?.client?.topology?.description?.type?.includes('ReplicaSet')
  );

  if (isReplicaSet) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch {
      useTransaction = false;
      if (session) session.endSession();
      session = null;
    }
  }

  try {
    const {
      purchaseOrder: poIdInput,
      deliveryChallanNumber,
      vehicleNumber,
      items,
      qualityStatus,
      notes,
    } = req.body;

    if (!poIdInput || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: PO reference and delivery items are required',
      });
    }

    const po = (poIdInput.startsWith('PO-') || !poIdInput.match(/^[0-9a-fA-F]{24}$/))
      ? await PurchaseOrder.findOne({ poNumber: poIdInput })
      : await PurchaseOrder.findById(poIdInput);

    if (!po) {
      return res.status(404).json({ success: false, message: 'Referenced Purchase Order not found' });
    }

    if (po.status === 'Cancelled' || po.status === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: `Cannot receive delivery for PO with status '${po.status}'`,
      });
    }

    const qtyValidation = validateDeliveryQuantities(po.items, items);
    if (!qtyValidation.valid) {
      return res.status(400).json({ success: false, message: qtyValidation.error });
    }

    const resolvedItems = await Promise.all(
      items.map(async (it) => ({
        ...it,
        material: await resolveMaterialId(it.material),
      }))
    );

    // Create delivery record with session
    const deliveryOptions = useTransaction && session ? { session } : {};
    const [delivery] = await Delivery.create(
      [
        {
          purchaseOrder: po._id,
          poNumber: po.poNumber,
          project: po.project,
          projectId: po.projectId,
          vendor: po.vendor,
          vendorName: po.vendorName,
          deliveryChallanNumber: deliveryChallanNumber || '',
          vehicleNumber: vehicleNumber || '',
          items: resolvedItems,
          qualityStatus: qualityStatus || 'Passed',
          receivedBy: req.user._id,
          receivedByName: req.user.name,
          notes: notes || '',
          inventoryUpdated: false,
        },
      ],
      deliveryOptions
    );

    // 1. Update PO receivedQuantity for each item
    resolvedItems.forEach((dItem) => {
      const accepted = Number(dItem.acceptedQuantity) || 0;
      const poItem = po.items.find(
        (pi) => (dItem.material && String(pi.material) === String(dItem.material)) || pi.name === dItem.name
      );
      if (poItem) {
        poItem.receivedQuantity = (poItem.receivedQuantity || 0) + accepted;
      }
    });

    // 2. Compute new PO status based on total fulfillment
    const newPOStatus = calculatePOFulfillmentStatus(po.items);
    po.status = newPOStatus;
    await po.save(deliveryOptions);

    // 3. Update Material stock & create InventoryTransaction for each accepted item
    for (const dItem of resolvedItems) {
      const accepted = Number(dItem.acceptedQuantity) || 0;
      if (accepted > 0) {
        let mat = null;
        if (dItem.material) {
          mat = await Material.findById(dItem.material);
        }
        if (!mat) {
          mat = await Material.findOne({ name: dItem.name });
        }

        if (mat) {
          mat.currentStock = (mat.currentStock || 0) + accepted;
          mat.status = (mat.currentStock <= (mat.reorderLevel || 10)) ? 'Low Stock' : 'In Stock';
          await mat.save(deliveryOptions);

          await InventoryTransaction.create(
            [
              {
                material: mat._id,
                materialName: mat.name,
                type: 'IN',
                quantity: accepted,
                unit: mat.unit || dItem.unit || 'units',
                project: po.project,
                reference: delivery.deliveryNumber,
                performedBy: req.user._id,
                performedByName: req.user.name,
                notes: `Delivery received from ${po.vendorName} for ${po.poNumber}. Status: ${dItem.qualityStatus}`,
              },
            ],
            deliveryOptions
          );

          // Low stock alert event
          if (mat.status === 'Low Stock' || mat.status === 'Out of Stock') {
            await sendNotification({
              targetRole: 'Project Manager',
              project: po.project,
              title: `Material Low Stock Alert: ${mat.name}`,
              message: `${mat.name} is at ${mat.currentStock} ${mat.unit} (reorder level: ${mat.reorderLevel})`,
              type: 'Inventory',
              link: '/inventory',
            });
          }
        }
      }
    }

    delivery.inventoryUpdated = true;
    await delivery.save(deliveryOptions);

    if (useTransaction && session && session.inTransaction()) {
      await session.commitTransaction();
    }

    await sendNotification({
      targetRole: 'Project Manager',
      project: po.project,
      title: 'Goods Delivery Received',
      message: `Delivery ${delivery.deliveryNumber} processed for ${po.poNumber}. PO status: ${newPOStatus}.`,
      type: 'Procurement',
      link: '/procurement',
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELIVERY_RECEIVE',
      entity: 'Delivery',
      entityId: delivery.deliveryNumber,
      project: po.project,
      projectId: po.projectId,
      details: { poNumber: po.poNumber, status: newPOStatus, itemsCount: resolvedItems.length },
    });

    return res.status(201).json({
      success: true,
      message: `Delivery ${delivery.deliveryNumber} processed successfully. PO updated to '${newPOStatus}' and inventory updated.`,
      data: {
        delivery,
        poStatus: newPOStatus,
      },
    });
  } catch (err) {
    if (useTransaction && session && session.inTransaction()) {
      await session.abortTransaction();
    }
    next(err);
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
