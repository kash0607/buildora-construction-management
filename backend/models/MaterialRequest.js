import mongoose from 'mongoose';

export const MATERIAL_REQUEST_STATUSES = ['Pending', 'Approved', 'Rejected', 'Fulfilled'];

const materialRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
    },
    materialName: {
      type: String,
      required: [true, 'Material name is required'],
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
      default: 'Site Operation',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
    },
    requiredByDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    requestedBy: {
      type: String,
      required: true,
      default: 'Site Supervisor',
    },
    status: {
      type: String,
      enum: {
        values: MATERIAL_REQUEST_STATUSES,
        message: '{VALUE} is not a valid request status',
      },
      default: 'Pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      default: '',
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
        ret.id = ret.requestId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

materialRequestSchema.index({ createdAt: -1 });

const MaterialRequest = mongoose.model('MaterialRequest', materialRequestSchema);
export default MaterialRequest;
