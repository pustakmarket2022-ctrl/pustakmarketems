const Overtime = require('../models/Overtime');
const Notification = require('../models/Notification');
const { generateOvertimeId } = require('../utils/idGenerators');
const logAudit = require('../utils/auditLogger');

// @desc    Employee Request Overtime
// @route   POST /api/overtime
// @access  Private
exports.requestOvertime = async (req, res, next) => {
  try {
    const { date, hours, reason, hourlyRate } = req.body;
    const overtimeId = await generateOvertimeId();
    const rate = parseFloat(hourlyRate || '100');
    const totalAmount = parseFloat(hours) * rate;

    const overtime = await Overtime.create({
      overtimeId,
      user: req.user.id,
      date: date || new Date().toISOString().split('T')[0],
      hours: parseFloat(hours),
      hourlyRate: rate,
      totalAmount,
      reason,
      status: 'Pending',
    });

    logAudit({ user: req.user.id, action: 'Overtime Requested', details: `${hours} hrs on ${date}`, req });

    res.status(201).json({ success: true, message: 'Overtime request submitted', data: overtime });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Overtime Requests (Admin / Employee)
// @route   GET /api/overtime
// @access  Private
exports.getOvertime = async (req, res, next) => {
  try {
    const { status, user, page = 1, limit = 15 } = req.query;
    const query = {};

    if (req.user.role === 'Employee') {
      query.user = req.user.id;
    } else if (user) {
      query.user = user;
    }

    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const total = await Overtime.countDocuments(query);
    const data = await Overtime.find(query)
      .populate('user', 'fullName employeeId department designation profileImage')
      .populate('reviewedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Review Overtime Request
// @route   PUT /api/overtime/:id/review
// @access  Private (Admin / Super Admin / HR)
exports.reviewOvertime = async (req, res, next) => {
  try {
    const { status, reviewNotes, hourlyRate } = req.body; // status: 'Approved' | 'Rejected'
    const overtime = await Overtime.findById(req.params.id).populate('user');

    if (!overtime) {
      return res.status(404).json({ success: false, message: 'Overtime request not found' });
    }

    overtime.status = status;
    overtime.reviewedBy = req.user.id;
    if (reviewNotes) overtime.reviewNotes = reviewNotes;
    if (hourlyRate) {
      overtime.hourlyRate = parseFloat(hourlyRate);
      overtime.totalAmount = overtime.hours * parseFloat(hourlyRate);
    }

    await overtime.save();

    await Notification.create({
      recipient: overtime.user._id,
      title: `Overtime Request ${status}`,
      message: `Your overtime request for ${overtime.hours} hrs on ${overtime.date} was ${status}.`,
      type: 'Overtime',
      link: '/employee/salary',
    });

    logAudit({
      user: req.user.id,
      action: `Overtime ${status}`,
      details: `${overtime.hours} hrs for ${overtime.user.fullName} marked as ${status}`,
      req,
    });

    res.status(200).json({ success: true, message: `Overtime request ${status}`, data: overtime });
  } catch (err) {
    next(err);
  }
};
