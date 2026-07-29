const Task = require('../models/Task');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateTaskId, generatePaymentId } = require('../utils/idGenerators');
const { getUploadedFileInfo } = require('../utils/cloudinaryService');
const {
  sendTaskAssignedEmail,
  sendTaskUpdatedEmail,
  sendTaskDeadlineChangedEmail,
  sendTaskCompletedEmail,
} = require('../utils/emailService');
const { createAndEmitNotification } = require('../utils/notificationEngine');
const logAudit = require('../utils/auditLogger');

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

exports.createTask = async (req, res, next) => {
  try {
    const taskId = await generateTaskId();

    const initialAttachments = [];
    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const fileInfo = getUploadedFileInfo(file);
        initialAttachments.push({
          fileName: file.originalname || file.filename || 'Admin Reference File',
          filePath: fileInfo.path,
          uploadedAt: new Date(),
        });
      });
    }

    // Parse assignedTo if sent as array string in FormData
    let assignedTo = req.body.assignedTo;
    if (typeof assignedTo === 'string') {
      try {
        assignedTo = JSON.parse(assignedTo);
      } catch (e) {
        assignedTo = [assignedTo];
      }
    }

    const task = await Task.create({
      ...req.body,
      assignedTo: assignedTo || [],
      taskId,
      attachments: initialAttachments,
    });

    // Notify & email assigned employees
    const assignedList = Array.isArray(task.assignedTo) ? task.assignedTo : [];
    for (const empId of assignedList) {
      const emp = await User.findById(empId);
      if (emp) {
        await createAndEmitNotification(req.app, {
          userId: emp._id,
          senderId: req.user.id,
          title: 'New Task Assigned',
          message: `You have been assigned to task '${task.taskTitle}' (${task.taskId}).`,
          type: 'Task',
          referenceId: task._id,
          referenceModel: 'Task',
          route: '/employee/tasks',
          priority: task.priority === 'Urgent' || task.priority === 'High' ? 'High' : 'Medium',
        });

        sendTaskAssignedEmail(emp, task, req.user);
      }
    }

    logAudit({ user: req.user.id, action: 'Task Created', details: `Created task ${task.taskTitle} (${task.taskId})`, req });

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
// @access  Private (Admin / Super Admin / HR / Manager)
exports.updateTask = async (req, res, next) => {
  try {
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const isDeadlineChanged = req.body.deadline && new Date(req.body.deadline).getTime() !== new Date(oldTask.deadline).getTime();

    const updateBody = { ...req.body };
    if (typeof updateBody.assignedTo === 'string') {
      try {
        updateBody.assignedTo = JSON.parse(updateBody.assignedTo);
      } catch (e) {
        updateBody.assignedTo = [updateBody.assignedTo];
      }
    }

    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    if (uploadedFiles && uploadedFiles.length > 0) {
      const existingAtts = oldTask.attachments || [];
      uploadedFiles.forEach((file) => {
        const fileInfo = getUploadedFileInfo(file);
        existingAtts.push({
          fileName: file.originalname || file.filename || 'Admin Reference File',
          filePath: fileInfo.path,
          uploadedAt: new Date(),
        });
      });
      updateBody.attachments = existingAtts;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updateBody, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'projectName bookName projectId')
      .populate('assignedTo', 'fullName email employeeId profileImage department');

    // Notify assigned employees
    for (const emp of task.assignedTo) {
      if (isDeadlineChanged) {
        sendTaskDeadlineChangedEmail(emp, task);
      } else {
        sendTaskUpdatedEmail(emp, task);
      }
    }

    logAudit({ user: req.user.id, action: 'Task Updated', details: `Updated task ${task.taskTitle}`, req });

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
    logAudit({ user: req.user.id, action: 'Task Deleted', details: `Deleted task ${task.taskTitle}`, req });

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

    const uploadedFiles = req.files || (req.file ? [req.file] : []);
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const fileInfo = getUploadedFileInfo(file);
        task.attachments.push({
          fileName: file.originalname || file.filename || 'Work Deliverable',
          filePath: fileInfo.path,
          uploadedAt: new Date(),
        });
      });
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'projectName bookName projectId')
      .populate('assignedTo', 'fullName email employeeId profileImage department')
      .populate('comments.user', 'fullName profileImage role');

    logAudit({ user: req.user.id, action: 'Task Submitted', details: `Submitted task ${task.taskTitle}`, req });

    res.status(200).json({ success: true, message: 'Task submitted for review', data: populatedTask });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Review & Approve / Reject Task & Enter Payment Amount
