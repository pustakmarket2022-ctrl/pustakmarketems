const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

/**
 * Enterprise Central Notification Engine
 * Creates DB record, logs audit event, and pushes real-time Socket.IO event.
 */
const createAndEmitNotification = async (app, {
  userId,
  recipient,
  senderId = null,
  title,
  message,
  type = 'General',
  referenceId = '',
  referenceModel = '',
  route = '',
  link = '',
  icon = 'Bell',
  priority = 'Medium',
}) => {
  try {
    const targetUserId = userId || recipient;
    const targetRoute = route || link;

    if (!targetUserId) return null;

    // 1. Create DB notification
    const notification = await Notification.create({
      userId: targetUserId,
      senderId,
      title,
      message,
      type,
      referenceId,
      referenceModel,
      route: targetRoute,
      icon,
      priority,
      isRead: false,
    });

    // 2. Log Audit Trail
    try {
      await ActivityLog.create({
        user: senderId || targetUserId,
        action: 'Notification Created',
        details: `[${type}] ${title} -> Recipient: ${targetUserId}`,
      });
    } catch (e) {
      // Ignore audit log error
    }

    // 3. Push real-time Socket.IO event if io instance is available
    if (app) {
      const io = app.get ? app.get('socketio') : app;
      if (io) {
        const unreadCount = await Notification.countDocuments({ userId: targetUserId, isRead: false });

        io.to(`user_${targetUserId}`).emit('new_notification', {
          notification,
          unreadCount,
        });
      }
    }

    return notification;
  } catch (err) {
    console.error(`[NotificationEngine Error]: ${err.message}`);
    return null;
  }
};

module.exports = {
  createAndEmitNotification,
};
