import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: 'PDF',
    },
    fileSize: {
      type: Number,
      default: 1048576, // bytes
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    projectId: {
      type: String,
      default: '',
    },
    projectName: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'Architectural Drawing',
        'Structural Calculation',
        'Vendor Contract',
        'Safety Permit',
        'Site Inspection',
        'Client Invoice',
        'Specification',
        'Other',
      ],
      default: 'Specification',
    },
    visibility: {
      type: String,
      enum: ['Internal', 'Client Visible', 'Vendor Visible', 'Approved', 'Archived'],
      default: 'Internal',
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedByName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate documentId
documentSchema.pre('save', async function () {
  if (!this.documentId) {
    let seq = await getNextSequence('document');
    let documentId = `DOC-${String(seq + 800).padStart(3, '0')}`;
    while (await mongoose.models.Document.exists({ documentId })) {
      seq = await getNextSequence('document');
      documentId = `DOC-${String(seq + 800).padStart(3, '0')}`;
    }
    this.documentId = documentId;
  }
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
