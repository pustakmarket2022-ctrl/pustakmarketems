const Task = require('../models/Task');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { generateTaskId, generatePaymentId } = require('../utils/idGenerators');

// @desc    Get all tasks with filters & search
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project, assignedTo, taskStatus, paymentStatus, priority, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (project) query.project = project;
    if (assignedTo) query.assignedTo = assignedTo;
    if (taskStatus) query.taskStatus = taskStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (priority) query.priority = priority;

    // Filter by assigned employee if role is Employee
    if (req.user.role === 'Employee') {
      query.assignedTo = req.user.id;
    }

    if (search) {
      query.$or = [
        { taskTitle: { $regex: search, $options: 'i' } },
        { taskId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('project', 'projectName bookName projectId')
      .populate('assignedTo', 'fullName email employeeId profileImage department')
      .populate('comments.user', 'fullName profileImage role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'projectName bookName projectId author')
      .populate('assignedTo', 'fullName email employeeId profileImage department designation salaryType perTaskRate')
      .populate('comments.user', 'fullName profileImage role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Task (Admin)
// @route   POST /api/tasks
// @access  Private (Admin / Super Admin)
exports.createTask = async (req, res, next) => {
  try {
    const taskId = await generateTaskId();

    const task = await Task.create({
      ...req.body,
      taskId,
    });

    // Send notifications to assigned employees
    if (req.body.assignedTo && Array.isArray(req.body.assignedTo)) {
      for (const empId of req.body.assignedTo) {
        await Notification.create({
          recipient: empId,
          title: 'New Task Assigned',
          message: `You have been assigned to task '${task.taskTitle}' (${task.taskId}).`,
          type: 'Task',
          link: `/employee/tasks`,
        });
      }
    }

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'projectName bookName projectId')
      .populate('assignedTo', 'fullName email employeeId profileImage department');

    res.status(201).json({ success: true, data: populatedTask });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Task (Admin)
// @route   PUT /api/tasks/:id
// @access  Private (Admin / Super Admin)
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'projectName bookName projectId')
      .populate('assignedTo', 'fullName email employeeId profileImage department');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Task (Admin)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin / Super Admin)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Employee Submit Task Work
// @route   PUT /api/tasks/:id/submit
// @access  Private (Employee)
exports.submitTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { progressPercentage, note } = req.body;

    task.progressPercentage = progressPercentage || 100;
    task.taskStatus = 'Submitted';

    if (note) {
      task.comments.push({
        user: req.user.id,
        text: `[Task Submitted]: ${note}`,
      });
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        task.attachments.push({
          fileName: file.originalname,
          filePath: `/uploads/${file.filename}`,
        });
      });
    }

    await task.save();

    res.status(200).json({ success: true, message: 'Task submitted for review', data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Review & Approve / Reject Task
// @route   PUT /api/tasks/:id/review
// @access  Private (Admin / Super Admin)
exports.reviewTask = async (req, res, next) => {
  try {
    const { action, reviewNotes } = req.body; // action: 'Approved' | 'Rejected'
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (action === 'Approved') {
      task.taskStatus = 'Approved';
      task.completedDate = new Date();
      task.progressPercentage = 100;

      // Create Payment records for assigned employees if task payment amount exists
      if (task.taskPaymentAmount > 0 && task.assignedTo.length > 0) {
        const amountPerEmployee = task.taskPaymentAmount / task.assignedTo.length;

        for (const empId of task.assignedTo) {
          const paymentId = await generatePaymentId();
          await Payment.create({
            paymentId,
            task: task._id,
            user: empId,
            amount: amountPerEmployee,
            status: 'Unpaid',
          });

          await Notification.create({
            recipient: empId,
            title: 'Task Payment Approved',
            message: `Your task '${task.taskTitle}' was approved! Payment of $${amountPerEmployee.toFixed(2)} is queued.`,
            type: 'Salary',
            link: '/employee/salary',
          });
        }
      }
    } else {
      task.taskStatus = 'Rejected';
      if (task.assignedTo.length > 0) {
        for (const empId of task.assignedTo) {
          await Notification.create({
            recipient: empId,
            title: 'Task Submission Rejected',
            message: `Your task '${task.taskTitle}' requires revisions. Note: ${reviewNotes || 'Please check feedback'}`,
            type: 'Task',
            link: '/employee/tasks',
          });
        }
      }
    }

    if (reviewNotes) {
      task.comments.push({
        user: req.user.id,
        text: `[Admin Review - ${action}]: ${reviewNotes}`,
      });
    }

    await task.save();

    res.status(200).json({ success: true, message: `Task marked as ${action}`, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Add Comment to Task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.comments.push({
      user: req.user.id,
      text: req.body.text,
    });

    await task.save();

    const updatedTask = await Task.findById(task._id).populate('comments.user', 'fullName profileImage role');
    res.status(200).json({ success: true, data: updatedTask.comments });
  } catch (err) {
    next(err);
  }
};
