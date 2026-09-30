import AuditLog from '../models/AuditLog.js';

export async function getAuditLogs(req, res, next) {
  try {
    const { entity, action, search, limit = 100 } = req.query;
    const filter = {};

    if (entity && entity !== 'All') filter.entity = entity;
    if (action && action !== 'All') filter.action = action;

    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } },
        { projectId: { $regex: search, $options: 'i' } },
      ];
    }

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .populate('project', 'name projectId')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
}
