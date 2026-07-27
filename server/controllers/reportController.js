const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Salary = require('../models/Salary');
const { exportToExcel } = require('../utils/excelGenerator');

// @desc    Export Employees Report to Excel
// @route   GET /api/reports/employees/excel
// @access  Private (Admin / Super Admin)
exports.exportEmployeesReport = async (req, res, next) => {
  try {
    const employees = await User.find().sort({ createdAt: -1 });

    const columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Salary Type', key: 'salaryType', width: 15 },
      { header: 'Fixed Salary (₹)', key: 'fixedSalary', width: 18 },
      { header: 'Per Task Rate (₹)', key: 'perTaskRate', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Joining Date', key: 'joiningDate', width: 15 },
    ];

    const data = employees.map((emp) => ({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      salaryType: emp.salaryType,
      fixedSalary: emp.fixedSalary || 0,
      perTaskRate: emp.perTaskRate || 0,
      status: emp.status,
      joiningDate: new Date(emp.joiningDate).toLocaleDateString(),
    }));

    await exportToExcel(res, 'Employees', columns, data, 'Employees_Report');
  } catch (err) {
    next(err);
  }
};

// @desc    Export Attendance Report to Excel
// @route   GET /api/reports/attendance/excel
// @access  Private (Admin / Super Admin)
exports.exportAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const logs = await Attendance.find(query)
      .populate('user', 'fullName employeeId department')
      .sort({ date: -1 });

    const columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'fullName', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Check In', key: 'checkIn', width: 15 },
      { header: 'Check Out', key: 'checkOut', width: 15 },
      { header: 'Working Hours', key: 'workingHours', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Notes', key: 'notes', width: 25 },
    ];

    const data = logs.map((log) => ({
      date: log.date,
      employeeId: log.user ? log.user.employeeId : 'N/A',
      fullName: log.user ? log.user.fullName : 'N/A',
      department: log.user ? log.user.department : 'N/A',
      checkIn: log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : '-',
      checkOut: log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : '-',
      workingHours: log.workingHours || 0,
      status: log.status,
      notes: log.notes || '',
    }));

    await exportToExcel(res, 'Attendance', columns, data, 'Attendance_Report');
  } catch (err) {
    next(err);
  }
};

// @desc    Export Tasks Report to Excel
// @route   GET /api/reports/tasks/excel
// @access  Private (Admin / Super Admin)
exports.exportTasksReport = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'projectName bookName projectId')
      .populate('assignedTo', 'fullName employeeId')
      .sort({ createdAt: -1 });

    const columns = [
      { header: 'Task ID', key: 'taskId', width: 15 },
      { header: 'Task Title', key: 'taskTitle', width: 30 },
      { header: 'Project ID', key: 'projectId', width: 15 },
      { header: 'Book Name', key: 'bookName', width: 25 },
      { header: 'Assigned Employees', key: 'assigned', width: 30 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Estimated Hours', key: 'estimatedHours', width: 15 },
      { header: 'Payment Amount (₹)', key: 'amount', width: 18 },
      { header: 'Progress %', key: 'progress', width: 15 },
      { header: 'Task Status', key: 'taskStatus', width: 18 },
      { header: 'Payment Status', key: 'paymentStatus', width: 18 },
      { header: 'Deadline', key: 'deadline', width: 15 },
    ];

    const data = tasks.map((t) => ({
      taskId: t.taskId,
      taskTitle: t.taskTitle,
      projectId: t.project ? t.project.projectId : 'N/A',
      bookName: t.project ? t.project.bookName : 'N/A',
      assigned: t.assignedTo ? t.assignedTo.map((u) => u.fullName).join(', ') : 'Unassigned',
      priority: t.priority,
      estimatedHours: t.estimatedHours || 0,
      amount: t.taskPaymentAmount || 0,
      progress: `${t.progressPercentage}%`,
      taskStatus: t.taskStatus,
      paymentStatus: t.paymentStatus,
      deadline: new Date(t.deadline).toLocaleDateString(),
    }));

    await exportToExcel(res, 'Tasks', columns, data, 'Tasks_Report');
  } catch (err) {
    next(err);
  }
};

// @desc    Export Salary Report to Excel
// @route   GET /api/reports/salary/excel
// @access  Private (Admin / Super Admin)
exports.exportSalaryReport = async (req, res, next) => {
  try {
    const salaries = await Salary.find()
      .populate('user', 'fullName employeeId department salaryType')
      .sort({ year: -1, month: -1 });

    const columns = [
      { header: 'Salary ID', key: 'salaryId', width: 15 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Employee Name', key: 'fullName', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Pay Period', key: 'period', width: 15 },
      { header: 'Salary Type', key: 'salaryType', width: 15 },
      { header: 'Fixed Base (₹)', key: 'fixedSalary', width: 18 },
      { header: 'Task Incentive (₹)', key: 'taskIncentive', width: 18 },
      { header: 'Bonus (₹)', key: 'bonus', width: 15 },
      { header: 'Penalty (₹)', key: 'penalty', width: 15 },
      { header: 'Total Net (₹)', key: 'totalEarnings', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    const data = salaries.map((s) => ({
      salaryId: s.salaryId,
      employeeId: s.user ? s.user.employeeId : 'N/A',
      fullName: s.user ? s.user.fullName : 'N/A',
      department: s.user ? s.user.department : 'N/A',
      period: `${s.month}/${s.year}`,
      salaryType: s.salaryType,
      fixedSalary: s.fixedSalary || 0,
      taskIncentive: s.taskIncentive || 0,
      bonus: s.bonus || 0,
      penalty: s.penalty || 0,
      totalEarnings: s.totalEarnings || 0,
      status: s.status,
    }));

    await exportToExcel(res, 'Salary', columns, data, 'Salary_Report');
  } catch (err) {
    next(err);
  }
};
