const AdvanceRequest = require('../models/AdvanceRequest');
const Notification = require('../models/Notification');
const { generateAdvanceId } = require('../utils/idGenerators');
const { sendAdvanceStatusEmail } = require('../utils/emailService');
const logAudit = require('../utils/auditLogger');

// @desc    Employee request advance salary
// @route   POST /api/advances
// @access  Private
exports.requestAdvance = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const advanceId = await generateAdvanceId();

    const advance = await AdvanceRequest.create({
      advanceId,
      user: req.user.id,
      amount,
      reason,
      status: 'Pending',
    });

    logAudit({ user: req.user.id, action: 'Advance Requested', details: `Amount: ₹${amount}`, req });

    res.status(201).json({ success: true, message: 'Advance request submitted successfully', data: advance });
  } catch (err) {
    next(err);
  }
};

// @desc    Get advance requests (Admin / Employee)
// @route   GET /api/advances
// @access  Private
exports.getAdvances = async (req, res, next) => {
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
    const total = await AdvanceRequest.countDocuments(query);
    const data = await AdvanceRequest.find(query)
      .populate('user', 'fullName employeeId department designation email profileImage')
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

// @desc    Admin Review & Approve / Reject Advance Request
// @route   PUT /api/advances/:id/review
// @access  Private (Admin / Super Admin / HR)
exports.reviewAdvance = async (req, res, next) => {
  try {
    const { status, reviewNotes, deductionMonth, deductionYear } = req.body; // status: 'Approved' | 'Rejected' | 'Paid'
    const advance = await AdvanceRequest.findById(req.params.id).populate('user');

    if (!advance) {
      return res.status(404).json({ success: false, message: 'Advance request not found' });
    }

    advance.status = status;
    advance.reviewedBy = req.user.id;
    if (reviewNotes) advance.reviewNotes = reviewNotes;
    if (deductionMonth) advance.deductionMonth = parseInt(deductionMonth);
    if (deductionYear) advance.deductionYear = parseInt(deductionYear);

    await advance.save();

    // Trigger Notification & Email
    await Notification.create({
      recipient: advance.user._id,
      title: `Advance Salary ${status}`,
      message: `Your advance request of ₹${advance.amount} has been ${status}. Notes: ${reviewNotes || 'N/A'}`,
      type: 'Advance',
      link: '/employee/salary',
    });

    sendAdvanceStatusEmail(advance.user, advance);

    logAudit({
      user: req.user.id,
      action: `Advance ${status}`,
      details: `Advance ₹${advance.amount} for ${advance.user.fullName} marked as ${status}`,
      req,
    });

    res.status(200).json({ success: true, message: `Advance request marked as ${status}`, data: advance });
  } catch (err) {
    next(err);
  }
};
