import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'System / Guest',
    },
    userRole: {
      type: String,
      default: 'System',
    },
    action: {
      type: String,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'APPROVE',
        'REJECT',
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'ARCHIVE',
        'UPLOAD',
        'UPLOAD_PHOTO',
        'APPROVE_PHOTO',
        'DOWNLOAD',
        'RECEIVE',
        'PAY',
        'DELIVERY_RECEIVE',
        'UPDATE_STATUS',
        'PAYMENT_RECEIVE',
      ],
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    projectId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
