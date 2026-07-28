const Meeting = require('../models/Meeting');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateMeetingId } = require('../utils/idGenerators');
const { sendMeetingScheduledEmail } = require('../utils/emailService');
const logAudit = require('../utils/auditLogger');

// @desc    Admin Schedule Meeting
// @route   POST /api/meetings
// @access  Private (Admin / Super Admin / HR / Manager)
exports.createMeeting = async (req, res, next) => {
  try {
    const { title, description, date, time, durationMinutes, location, meetingLink, assignedEmployees } = req.body;
    const meetingId = await generateMeetingId();

    const meeting = await Meeting.create({
      meetingId,
      title,
      description,
      date,
      time,
      durationMinutes: durationMinutes || 30,
      location: location || 'Main Conference Room / Online',
      meetingLink: meetingLink || '',
      createdBy: req.user.id,
      assignedEmployees: assignedEmployees || [],
      status: 'Scheduled',
    });

    // Notify & email assigned employees
    if (assignedEmployees && Array.isArray(assignedEmployees)) {
      for (const empId of assignedEmployees) {
        const emp = await User.findById(empId);
        if (emp) {
          await Notification.create({
            recipient: emp._id,
            title: 'New Meeting Scheduled',
            message: `You are invited to '${meeting.title}' on ${meeting.date} at ${meeting.time}.`,
            type: 'Meeting',
            link: '/employee/meetings',
          });

          sendMeetingScheduledEmail(emp, meeting);
        }
      }
    }

    logAudit({ user: req.user.id, action: 'Meeting Scheduled', details: `Title: ${title} on ${date}`, req });

    const populated = await Meeting.findById(meeting._id)
      .populate('createdBy', 'fullName role')
      .populate('assignedEmployees', 'fullName employeeId department email profileImage');

    res.status(201).json({ success: true, message: 'Meeting scheduled successfully', data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Meetings
// @route   GET /api/meetings
// @access  Private
exports.getMeetings = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'Employee') {
      query.$or = [{ assignedEmployees: req.user.id }, { createdBy: req.user.id }];
    }

    const meetings = await Meeting.find(query)
      .populate('createdBy', 'fullName role designation')
      .populate('assignedEmployees', 'fullName employeeId department designation email profileImage')
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, count: meetings.length, data: meetings });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel or Complete Meeting
// @route   PUT /api/meetings/:id/status
// @access  Private (Admin / Super Admin / HR / Manager)
exports.updateMeetingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.status(200).json({ success: true, message: `Meeting marked as ${status}`, data: meeting });
  } catch (err) {
    next(err);
  }
};
