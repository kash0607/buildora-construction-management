import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      unique: true,
      index: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    invoiceNumber: {
      type: String,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be positive'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Completed',
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer / NEFT', 'RTGS', 'Cheque', 'Corporate Card', 'UPI', 'Cash'],
      default: 'Bank Transfer / NEFT',
    },
    transactionReference: {
      type: String,
      required: [true, 'Transaction/Reference number is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate paymentNumber
paymentSchema.pre('save', async function () {
  if (!this.paymentNumber) {
    let candidateNumber;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('payment');
      candidateNumber = `PAY-${String(seq + 700).padStart(3, '0')}`;
      exists = await mongoose.models.Payment?.exists({ paymentNumber: candidateNumber });
    }
    this.paymentNumber = candidateNumber;
  }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
