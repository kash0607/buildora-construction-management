import mongoose from 'mongoose';

export const TRANSACTION_TYPES = ['IN', 'OUT', 'ADJUSTMENT'];

const inventoryTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material reference is required'],
      index: true,
    },
    materialName: {
      type: String,
      required: true,
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
      default: 'General Store',
    },
    type: {
      type: String,
      enum: {
        values: TRANSACTION_TYPES,
        message: '{VALUE} is not a valid transaction type',
      },
      required: [true, 'Transaction type is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.001, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      required: true,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    reference: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    performedBy: {
      type: String,
      default: 'System User',
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
        ret.id = ret.transactionId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

inventoryTransactionSchema.index({ createdAt: -1 });

const InventoryTransaction = mongoose.model(
  'InventoryTransaction',
  inventoryTransactionSchema
);
export default InventoryTransaction;
