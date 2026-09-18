import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
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
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    assignee: {
      type: String,
      default: 'Site Supervisor',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String,
      default: 'Today',
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
        ret.id = ret.issueId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

issueSchema.index({ createdAt: -1 });

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
