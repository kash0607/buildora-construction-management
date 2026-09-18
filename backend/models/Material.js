import mongoose from 'mongoose';

export const MATERIAL_UNITS = ['kg', 'ton', 'bag', 'm3', 'litre', 'piece', 'box', 'meter', 'sqm'];
export const MATERIAL_STATUSES = ['In Stock', 'Low Stock', 'Out of Stock'];
export const MATERIAL_CATEGORIES = [
  'Structural & Civil',
  'Masonry & Precast',
  'Aggregates & Sand',
  'Cement & Binders',
  'Electrical & Conduits',
  'Plumbing & Drainage',
  'Waterproofing & Chemicals',
  'Finishes & Paints',
  'Miscellaneous'
];

/**
 * Derives material stock status from current stock and reorder level.
 */
export function deriveStockStatus(currentStock, reorderLevel) {
  const stock = Number(currentStock) || 0;
  const reorder = Number(reorderLevel) || 0;
  if (stock <= 0) return 'Out of Stock';
  if (stock <= reorder) return 'Low Stock';
  return 'In Stock';
}

const materialSchema = new mongoose.Schema(
  {
    materialId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Structural & Civil',
      index: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      default: 'bag',
    },
    description: {
      type: String,
      default: '',
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
      default: 'Global Inventory',
    },
    currentStock: {
      type: Number,
      required: [true, 'Current stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    minimumStock: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      default: 10,
      min: [0, 'Reorder level cannot be negative'],
    },
    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: MATERIAL_STATUSES,
        message: '{VALUE} is not a valid material status',
      },
      default: 'In Stock',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret.materialId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to ensure status matches current stock levels
materialSchema.pre('save', function () {
  this.status = deriveStockStatus(this.currentStock, this.reorderLevel);
});

const Material = mongoose.model('Material', materialSchema);
export default Material;
