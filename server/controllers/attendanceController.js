const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { createAndEmitNotification } = require('../utils/notificationEngine');
const logAudit = require('../utils/auditLogger');

// Configured Geofence coordinates (defaults if env not provided)
const OFFICE_LAT = parseFloat(process.env.OFFICE_LAT || '18.5204');
const OFFICE_LNG = parseFloat(process.env.OFFICE_LNG || '73.8567');
const GEOFENCE_RADIUS_KM = parseFloat(process.env.GEOFENCE_RADIUS_KM || '0.5'); // 500 meters

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Employee Check In (with Geofence check)
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
exports.checkIn = async (req, res, next) => {
  try {
    const { latitude, longitude, notes } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    // Check Geofence if coordinates provided
    if (latitude && longitude) {
      const distance = calculateDistanceKm(OFFICE_LAT, OFFICE_LNG, parseFloat(latitude), parseFloat(longitude));
      if (distance > GEOFENCE_RADIUS_KM) {
        return res.status(400).json({
          success: false,
          message: `Check-in denied: You are ${(distance * 1000).toFixed(0)}m away from office premises (Limit: ${GEOFENCE_RADIUS_KM * 1000}m).`,
        });
      }
    }

    let attendance = await Attendance.findOne({ user: req.user.id, date: todayStr });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You have already checked in today.' });
    }

    const now = new Date();
    const isLate = now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() > 30);

    if (!attendance) {
      attendance = new Attendance({
        user: req.user.id,
        date: todayStr,
        checkIn: now,
        checkInLat: latitude || null,
        checkInLng: longitude || null,
        status: isLate ? 'Half Day' : 'Present',
        notes: notes || '',
      });
    } else {
      attendance.checkIn = now;
      attendance.checkInLat = latitude || null;
      attendance.checkInLng = longitude || null;
      attendance.status = isLate ? 'Half Day' : 'Present';
      if (notes) attendance.notes = notes;
    }

    await attendance.save();

    await createAndEmitNotification(req.app, {
      userId: req.user.id,
      title: 'Attendance Check-In Successful',
      message: `Checked in at ${now.toLocaleTimeString()}. Status: ${attendance.status}`,
      type: 'Attendance',
      route: '/employee/attendance',
    });

    logAudit({ user: req.user.id, action: 'Attendance Check-In', details: `Status: ${attendance.status}`, req });

    res.status(200).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}`,
      data: attendance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Employee Check Out
// @route   POST /api/attendance/check-out
// @access  Private (Employee)
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

    await createAndEmitNotification(req.app, {
      userId: req.user.id,
      title: 'Attendance Check-Out',
      message: `Checked out successfully at ${now.toLocaleTimeString()}. Working hours: ${diffHours} hrs`,
      type: 'Attendance',
      route: '/employee/attendance',
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

// @desc    Admin Edit Attendance Record
// @route   PUT /api/attendance/:id/edit
// @access  Private (Admin / Super Admin / HR)
exports.editAttendance = async (req, res, next) => {
  try {
    const { status, checkIn, checkOut, reason, notes, workingHours } = req.body;
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
    if (workingHours !== undefined) attendance.workingHours = Number(workingHours);

    if (attendance.checkIn && attendance.checkOut && workingHours === undefined) {
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
      reason: reason || 'Admin Edit Presenty',
    });

    await attendance.save();

    await createAndEmitNotification(req.app, {
      userId: attendance.user,
      senderId: req.user.id,
      title: 'Attendance Record Updated',
      message: `Your attendance record for ${attendance.date} was updated by Admin to status '${attendance.status}'. Reason: ${reason || 'N/A'}`,
      type: 'Attendance',
      route: '/employee/attendance',
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

// @desc    Admin Mark/Upsert Attendance Manually for any employee and date
// @route   POST /api/attendance/manual
// @access  Private (Admin / Super Admin)
exports.markAttendanceManual = async (req, res, next) => {
  try {
    const { userId, date, status, checkIn, checkOut, workingHours, notes, reason } = req.body;
    if (!userId || !date) {
      return res.status(400).json({ success: false, message: 'Please select an employee and date' });
    }

    const dateStr = new Date(date).toISOString().split('T')[0];

    let attendance = await Attendance.findOne({ user: userId, date: dateStr });
    const previousStatus = attendance ? attendance.status : 'None';

    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: dateStr,
      });
    }

    if (status) attendance.status = status;
    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) attendance.checkOut = new Date(checkOut);
    if (workingHours !== undefined) attendance.workingHours = Number(workingHours);
    if (notes) attendance.notes = notes;

    attendance.editHistory.push({
      editedBy: req.user.id,
      editDate: new Date(),
      previousStatus,
      newStatus: attendance.status,
      reason: reason || 'Admin Manual Presenty Update',
    });

    await attendance.save();

    await createAndEmitNotification(req.app, {
      userId,
      senderId: req.user.id,
      title: 'Attendance Record Updated by Admin',
      message: `Your attendance record for ${dateStr} was updated to '${attendance.status}' by Admin.`,
      type: 'Attendance',
      route: '/employee/attendance',
    });

    res.status(200).json({ success: true, message: 'Attendance record updated successfully', data: attendance });
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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);

    const logs = await Attendance.find(query)
      .populate('user', 'fullName email employeeId profileImage department designation')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: logs,
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
