const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const { generateEmployeeId } = require('../utils/idGenerators');

// @desc    Get all users / employees with filters & pagination
// @route   GET /api/users
// @access  Private (Admin / Super Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { department, salaryType, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

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
// @access  Private (Admin / Super Admin)
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
// @access  Private (Admin / Super Admin)
exports.createUser = async (req, res, next) => {
  try {
    const employeeId = await generateEmployeeId();

    let profileImage = '';
    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({
      ...req.body,
      employeeId,
      profileImage: profileImage || req.body.profileImage || '',
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user / employee
// @route   PUT /api/users/:id
// @access  Private (Admin / Super Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const fieldsToUpdate = { ...req.body };

    if (req.file) {
      fieldsToUpdate.profileImage = `/uploads/${req.file.filename}`;
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

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin / Super Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'Employee removed successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Admin Dashboard Stats & Chart Analytics
// @route   GET /api/users/dashboard-stats
// @access  Private (Admin / Super Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments();
    const activeEmployees = await User.countDocuments({ status: 'Active' });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });

    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ taskStatus: { $in: ['Pending', 'In Progress'] } });
    const completedTasks = await Task.countDocuments({ taskStatus: 'Completed' });

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

    // Chart Data Generators
    // 1. Employee Growth by Dept
    const deptDistribution = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    // 2. Task Status Breakdown
    const taskStatusCounts = await Task.aggregate([
      { $group: { _id: '$taskStatus', count: { $sum: 1 } } },
    ]);

    // 3. Project Progress
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
        attendanceToday,
        monthlySalaryExpense,
        pendingPayments,
      },
      charts: {
        deptDistribution,
        taskStatusCounts,
        projectProgress,
      },
    });
  } catch (err) {
    next(err);
  }
};
