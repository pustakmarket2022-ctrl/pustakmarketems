const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendLeaveStatusEmail } = require('../utils/emailService');
const logAudit = require('../utils/auditLogger');

// @desc    Apply for Leave
// @route   POST /api/leaves
// @access  Private (Employee / All)
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date' });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await LeaveRequest.create({
      user: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
    });

    logAudit({ user: req.user.id, action: 'Leave Applied', details: `${leaveType} leave for ${totalDays} days`, req });

    res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: leave });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Leave Requests
// @route   GET /api/leaves
// @access  Private
exports.getLeaveRequests = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'Employee') {
      query.user = req.user.id;
    } else if (req.query.user) {
      query.user = req.query.user;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('user', 'fullName employeeId department designation profileImage email')
      .populate('reviewedBy', 'fullName role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    next(err);
  }
};

// @desc    Review Leave Request (Approve / Reject)
// @route   PUT /api/leaves/:id/review
// @access  Private (Admin / Super Admin / HR)
exports.reviewLeaveRequest = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body; // status: 'Approved' | 'Rejected'
    const leave = await LeaveRequest.findById(req.params.id).populate('user');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewNotes = reviewNotes || '';

    await leave.save();

    // If approved, mark Attendance records for leave dates
    if (status === 'Approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const curr = new Date(start);

      while (curr <= end) {
        const dateStr = curr.toISOString().split('T')[0];
        await Attendance.findOneAndUpdate(
          { user: leave.user._id, date: dateStr },
          { user: leave.user._id, date: dateStr, status: 'Leave', notes: `Leave: ${leave.leaveType}` },
          { upsert: true, new: true }
        );
        curr.setDate(curr.getDate() + 1);
      }
    }

    // Send Notification
    await Notification.create({
      recipient: leave.user._id,
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} was ${status.toLowerCase()}.`,
      type: 'Leave',
      link: '/employee/attendance',
    });

    // Send Email
    sendLeaveStatusEmail(leave.user, leave);

    logAudit({
      user: req.user.id,
      action: `Leave ${status}`,
      details: `${leave.leaveType} leave for ${leave.user.fullName} marked as ${status}`,
      req,
    });

    res.status(200).json({ success: true, message: `Leave request ${status}`, data: leave });
  } catch (err) {
    next(err);
  }
};
