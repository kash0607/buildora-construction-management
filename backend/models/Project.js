import mongoose from 'mongoose';

export const PROJECT_STATUSES = ['Planning', 'Active', 'Delayed', 'Completed', 'Archived'];

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: 'Team Member' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      index: true,
    },
    client: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    manager: {
      type: String,
      required: [true, 'Project Manager is required'],
      trim: true,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be a non-negative number'],
    },
    committedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: {
        values: PROJECT_STATUSES,
        message: '{VALUE} is not a valid project status',
      },
      default: 'Planning',
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    },
    workersOnSite: {
      type: Number,
      default: 0,
      min: 0,
    },
    tasksTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    milestonesTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    milestonesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    team: [teamMemberSchema],
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
        ret.id = ret.projectId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for remaining budget
projectSchema.virtual('remainingBudget').get(function () {
  return Math.max(0, this.budget - (this.actualCost || 0));
});

// Virtual for budget utilization %
projectSchema.virtual('budgetUtilization').get(function () {
  if (!this.budget || this.budget <= 0) return 0;
  return Number((((this.actualCost || 0) / this.budget) * 100).toFixed(2));
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
