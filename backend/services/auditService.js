import AuditLog from '../models/AuditLog.js';

/**
 * Record an audit log event
 */
export async function logAudit({
  user = null,
  userName = 'System',
  userRole = 'System',
  action,
  entity,
  entityId = '',
  project = null,
  projectId = '',
  details = {},
  ipAddress = '',
}) {
  try {
    await AuditLog.create({
      user,
      userName,
      userRole,
      action,
      entity,
      entityId,
      project,
      projectId,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}
