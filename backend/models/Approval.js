import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    approvalId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Purchase Request', 'Material Requisition', 'Site Variance Claim', 'Disbursement'],
      default: 'Purchase Request',
    },
    title: {
      type: String,
      required: [true, 'Approval item title is required'],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    projectId: {
      type: String,
      index: true,
    },
    projectName: {
      type: String,
      default: 'Site Location',
    },
    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: String,
      required: true,
      default: '₹0',
    },
    amountNum: {
      type: Number,
      default: 0,
    },
    vendor: {
      type: String,
      default: 'Pending Vendor Bid',
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Normal', 'Low'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    date: {
      type: String,
      default: () => 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret.approvalId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

approvalSchema.index({ createdAt: -1 });

const Approval = mongoose.model('Approval', approvalSchema);
export default Approval;
