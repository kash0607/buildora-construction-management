import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    milestoneId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
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
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
      required: [true, 'Milestone due date is required'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    responsible: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'In Progress', 'Completed', 'Delayed'],
      default: 'Upcoming',
    },
    relatedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret.milestoneId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Milestone = mongoose.model('Milestone', milestoneSchema);
export default Milestone;
