import mongoose from 'mongoose';

const siteReportSchema = new mongoose.Schema(
  {
    reportId: {
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
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    supervisor: {
      type: String,
      required: true,
      trim: true,
    },
    weather: {
      type: String,
      default: 'Clear, 30°C',
    },
    workersPresent: {
      type: Number,
      default: 0,
      min: 0,
    },
    workCompleted: {
      type: String,
      required: [true, 'Work completed description is required'],
      trim: true,
    },
    progressToday: {
      type: String,
      default: '+0.5%',
    },
    issues: {
      type: String,
      default: 'None reported.',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Approved', 'Rejected'],
      default: 'Submitted',
      index: true,
    },
    relatedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    relatedIssues: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
      },
    ],
    date: {
      type: String,
      default: () => 'Today, ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    photos: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedByName: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
        clientApproved: { type: Boolean, default: false },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        approvedAt: { type: Date, default: null },
      },
    ],
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
        ret.id = ret.reportId || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

siteReportSchema.index({ createdAt: -1 });

const SiteReport = mongoose.model('SiteReport', siteReportSchema);
export default SiteReport;
