import Notification from '../models/Notification.js';

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Fetch notifications directly assigned to user OR broadcast to user's role
    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { targetRole: userRole },
        { targetRole: 'All' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      $or: [
        { recipient: userId },
        { targetRole: userRole },
        { targetRole: 'All' },
      ],
      read: false,
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Verify ownership: direct recipient, targetRole match, or Admin
    const isRecipient = notif.recipient && String(notif.recipient) === String(req.user._id);
    const isTargetRole = notif.targetRole && (notif.targetRole === req.user.role || notif.targetRole === 'All');
    const isAdmin = req.user.role === 'Admin';

    if (!isRecipient && !isTargetRole && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this notification',
      });
    }

    notif.read = true;
    await notif.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notif,
    });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    await Notification.updateMany(
      {
        $or: [
          { recipient: userId },
          { targetRole: userRole },
          { targetRole: 'All' },
        ],
        read: false,
      },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
}
