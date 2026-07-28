const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      enum: ['Task', 'Attendance', 'Leave', 'Salary', 'Meeting', 'Advance', 'Overtime', 'System', 'Employee', 'Project', 'Discussion', 'General'],
      default: 'General',
      index: true,
    },
    referenceId: {
      type: String,
      default: '',
    },
    referenceModel: {
      type: String,
      default: '',
    },
    route: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Bell',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Virtual getters/setters for backward compatibility (recipient -> userId, read -> isRead, link -> route)
notificationSchema.virtual('recipient')
  .get(function () { return this.userId; })
  .set(function (v) { this.userId = v; });

notificationSchema.virtual('read')
  .get(function () { return this.isRead; })
  .set(function (v) { this.isRead = v; });

notificationSchema.virtual('link')
  .get(function () { return this.route; })
  .set(function (v) { this.route = v; });

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

// Compound indexes for optimal performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
