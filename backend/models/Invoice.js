import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Invoice title/description is required'],
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
    client: {
      type: String,
      required: [true, 'Client or billing entity is required'],
      trim: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 18,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Invoice due date is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Issued',
    },
    documentReference: {
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

// Auto-generate invoiceNumber and calculate totals
invoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    let candidateNumber;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('invoice');
      candidateNumber = `INV-${String(seq + 600).padStart(3, '0')}`;
      exists = await mongoose.models.Invoice?.exists({ invoiceNumber: candidateNumber });
    }
    this.invoiceNumber = candidateNumber;
  }
  this.taxAmount = (this.subtotal * (this.taxRate || 0)) / 100;
  this.totalAmount = this.subtotal + this.taxAmount;
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
