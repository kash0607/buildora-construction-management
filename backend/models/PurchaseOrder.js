import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const purchaseOrderItemSchema = new mongoose.Schema({
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
    min: [0.01, 'Quantity must be positive'],
  },
  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  unit: {
    type: String,
    default: 'units',
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'PO Title or Description is required'],
      trim: true,
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
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    vendorName: {
      type: String,
      default: '',
    },
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseRequest',
      default: null,
    },
    items: {
      type: [purchaseOrderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A Purchase Order must contain at least one line item',
      },
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 18, // 18% GST standard
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Pending Approval',
        'Approved',
        'Rejected',
        'Issued',
        'Partially Delivered',
        'Delivered',
        'Cancelled',
      ],
      default: 'Draft',
    },
    issuedDate: {
      type: Date,
      default: null,
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Target delivery date is required'],
    },
    paymentTerms: {
      type: String,
      default: 'Net 30 Days',
    },
    shippingAddress: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate poNumber and calculate totals
purchaseOrderSchema.pre('save', async function () {
  if (!this.poNumber) {
    let candidateNumber;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('purchaseOrder');
      candidateNumber = `PO-${String(seq + 300).padStart(3, '0')}`;
      exists = await mongoose.models.PurchaseOrder?.exists({ poNumber: candidateNumber });
    }
    this.poNumber = candidateNumber;
  }

  if (this.items && this.items.length > 0) {
    let sub = 0;
    this.items.forEach((item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      sub += item.totalPrice;
    });
    this.subtotal = sub;
    this.taxAmount = (this.subtotal * (this.taxRate || 0)) / 100;
    this.grandTotal = this.subtotal + this.taxAmount;
  }
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export default PurchaseOrder;
