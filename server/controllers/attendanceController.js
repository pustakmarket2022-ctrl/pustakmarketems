const Attendance = require('../models/Attendance');

// @desc    Employee Check In
// @route   POST /api/attendance/check-in
// @access  Private (Employee / All)
exports.checkIn = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if attendance already exists today
    let attendance = await Attendance.findOne({ user: req.user.id, date: todayStr });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You have already checked in today' });
    }

    const now = new Date();
    // Late check-in condition (e.g., after 09:30 AM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status = isLate ? 'Late' : 'Present';

    if (!attendance) {
      attendance = new Attendance({
        user: req.user.id,
        date: todayStr,
        checkIn: now,
        status: status,
        notes: req.body.notes || '',
      });
    } else {
      attendance.checkIn = now;
      attendance.status = status;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked in successfully (${status})`,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Employee Check Out
// @route   POST /api/attendance/check-out
// @access  Private (Employee / All)
exports.checkOut = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user.id, date: todayStr });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You must check in first before checking out' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already checked out today' });
    }

    const now = new Date();
    attendance.checkOut = now;

    // Calculate working hours in decimals
    const diffMs = now - new Date(attendance.checkIn);
    const diffHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.workingHours = diffHours;

    if (diffHours < 4 && attendance.status !== 'Leave') {
      attendance.status = 'Half Day';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Working Hours: ${diffHours} hrs`,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Attendance Logs (Admin View)
// @route   GET /api/attendance
// @access  Private (Admin / Super Admin)
exports.getAttendance = async (req, res, next) => {
  try {
    const { user, date, startDate, endDate, status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (user) query.user = user;
    if (status) query.status = status;

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (page - 1) * limit;
    const total = await Attendance.countDocuments(query);
    const data = await Attendance.find(query)
      .populate('user', 'fullName employeeId department designation profileImage')
      .sort({ date: -1 })
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

// @desc    Get My Attendance (Logged in Employee)
// @route   GET /api/attendance/my
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.findOne({ user: req.user.id, date: todayStr });

    const history = await Attendance.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      today: todayAttendance,
      history,
    });
  } catch (err) {
    next(err);
  }
};