// @route   PUT /api/tasks/:id/review
// @access  Private (Admin / Super Admin / HR / Manager)
exports.reviewTask = async (req, res, next) => {
  try {
    const { action, reviewNotes, taskPaymentAmount } = req.body;
    const task = await Task.findById(req.params.id).populate('assignedTo');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (taskPaymentAmount !== undefined) {
      task.taskPaymentAmount = Number(taskPaymentAmount);
    }

    if (action === 'Approved') {
      task.taskStatus = 'Approved';
      task.completedDate = new Date();
      task.progressPercentage = 100;

      if (task.taskPaymentAmount > 0 && task.assignedTo.length > 0) {
        const amountPerEmployee = task.taskPaymentAmount / task.assignedTo.length;

        for (const emp of task.assignedTo) {
          const paymentId = await generatePaymentId();
          await Payment.create({
            paymentId,
            task: task._id,
            user: emp._id,
            amount: amountPerEmployee,
            status: 'Unpaid',
          });

          await Notification.create({
            recipient: emp._id,
            title: 'Task Approved & Payment Amount Set',
            message: `Your task '${task.taskTitle}' was approved! Payment of ₹${amountPerEmployee.toFixed(2)} is queued.`,
            type: 'Task',
            link: '/employee/salary',
          });

          sendTaskCompletedEmail(emp, task);
        }
      } else {
        for (const emp of task.assignedTo) {
          sendTaskCompletedEmail(emp, task);
        }
      }
    } else {
      task.taskStatus = 'Pending'; // Change back to Pending for employee revision as requested
      if (task.assignedTo.length > 0) {
        for (const emp of task.assignedTo) {
          await Notification.create({
            recipient: emp._id,
            title: 'Task Returned for Revision (Pending)',
            message: `Your task '${task.taskTitle}' requires revision and has been moved back to Pending. Note: ${reviewNotes || 'Please update and resubmit.'}`,
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

    logAudit({
      user: req.user.id,
      action: `Task ${action}`,
      details: `Task ${task.taskTitle} marked as ${action}. Payment: ₹${task.taskPaymentAmount}`,
      req,
    });

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

// @desc    Employee Update Task Status / Progress
// @route   PUT /api/tasks/:id/status
// @access  Private (Employee / Assigned User)
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { taskStatus, progressPercentage, note } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (taskStatus) task.taskStatus = taskStatus;
    if (progressPercentage !== undefined) task.progressPercentage = Number(progressPercentage);

    if (note) {
      task.comments.push({
        user: req.user.id,
        text: `[Status Update]: ${note}`,
      });
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fileInfo = getUploadedFileInfo(file);
        task.attachments.push({
          fileName: file.originalname || file.filename || 'Deliverable',
          filePath: fileInfo.path,
        });
      });
    } else if (req.file) {
      const fileInfo = getUploadedFileInfo(req.file);
      task.attachments.push({
        fileName: req.file.originalname || req.file.filename || 'Deliverable',
        filePath: fileInfo.path,
      });
    }

    await task.save();

    logAudit({
      user: req.user.id,
      action: 'Task Status Updated',
      details: `Updated task ${task.taskTitle} status to '${task.taskStatus}' (${task.progressPercentage}%)`,
      req,
    });

    res.status(200).json({ success: true, message: 'Task status updated successfully', data: task });
  } catch (err) {
    next(err);
  }
};
