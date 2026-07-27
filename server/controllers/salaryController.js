const Salary = require('../models/Salary');
const User = require('../models/User');
const Task = require('../models/Task');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { generateSalaryId } = require('../utils/idGenerators');
const { generateSalarySlipPDF } = require('../utils/pdfGenerator');

// @desc    Generate Payroll for Month & Year
// @route   POST /api/salaries/generate
// @access  Private (Admin / Super Admin)
exports.generatePayroll = async (req, res, next) => {
  try {
    const { month, year, userId, advanceSalary } = req.body; // If userId provided, generate for 1 user, else for all Active employees

    const query = { status: 'Active' };
    if (userId) query._id = userId;

    const employees = await User.find(query);
    const generatedSalaries = [];

    for (const emp of employees) {
      // Calculate approved task payments for this month/year or unpaid approved tasks
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      // Find unpaid approved task payments for this employee
      const approvedPayments = await Payment.find({
        user: emp._id,
        status: 'Unpaid',
      });

      const taskIncentive = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

      let fixedSalary = 0;
      if (emp.salaryType === 'Monthly' || emp.salaryType === 'Hybrid') {
        fixedSalary = emp.fixedSalary || 0;
      }

      // Formula: Final Salary = Fixed Salary + Task Incentive + Bonus - Penalty - Advance Salary
      const bonus = 0;
      const penalty = 0;
      const advDeduction = Number(advanceSalary || 0);
      const totalEarnings = Math.max(0, fixedSalary + taskIncentive + bonus - penalty - advDeduction);

      const salaryId = await generateSalaryId();

      const salary = await Salary.findOneAndUpdate(
        { user: emp._id, month: parseInt(month), year: parseInt(year) },
        {
          salaryId,
          user: emp._id,
          month: parseInt(month),
          year: parseInt(year),
          salaryType: emp.salaryType,
          fixedSalary,
          taskIncentive,
          bonus,
          penalty,
          advanceSalary: advDeduction,
          totalEarnings,
          status: 'Pending',
        },
        { upsert: true, new: true, runValidators: true }
      );

      generatedSalaries.push(salary);

      // Send notification
      await Notification.create({
        recipient: emp._id,
        title: 'Monthly Salary Statement Generated',
        message: `Your payroll for ${month}/${year} has been generated ($${totalEarnings.toFixed(2)}).`,
        type: 'Salary',
        link: '/employee/salary',
      });
    }

    res.status(200).json({
      success: true,
      message: `Generated payroll for ${generatedSalaries.length} employee(s)`,
      data: generatedSalaries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Salaries (Admin or Employee view)
// @route   GET /api/salaries
// @access  Private
exports.getSalaries = async (req, res, next) => {
  try {
    const { month, year, status, user, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'Employee') {
      query.user = req.user.id;
    } else if (user) {
      query.user = user;
    }

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const total = await Salary.countDocuments(query);
    const data = await Salary.find(query)
      .populate('user', 'fullName employeeId department designation profileImage email salaryType')
      .sort({ year: -1, month: -1 })
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

// @desc    Update Salary record (Adjust bonus, penalty, mark paid)
// @route   PUT /api/salaries/:id
// @access  Private (Admin / Super Admin)
exports.updateSalary = async (req, res, next) => {
  try {
    const { bonus, penalty, advanceSalary, status, remarks } = req.body;
    const salary = await Salary.findById(req.params.id).populate('user');

    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }

    if (bonus !== undefined) salary.bonus = Number(bonus);
    if (penalty !== undefined) salary.penalty = Number(penalty);
    if (advanceSalary !== undefined) salary.advanceSalary = Number(advanceSalary);
    if (remarks !== undefined) salary.remarks = remarks;

    // Recalculate total earnings
    salary.totalEarnings = Math.max(
      0,
      (salary.fixedSalary || 0) + (salary.taskIncentive || 0) + (salary.bonus || 0) - (salary.penalty || 0) - (salary.advanceSalary || 0)
    );

    if (status && status !== salary.status) {
      salary.status = status;
      if (status === 'Paid') {
        salary.paymentDate = new Date();

        // Mark associated task payments as 'Paid'
        await Payment.updateMany(
          { user: salary.user._id, status: 'Unpaid' },
          { status: 'Paid', paymentDate: new Date() }
        );

        await Notification.create({
          recipient: salary.user._id,
          title: 'Salary Disbursed',
          message: `Your salary of $${salary.totalEarnings.toFixed(2)} for ${salary.month}/${salary.year} has been paid.`,
          type: 'Salary',
          link: '/employee/salary',
        });
      }
    }

    await salary.save();

    res.status(200).json({ success: true, data: salary });
  } catch (err) {
    next(err);
  }
};

// @desc    Download Salary Slip PDF
// @route   GET /api/salaries/:id/pdf
// @access  Private
exports.downloadSalarySlip = async (req, res, next) => {
  try {
    const salary = await Salary.findById(req.params.id).populate('user');

    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }

    // Check ownership if user is employee
    if (req.user.role === 'Employee' && salary.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this salary slip' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=SalarySlip_${salary.salaryId}.pdf`);

    generateSalarySlipPDF(salary, res);
  } catch (err) {
    next(err);
  }
};
