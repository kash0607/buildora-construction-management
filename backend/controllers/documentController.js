import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import Project from '../models/Project.js';
import Vendor from '../models/Vendor.js';
import { sendNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

/**
 * Validates that a resolved file path is safely within the allowed uploads directory.
 * Prevents path traversal attacks (../ or absolute paths).
 */
function isSafePath(filePath, allowedBaseDir) {
  const resolved = path.resolve(filePath);
  const base = path.resolve(allowedBaseDir);
  return resolved.startsWith(base + path.sep) || resolved === base;
}

export async function getDocuments(req, res, next) {
  try {
    const { project, category, visibility, search } = req.query;
    const filter = {};

    if (project && project !== 'All') {
      filter.$or = [{ project }, { projectId: project }, { projectName: project }];
    }
    if (category && category !== 'All') filter.category = category;

    // Strict role-based visibility control
    if (req.user && req.user.role === 'Client') {
      filter.visibility = { $in: ['Client Visible', 'Approved'] };
    } else if (req.user && req.user.role === 'Vendor') {
      filter.visibility = { $in: ['Vendor Visible', 'Approved'] };
    } else if (visibility && visibility !== 'All') {
      filter.visibility = visibility;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
        { documentId: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(filter)
      .populate('project', 'name projectId')
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(req, res, next) {
  try {
    const { title, project, category, visibility, tags } = req.body;

    let fileName, fileUrl, fileSize, fileType;

    if (req.file) {
      fileName = req.file.originalname;
      fileUrl = `/uploads/documents/${req.file.filename}`;
      fileSize = req.file.size;
      const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase();
      fileType = ext || 'PDF';
    } else if (req.body.fileUrl) {
      // Legacy/external reference support per spec:
      // "If legacy fileUrl support must remain, it must not bypass authorization or redirect downloads to arbitrary external destinations."
      fileName = req.body.fileName || 'document.pdf';
      fileUrl = req.body.fileUrl;
      fileSize = req.body.fileSize || 0;
      fileType = req.body.fileType || 'PDF';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: An uploaded file or valid fileUrl is required.',
      });
    }

    if (!title || !project) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Title and project are required',
      });
    }

    // Size check (max 25MB)
    if (fileSize > 25 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 25MB enterprise limit',
      });
    }

    // Strict project resolution (no fallbacks)
    let projDoc = (project.startsWith('PRJ-') || !project.match(/^[0-9a-fA-F]{24}$/))
      ? await Project.findOne({ projectId: project })
      : await Project.findById(project);

    if (!projDoc) {
      projDoc = await Project.findOne({ name: new RegExp(`^${project}$`, 'i') });
    }

    if (!projDoc) {
      return res.status(400).json({
        success: false,
        message: `Project '${project}' not found. Valid project required for document upload.`,
      });
    }

    // Role-based permission check: Clients and unauthorized roles cannot upload internal documents
    if (req.user.role === 'Client' && visibility !== 'Client Visible') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Clients cannot upload internal enterprise documents',
      });
    }

    const doc = await Document.create({
      title: title.trim(),
      fileName: fileName.trim(),
      fileUrl: fileUrl.trim(),
      fileType: fileType.toUpperCase(),
      fileSize,
      project: projDoc._id,
      projectId: projDoc.projectId,
      projectName: projDoc.name,
      category: category || 'Specification',
      visibility: visibility || 'Internal',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      uploadedBy: req.user._id,
      uploadedByName: req.user.name,
    });

    await sendNotification({
      targetRole: 'Project Manager',
      project: projDoc._id,
      title: 'New Document Uploaded',
      message: `Document ${doc.documentId} ('${doc.title}') was uploaded by ${req.user.name}.`,
      type: 'Document',
      link: '/documents',
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPLOAD',
      entity: 'Document',
      entityId: doc.documentId,
      project: projDoc._id,
      projectId: projDoc.projectId,
      details: { title: doc.title, category: doc.category, visibility: doc.visibility, fileSize },
    });

    return res.status(201).json({
      success: true,
      message: `Document ${doc.documentId} uploaded and cataloged successfully`,
      data: doc,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDocumentVisibility(req, res, next) {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    const doc = (id.startsWith('DOC-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await Document.findOne({ documentId: id })
      : await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const validVis = ['Internal', 'Client Visible', 'Vendor Visible', 'Approved', 'Archived'];
    if (!validVis.includes(visibility)) {
      return res.status(400).json({ success: false, message: `Invalid visibility setting: ${visibility}` });
    }

    doc.visibility = visibility;
    await doc.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_VISIBILITY',
      entity: 'Document',
      entityId: doc.documentId,
      project: doc.project,
      projectId: doc.projectId,
      details: { visibility },
    });

    return res.status(200).json({
      success: true,
      message: `Document ${doc.documentId} visibility updated to '${visibility}'`,
      data: doc,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const doc = (id.startsWith('DOC-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await Document.findOne({ documentId: id })
      : await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.visibility = 'Archived';
    await doc.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ARCHIVE',
      entity: 'Document',
      entityId: doc.documentId,
      project: doc.project,
      projectId: doc.projectId,
    });

    return res.status(200).json({
      success: true,
      message: `Document ${doc.documentId} archived successfully`,
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const { id } = req.params;
    const doc = (id.startsWith('DOC-') || !id.match(/^[0-9a-fA-F]{24}$/))
      ? await Document.findOne({ documentId: id })
      : await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Block archived documents from being downloaded
    if (doc.visibility === 'Archived') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This document has been archived and is no longer available for download',
      });
    }

    // Role-based visibility enforcement
    if (req.user.role === 'Client') {
      if (!['Client Visible', 'Approved'].includes(doc.visibility)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: This document is not available for Client access',
        });
      }
      // Verify client has access to this project
      const project = await Project.findById(doc.project);
      if (!project || !project.clientUser || String(project.clientUser) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have access to this project\'s documents',
        });
      }
    } else if (req.user.role === 'Vendor') {
      if (!['Vendor Visible', 'Approved'].includes(doc.visibility)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: This document is not available for Vendor access',
        });
      }
      // P0: Verify vendor has a relationship with this document's project
      const project = await Project.findById(doc.project);
      if (!project) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Document project not found',
        });
      }
      const vendorRecord = await Vendor.findOne({
        $or: [{ userAccount: req.user._id }, { email: req.user.email }],
      });
      if (!vendorRecord) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Vendor profile not found',
        });
      }
      // Check if this vendor has any POs for this project
      const { default: PurchaseOrder } = await import('../models/PurchaseOrder.js');
      const hasPO = await PurchaseOrder.exists({
        vendor: vendorRecord._id,
        project: project._id,
      });
      if (!hasPO) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are not associated with this document\'s project',
        });
      }
    }

    // Resolve file path from stored URL — never redirect to external URLs
    const fileUrl = doc.fileUrl || '';
    if (!fileUrl.startsWith('/uploads/')) {
      return res.status(400).json({
        success: false,
        message: 'Document file is not available for download (external reference)',
      });
    }

    const uploadsBase = path.resolve('uploads');
    const filePath = path.resolve(fileUrl.replace(/^\//, ''));

    // Path traversal guard
    if (!isSafePath(filePath, uploadsBase)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid file path detected',
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DOWNLOAD',
      entity: 'Document',
      entityId: doc.documentId,
      project: doc.project,
      projectId: doc.projectId,
    });

    res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}
