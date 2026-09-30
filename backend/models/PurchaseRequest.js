import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const purchaseRequestItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.01, 'Quantity must be greater than zero'],
  },
  unit: {
    type: String,
    default: 'units',
  },
  estimatedRate: {
    type: Number,
    default: 0,
  },
  estimatedTotal: {
    type: Number,
    default: 0,
  },
});

const purchaseRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Purchase Request title is required'],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project association is required'],
    },
    projectId: {
      type: String,
      default: '',
    },
    projectName: {
      type: String,
      default: '',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedByName: {
      type: String,
      default: '',
    },
    items: {
      type: [purchaseRequestItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A purchase request must include at least one item',
      },
    },
    totalEstimatedAmount: {
      type: Number,
      default: 0,
    },
    requiredDate: {
      type: Date,
      required: [true, 'Required delivery date is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Converted', 'Cancelled'],
      default: 'Pending Approval',
    },
    approval: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Approval',
      default: null,
    },
    convertedPO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate requestId
purchaseRequestSchema.pre('save', async function () {
  if (!this.requestId) {
    let candidateId;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('purchaseRequest');
      candidateId = `PR-${String(seq + 200).padStart(3, '0')}`;
      exists = await mongoose.models.PurchaseRequest?.exists({ requestId: candidateId });
    }
    this.requestId = candidateId;
  }
  // Compute total
  if (this.items && this.items.length > 0) {
    this.totalEstimatedAmount = this.items.reduce((sum, item) => sum + (item.quantity * (item.estimatedRate || 0)), 0);
  }
});

const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema);
export default PurchaseRequest;
