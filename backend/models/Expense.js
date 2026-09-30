import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const expenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
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
    category: {
      type: String,
      enum: [
        'Labor',
        'Materials',
        'Equipment',
        'Subcontractor',
        'Permits & Legal',
        'Site Overhead',
        'Fuel & Power',
        'Safety & Compliance',
        'Other',
      ],
      default: 'Materials',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Expense amount must be positive'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
    supportingDocument: {
      type: String,
      default: '',
    },
    vendor: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
      default: 'Pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate expenseId
expenseSchema.pre('save', async function () {
  if (!this.expenseId) {
    let candidateId;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('expense');
      candidateId = `EXP-${String(seq + 500).padStart(3, '0')}`;
      exists = await mongoose.models.Expense?.exists({ expenseId: candidateId });
    }
    this.expenseId = candidateId;
  }
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
