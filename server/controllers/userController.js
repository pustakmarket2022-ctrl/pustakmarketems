const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const LeaveRequest = require('../models/LeaveRequest');
const AdvanceRequest = require('../models/AdvanceRequest');
const Overtime = require('../models/Overtime');
const BestEmployee = require('../models/BestEmployee');
const ActivityLog = require('../models/ActivityLog');
const { generateEmployeeId } = require('../utils/idGenerators');
const { getUploadedFileInfo } = require('../utils/cloudinaryService');
const { sendWelcomeEmail } = require('../utils/emailService');
const logAudit = require('../utils/auditLogger');

// @desc    Get all users / employees with filters & pagination
// @route   GET /api/users
// @access  Private (Admin / HR / Super Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { department, salaryType, status, search, page = 1, limit = 10, includeDeleted } = req.query;
    const query = {};

    if (includeDeleted !== 'true') {
      query.isDeleted = { $ne: true };
    } else {
      query.isDeleted = true;
    }

    if (department) query.department = department;
    if (salaryType) query.salaryType = salaryType;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new user / employee
// @route   POST /api/users
// @access  Private (Admin / HR / Super Admin)
exports.createUser = async (req, res, next) => {
  try {
    const employeeId = await generateEmployeeId();

    let profileImage = '';
    if (req.file) {
      const fileInfo = getUploadedFileInfo(req.file);
      profileImage = fileInfo.path;
    }

    const plainPassword = req.body.password || 'EMS@123456';

    const user = await User.create({
      ...req.body,
      password: plainPassword,
      employeeId,
      profileImage: profileImage || req.body.profileImage || '',
    });

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user, plainPassword);

    // Audit Log
    logAudit({
      user: req.user.id,
      action: 'Employee Created',
      details: `Created employee ${user.fullName} (${user.employeeId})`,
      req,
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user / employee
// @route   PUT /api/users/:id
// @access  Private (Admin / HR / Super Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const fieldsToUpdate = { ...req.body };

    if (req.file) {
      const fileInfo = getUploadedFileInfo(req.file);
      fieldsToUpdate.profileImage = fileInfo.path;
    }

    // Do not update password directly through this endpoint
    delete fieldsToUpdate.password;

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    logAudit({
      user: req.user.id,
      action: 'Employee Updated',
      details: `Updated details for ${user.fullName} (${user.employeeId})`,
      req,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Soft Delete User (isDeleted: true)
// @route   DELETE /api/users/:id
// @access  Private (Admin / Super Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.status = 'Inactive';
    await user.save();

    logAudit({
      user: req.user.id,
      action: 'Employee Soft-Deleted',
      details: `Soft deleted employee ${user.fullName} (${user.employeeId})`,
      req,
    });

    res.status(200).json({ success: true, message: 'Employee marked as deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Restore Soft-Deleted User
// @route   PUT /api/users/:id/restore
// @access  Private (Admin / Super Admin)
exports.restoreUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    user.isDeleted = false;
    user.deletedAt = null;
    user.status = 'Active';
    await user.save();

    logAudit({
      user: req.user.id,
      action: 'Employee Restored',
      details: `Restored employee ${user.fullName} (${user.employeeId})`,
      req,
    });

    res.status(200).json({ success: true, message: 'Employee restored successfully', data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Set Best Employee of Month
// @route   POST /api/users/best-employee
// @access  Private (Admin / Super Admin)
exports.selectBestEmployee = async (req, res, next) => {
  try {
    const { employeeId, month, year, awardTitle, reason } = req.body;

    const emp = await User.findById(employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const record = await BestEmployee.findOneAndUpdate(
      { month: currentMonth, year: currentYear },
      {
        employee: emp._id,
        month: currentMonth,
        year: currentYear,
        awardTitle: awardTitle || 'Best Employee of the Month',
        reason: reason || 'Outstanding dedication & achievements',
        selectedBy: req.user.id,
      },
      { upsert: true, new: true }
    ).populate('employee', 'fullName employeeId designation department profileImage');

    logAudit({
      user: req.user.id,
      action: 'Best Employee Selected',
      details: `Selected ${emp.fullName} as Best Employee for ${currentMonth}/${currentYear}`,
      req,
    });

    res.status(200).json({ success: true, message: 'Best Employee selected successfully', data: record });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Best Employee of Month
// @route   GET /api/users/best-employee
// @access  Private
exports.getBestEmployee = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    let record = await BestEmployee.findOne({ month, year }).populate(
      'employee',
      'fullName employeeId designation department profileImage email'
    );

    if (!record) {
      // Return latest if not found for requested month
      record = await BestEmployee.findOne()
        .sort({ year: -1, month: -1 })
        .populate('employee', 'fullName employeeId designation department profileImage email');
    }

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Audit Logs
// @route   GET /api/users/audit-logs
// @access  Private (Admin / Super Admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'fullName employeeId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Admin Dashboard Stats & Chart Analytics
// @route   GET /api/users/dashboard-stats
// @access  Private (Admin / HR / Super Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments({ isDeleted: { $ne: true } });
    const activeEmployees = await User.countDocuments({ isDeleted: { $ne: true }, status: 'Active' });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });

    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ taskStatus: { $in: ['Pending', 'In Progress'] } });
    const completedTasks = await Task.countDocuments({ taskStatus: { $in: ['Approved', 'Completed'] } });

    // Pending Requests
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'Pending' });
    const pendingAdvancesCount = await AdvanceRequest.countDocuments({ status: 'Pending' });

    const pendingAdvanceAgg = await AdvanceRequest.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingAdvancesTotal = pendingAdvanceAgg.length > 0 ? pendingAdvanceAgg[0].total : 0;

    const approvedAdvanceAgg = await AdvanceRequest.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const approvedAdvancesTotal = approvedAdvanceAgg.length > 0 ? approvedAdvanceAgg[0].total : 0;

    const paidAdvanceAgg = await AdvanceRequest.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const paidAdvancesTotal = paidAdvanceAgg.length > 0 ? paidAdvanceAgg[0].total : 0;

    const pendingOvertimeCount = await Overtime.countDocuments({ status: 'Pending' });

    // Today's attendance count
    const todayStr = new Date().toISOString().split('T')[0];
    const attendanceToday = await Attendance.countDocuments({ date: todayStr, status: { $in: ['Present', 'Late'] } });

    // Salary Analytics
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const salaryStats = await Salary.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$totalEarnings' },
        },
      },
    ]);

    let monthlySalaryExpense = 0;
    let pendingPayments = 0;

    salaryStats.forEach((item) => {
      monthlySalaryExpense += item.total;
      if (item._id === 'Pending') {
        pendingPayments += item.total;
      }
    });

    // Best Employee
    const bestEmployee = await BestEmployee.findOne({ month: currentMonth, year: currentYear }).populate(
      'employee',
      'fullName employeeId designation department profileImage'
    );

    // Chart Data
    const deptDistribution = await User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    const taskStatusCounts = await Task.aggregate([
      { $group: { _id: '$taskStatus', count: { $sum: 1 } } },
    ]);

    const attendanceStats = await Attendance.aggregate([
      { $match: { date: todayStr } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const projectProgress = await Project.find()
      .select('bookName completionPercentage status')
      .limit(6);

    res.status(200).json({
      success: true,
      cards: {
        totalEmployees,
        activeEmployees,
        totalProjects,
        activeProjects,
        totalTasks,
        pendingTasks,
        completedTasks,
        pendingLeaves,
        pendingAdvancesCount,
        pendingAdvancesTotal,
        approvedAdvancesTotal,
        paidAdvancesTotal,
        pendingOvertimeCount,
        attendanceToday,
        monthlySalaryExpense,
        pendingPayments,
      },
      bestEmployee,
      charts: {
        deptDistribution,
        taskStatusCounts,
        attendanceStats,
        projectProgress,
      },
    });
  } catch (err) {
    next(err);
  }
};
