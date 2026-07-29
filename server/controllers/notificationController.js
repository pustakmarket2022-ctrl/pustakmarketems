const Notification = require('../models/Notification');
const logAudit = require('../utils/auditLogger');

// @desc    Get user notifications with filtering, search, and pagination
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { type, isRead, readStatus, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user.id };

    if (type && type !== 'All') {
      query.type = type;
    }

    if (isRead !== undefined && isRead !== '') {
      query.isRead = isRead === 'true' || isRead === true;
    } else if (readStatus === 'unread') {
      query.isRead = false;
    } else if (readStatus === 'read') {
      query.isRead = true;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    // Unread first, then by createdAt desc
    const notifications = await Notification.find(query)
      .populate('senderId', 'fullName profileImage role')
      .sort({ isRead: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      unreadCount,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

const emitUnreadCount = (req, count) => {
  try {
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user_${req.user.id}`).emit('new_notification', { unreadCount: count });
    }
  } catch (e) {}
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    emitUnreadCount(req, unreadCount);

    logAudit({
      user: req.user.id,
      action: 'Notification Marked Read',
      details: `Marked notification ${notification._id} as read`,
      req,
    });

    res.status(200).json({ success: true, unreadCount, data: notification });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    emitUnreadCount(req, 0);

    logAudit({
      user: req.user.id,
      action: 'All Notifications Marked Read',
      details: `User ${req.user.id} marked all notifications as read`,
      req,
    });

    res.status(200).json({ success: true, unreadCount: 0, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete single notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.deleteOne();
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    emitUnreadCount(req, unreadCount);

    logAudit({
      user: req.user.id,
      action: 'Notification Deleted',
      details: `Deleted notification ${req.params.id}`,
      req,
    });

    res.status(200).json({ success: true, unreadCount, message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete multiple notifications (batch)
// @route   POST /api/notifications/delete-multiple
// @access  Private
exports.deleteMultipleNotifications = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide array of notificationIds' });
    }

    await Notification.deleteMany({ _id: { $in: notificationIds }, userId: req.user.id });
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    emitUnreadCount(req, unreadCount);

    logAudit({
      user: req.user.id,
      action: 'Multiple Notifications Deleted',
      details: `Deleted ${notificationIds.length} notifications`,
      req,
    });

    res.status(200).json({ success: true, unreadCount, message: `Deleted ${notificationIds.length} notifications` });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete all notifications for current user
// @route   DELETE /api/notifications/delete-all
// @access  Private
exports.deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    emitUnreadCount(req, 0);

    logAudit({
      user: req.user.id,
      action: 'All Notifications Deleted',
      details: `Cleared all notifications for user ${req.user.id}`,
      req,
    });

    res.status(200).json({ success: true, unreadCount: 0, message: 'All notifications cleared' });
  } catch (err) {
    next(err);
  }
};
