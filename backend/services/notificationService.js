import Notification from '../models/Notification.js';

/**
 * Dispatch an in-app notification event.
 */
export async function sendNotification({
  recipient = null,
  targetRole = null,
  project = null,
  title,
  message,
  type = 'System',
  link = '',
}) {
  try {
    const notif = await Notification.create({
      recipient,
      targetRole,
      project,
      title,
      message,
      type,
      link,
      read: false,
    });
    return notif;
  } catch (err) {
    console.error('Failed to dispatch notification:', err.message);
    return null;
  }
}
