const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const logAudit = require('../utils/auditLogger');

// Helper to compute distance in meters using Haversine formula
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// @desc    Employee Check In (with geofencing & duplicate prevention)
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res, next) => {
  try {
    const { latitude, longitude, notes } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    // Check duplicate check-in
    let attendance = await Attendance.findOne({ user: req.user.id, date: todayStr });
    if (attendance && attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You have already checked in today.' });
    }

    // Office Geofencing Validation
    const officeLat = parseFloat(process.env.OFFICE_LAT || '28.6139');
    const officeLng = parseFloat(process.env.OFFICE_LNG || '77.2090');
    const maxRadiusMeters = parseFloat(process.env.OFFICE_RADIUS_METERS || '500');

    if (latitude && longitude && process.env.ENABLE_GEOFENCING !== 'false') {
      const distance = getDistanceInMeters(officeLat, officeLng, parseFloat(latitude), parseFloat(longitude));
      if (distance > maxRadiusMeters) {
        return res.status(400).json({
          success: false,
          message: `Check-in denied: You are ${Math.round(distance)} meters away from office radius (Allowed: ${maxRadiusMeters} meters).`,
        });
      }
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status = isLate ? 'Late' : 'Present';

    if (!attendance) {
      attendance = new Attendance({
        user: req.user.id,
        date: todayStr,
        checkIn: now,
        checkInLat: latitude || null,
        checkInLng: longitude || null,
        status: status,
        notes: notes || '',
      });
    } else {
      attendance.checkIn = now;
      attendance.checkInLat = latitude || null;
      attendance.checkInLng = longitude || null;
      attendance.status = status;
    }

    await attendance.save();

    // Trigger Attendance Notification
    await Notification.create({
      recipient: req.user.id,
      title: 'Attendance Check-In',
      message: `Checked in successfully at ${now.toLocaleTimeString()} (${status})`,
      type: 'Attendance',
      link: '/employee/attendance',
    });

    logAudit({ user: req.user.id, action: 'Attendance Check-In', details: `Status: ${status}`, req });

    res.status(200).json({
      success: true,
      message: `Checked in successfully (${status})`,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Employee Check Out (with duplicate check out prevention)
// @route   POST /api/attendance/check-out
// @access  Private
exports.checkOut = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ user: req.user.id, date: todayStr });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You must check in first before checking out.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already checked out today.' });
    }

    const now = new Date();
    attendance.checkOut = now;
    attendance.checkOutLat = latitude || null;
    attendance.checkOutLng = longitude || null;

    const diffMs = now - new Date(attendance.checkIn);
    const diffHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.workingHours = diffHours;

    if (diffHours < 4 && attendance.status !== 'Leave') {
      attendance.status = 'Half Day';
    }

    await attendance.save();

    // Trigger Attendance Notification
    await Notification.create({
      recipient: req.user.id,
      title: 'Attendance Check-Out',
      message: `Checked out successfully at ${now.toLocaleTimeString()}. Working hours: ${diffHours} hrs`,
      type: 'Attendance',
      link: '/employee/attendance',
    });

    logAudit({ user: req.user.id, action: 'Attendance Check-Out', details: `Working Hours: ${diffHours} hrs`, req });

    res.status(200).json({
      success: true,
      message: `Checked out successfully. Working Hours: ${diffHours} hrs`,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Edit Attendance with Audit Trail
// @route   PUT /api/attendance/:id/edit
// @access  Private (Admin / Super Admin / HR)
exports.editAttendance = async (req, res, next) => {
  try {
    const { status, checkIn, checkOut, reason, notes } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const previousStatus = attendance.status;
    const previousCheckIn = attendance.checkIn;
    const previousCheckOut = attendance.checkOut;

    if (status) attendance.status = status;
    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) attendance.checkOut = new Date(checkOut);
    if (notes) attendance.notes = notes;

    if (attendance.checkIn && attendance.checkOut) {
      const diffMs = new Date(attendance.checkOut) - new Date(attendance.checkIn);
      attendance.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    attendance.editHistory.push({
      editedBy: req.user.id,
      editDate: new Date(),
      previousStatus,
      newStatus: attendance.status,
      previousCheckIn,
      newCheckIn: attendance.checkIn,
      previousCheckOut,
      newCheckOut: attendance.checkOut,
      reason: reason || 'Admin Manual Edit',
    });

    await attendance.save();

    // Notify employee of attendance edit
    await Notification.create({
      recipient: attendance.user,
      title: 'Attendance Record Updated',
      message: `Your attendance record for ${attendance.date} was updated by Admin to status '${attendance.status}'. Reason: ${reason || 'N/A'}`,
      type: 'Attendance',
      link: '/employee/attendance',
    });

    logAudit({
      user: req.user.id,
      action: 'Attendance Edited',
      details: `Edited attendance for date ${attendance.date}. Reason: ${reason || 'N/A'}`,
      req,
    });

    res.status(200).json({ success: true, message: 'Attendance record updated', data: attendance });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Attendance Logs (Admin View)
// @route   GET /api/attendance
// @access  Private (Admin / Super Admin / HR)
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
      .populate('editHistory.editedBy', 'fullName role')
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

// @desc    Get My Attendance
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
