const Salary = require('../models/Salary');
const User = require('../models/User');
const Task = require('../models/Task');
const Payment = require('../models/Payment');
const AdvanceRequest = require('../models/AdvanceRequest');
const Overtime = require('../models/Overtime');
const Notification = require('../models/Notification');
const { generateSalaryId } = require('../utils/idGenerators');
const { generateSalarySlipPDF } = require('../utils/pdfGenerator');
const { sendSalarySlipGeneratedEmail } = require('../utils/emailService');
const logAudit = require('../utils/auditLogger');

// @desc    Generate Payroll for Month & Year
// @route   POST /api/salaries/generate
// @access  Private (Admin / Super Admin / HR)
exports.generatePayroll = async (req, res, next) => {
  try {
    const { month, year, userId, advanceSalary, bonus: manualBonus, penalty: manualPenalty } = req.body;

    const query = { isDeleted: { $ne: true }, status: 'Active' };
    if (userId) query._id = userId;

    const employees = await User.find(query);
    const generatedSalaries = [];

    for (const emp of employees) {
      // 1. Task Incentive & Details
      const approvedPayments = await Payment.find({
        user: emp._id,
        status: 'Unpaid',
      }).populate({
        path: 'task',
        populate: { path: 'project', select: 'bookName projectName' },
      });

      const taskIncentive = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

      let tasksDetails = [];
      if (approvedPayments.length > 0) {
        tasksDetails = approvedPayments.map((p) => ({
          taskId: p.task?.taskId || 'N/A',
          taskTitle: p.task?.taskTitle || 'Task Deliverable',
          completedDate: p.task?.completedDate || p.task?.updatedAt || p.createdAt,
          amount: p.amount || p.task?.taskPaymentAmount || 0,
          projectName: p.task?.project?.bookName || p.task?.project?.projectName || '',
        }));
      } else {
        const empTasks = await Task.find({
          assignedTo: emp._id,
          taskStatus: { $in: ['Approved', 'Completed'] },
        }).populate('project', 'bookName projectName');

        tasksDetails = empTasks.map((t) => ({
          taskId: t.taskId || 'N/A',
          taskTitle: t.taskTitle,
          completedDate: t.completedDate || t.updatedAt || t.createdAt,
          amount: t.taskPaymentAmount || 0,
          projectName: t.project?.bookName || t.project?.projectName || '',
        }));
      }

      // 2. Fixed Base Salary
      let fixedSalary = 0;
      if (emp.salaryType === 'Monthly' || emp.salaryType === 'Hybrid') {
        fixedSalary = emp.fixedSalary || 0;
      }

      // 3. Approved Overtime Amount in this Month/Year
      const approvedOvertimes = await Overtime.find({
        user: emp._id,
        status: 'Approved',
      });
      const overtimeHours = approvedOvertimes.reduce((sum, o) => sum + (o.hours || 0), 0);
      const overtimeAmount = approvedOvertimes.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // 4. Approved & Pending Advance Deductions
      const allAdvRequests = await AdvanceRequest.find({
        user: emp._id,
        status: { $in: ['Pending', 'Approved', 'Paid'] },
      });
      const autoAdvDeduction = allAdvRequests
        .filter((a) => a.status === 'Approved' || a.status === 'Paid')
        .reduce((sum, a) => sum + a.amount, 0);
      const advDeduction = advanceSalary !== undefined ? Number(advanceSalary) : autoAdvDeduction;

      const totalAdvRequested = allAdvRequests.reduce((sum, a) => sum + (a.amount || 0), 0);
      const pendingAdvance = Math.max(0, totalAdvRequested - advDeduction);

      // 5. Bonus & Penalty
      const bonus = manualBonus !== undefined ? Number(manualBonus) : 0;
      const penalty = manualPenalty !== undefined ? Number(manualPenalty) : 0;

      // Formula: Final Net Salary = Fixed + Task + Bonus + Overtime - Penalty - Advance - PendingAdvance
      const totalDeductions = penalty + advDeduction + pendingAdvance;
      const totalEarnings = Math.max(0, fixedSalary + taskIncentive + bonus + overtimeAmount - totalDeductions);

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
          tasksDetails,
          pendingAdvance,
          bonus,
          overtimeHours,
          overtimeRate: emp.overtimeRate || 0,
          overtimeAmount,
          penalty,
          advanceSalary: advDeduction,
          totalEarnings,
          status: 'Pending',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate('user', 'fullName email employeeId department designation');

      generatedSalaries.push(salary);

      // Create notification & email
      await createAndEmitNotification(req.app, {
        userId: emp._id,
        senderId: req.user.id,
        title: 'Salary Slip Generated',
        message: `Your payroll statement for ${month}/${year} has been generated. Net Salary: ₹${totalEarnings.toFixed(2)}.`,
        type: 'Salary',
        referenceId: salary._id,
        referenceModel: 'Salary',
        route: '/employee/salary',
        priority: 'High',
      });

      sendSalarySlipGeneratedEmail(emp, salary, month, year);
    }

    logAudit({
      user: req.user.id,
      action: 'Payroll Generated',
      details: `Generated payroll for ${month}/${year} (${generatedSalaries.length} employees)`,
      req,
    });

    res.status(201).json({
      success: true,
      message: `Payroll generated for ${generatedSalaries.length} employee(s)`,
      data: generatedSalaries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all Salary Records (Admin/HR gets all, Employee gets own)
// @route   GET /api/salaries
// @access  Private
exports.getSalaries = async (req, res, next) => {
  try {
    const { month, year, user, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    if (req.user.role === 'Employee') {
      query.user = req.user.id;
    } else if (user) {
      query.user = user;
    }

    const skip = (page - 1) * limit;
    const total = await Salary.countDocuments(query);
    const data = await Salary.find(query)
      .populate('user', 'fullName email employeeId department designation fixedSalary salaryType profileImage')
      .sort({ year: -1, month: -1, createdAt: -1 })
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
// @access  Private (Admin / Super Admin / HR)
exports.updateSalary = async (req, res, next) => {
  try {
    const { bonus, penalty, advanceSalary, overtimeAmount, status, remarks } = req.body;
    const salary = await Salary.findById(req.params.id).populate('user');

    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }

    if (bonus !== undefined) salary.bonus = Number(bonus);
    if (penalty !== undefined) salary.penalty = Number(penalty);
    if (advanceSalary !== undefined) salary.advanceSalary = Number(advanceSalary);
    if (overtimeAmount !== undefined) salary.overtimeAmount = Number(overtimeAmount);
    if (remarks !== undefined) salary.remarks = remarks;

    salary.totalEarnings = Math.max(
      0,
      (salary.fixedSalary || 0) +
        (salary.taskIncentive || 0) +
        (salary.bonus || 0) +
        (salary.overtimeAmount || 0) -
        (salary.penalty || 0) -
        (salary.advanceSalary || 0) -
        (salary.pendingAdvance || 0)
    );

    if (status && status !== salary.status) {
      salary.status = status;
      if (status === 'Paid') {
        salary.paymentDate = new Date();

        await Payment.updateMany(
          { user: salary.user._id, status: 'Unpaid' },
          { status: 'Paid', paymentDate: new Date() }
        );

        await Notification.create({
          recipient: salary.user._id,
          title: 'Salary Disbursed',
          message: `Your salary of ₹${salary.totalEarnings.toFixed(2)} for ${salary.month}/${salary.year} has been paid.`,
          type: 'Salary',
          link: '/employee/salary',
        });
      }
    }

    await salary.save();

    logAudit({
      user: req.user.id,
      action: 'Salary Record Updated',
      details: `Updated salary ${salary.salaryId} for ${salary.user.fullName}`,
      req,
    });

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

    if (req.user.role === 'Employee' && salary.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this salary slip' });
    }

    const salaryObj = salary.toObject();

    // Dynamically populate tasks details if missing
    if (!salaryObj.tasksDetails || salaryObj.tasksDetails.length === 0) {
      const empTasks = await Task.find({
        assignedTo: salary.user._id,
        taskStatus: { $in: ['Approved', 'Completed'] },
      }).populate('project', 'bookName projectName');

      salaryObj.tasksDetails = empTasks.map((t) => ({
        taskId: t.taskId || 'N/A',
        taskTitle: t.taskTitle,
        completedDate: t.completedDate || t.updatedAt || t.createdAt,
        amount: t.taskPaymentAmount || 0,
        projectName: t.project?.bookName || t.project?.projectName || '',
      }));
    }

    // Dynamically populate pending advance if missing
    if (salaryObj.pendingAdvance === undefined || salaryObj.pendingAdvance === 0) {
      const pendingAdv = await AdvanceRequest.find({
        user: salary.user._id,
        status: { $in: ['Pending', 'Approved'] },
      });
      const totalAdv = pendingAdv.reduce((sum, a) => sum + (a.amount || 0), 0);
      salaryObj.pendingAdvance = Math.max(0, totalAdv - (salaryObj.advanceSalary || 0));
    }

    // Ensure totalEarnings subtracts pendingAdvance for PDF display
    const grossEarnings = (salaryObj.fixedSalary || 0) + (salaryObj.taskIncentive || 0) + (salaryObj.overtimeAmount || 0) + (salaryObj.bonus || 0);
    const totalDeductions = (salaryObj.penalty || 0) + (salaryObj.advanceSalary || 0) + (salaryObj.pendingAdvance || 0);
    salaryObj.totalEarnings = Math.max(0, grossEarnings - totalDeductions);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=SalarySlip_${salary.salaryId}.pdf`);

    generateSalarySlipPDF(salaryObj, res);
  } catch (err) {
    next(err);
  }
};
