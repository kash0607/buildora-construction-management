import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const deliveryItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  orderedQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  receivedQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  acceptedQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  rejectedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  unit: {
    type: String,
    default: 'units',
  },
  qualityStatus: {
    type: String,
    enum: ['Passed', 'Partially Rejected', 'Rejected'],
    default: 'Passed',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
});

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      unique: true,
      index: true,
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
    },
    poNumber: {
      type: String,
      required: true,
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
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    vendorName: {
      type: String,
      default: '',
    },
    deliveryDate: {
      type: Date,
      default: Date.now,
    },
    deliveryChallanNumber: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    items: {
      type: [deliveryItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Delivery receipt must contain at least one item',
      },
    },
    qualityStatus: {
      type: String,
      enum: ['Passed', 'Partially Rejected', 'Rejected'],
      default: 'Passed',
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receivedByName: {
      type: String,
      default: '',
    },
    inventoryUpdated: {
      type: Boolean,
      default: false,
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

// Auto-generate deliveryNumber
deliverySchema.pre('save', async function () {
  if (!this.deliveryNumber) {
    let candidateNumber;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('delivery');
      candidateNumber = `DEL-${String(seq + 400).padStart(3, '0')}`;
      exists = await mongoose.models.Delivery?.exists({ deliveryNumber: candidateNumber });
    }
    this.deliveryNumber = candidateNumber;
  }
});

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
