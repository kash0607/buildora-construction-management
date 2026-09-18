import mongoose from 'mongoose';

export const TASK_STATUSES = ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked'];
export const TASK_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
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
      default: '',
    },
    assignee: {
      type: String,
      required: [true, 'Task assignee is required'],
      trim: true,
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: '{VALUE} is not a valid task priority',
      },
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid task status',
      },
      default: 'To Do',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress must be at least 0'],
      max: [100, 'Progress cannot exceed 100'],
    },
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    archived: {
      type: Boolean,
      default: false,
      index: true,
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
        ret.id = ret.taskId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-validate hook to normalize legacy status
taskSchema.pre('validate', function () {
  if (this.status === 'Not Started') {
    this.status = 'To Do';
  }
  // Enforce progress consistency on completion
  if (this.status === 'Completed' && this.progress < 100) {
    this.progress = 100;
  }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
