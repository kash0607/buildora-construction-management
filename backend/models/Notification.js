import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // If null, targetRole is used
    },
    targetRole: {
      type: String,
      default: null, // e.g. 'Admin', 'Project Manager', 'Procurement Manager', etc.
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'Approval',
        'Procurement',
        'Delivery',
        'Stock',
        'Task',
        'SiteReport',
        'Site Report',
        'Issue',
        'Finance',
        'Document',
        'Project',
        'System',
      ],
      default: 'System',
    },
    link: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ targetRole: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
