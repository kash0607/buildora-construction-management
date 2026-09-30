import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const vendorSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    contactPerson: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vendor email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    categories: {
      type: [String],
      default: ['General Construction'],
    },
    taxId: {
      type: String,
      default: '', // GSTIN / Tax Identification
    },
    paymentTerms: {
      type: String,
      default: 'Net 30 Days',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.5,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Blacklisted'],
      default: 'Active',
    },
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Auto-generate vendorId
vendorSchema.pre('save', async function () {
  if (!this.vendorId) {
    let candidateId;
    let exists = true;
    while (exists) {
      const seq = await getNextSequence('vendor');
      candidateId = `VND-${String(seq + 100).padStart(3, '0')}`;
      exists = await mongoose.models.Vendor?.exists({ vendorId: candidateId });
    }
    this.vendorId = candidateId;
  }
});

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
