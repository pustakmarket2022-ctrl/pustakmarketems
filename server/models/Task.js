const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      unique: true,
      required: true,
    },
    taskTitle: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    taskCategory: {
      type: String,
      enum: ['Project Task', 'General Office Work'],
      default: 'Project Task',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    ratePerPage: {
      type: Number,
      default: 0,
    },
    taskPaymentAmount: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        fileName: String,
        filePath: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completedDate: Date,
    taskStatus: {
      type: String,
      enum: ['Pending', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Processing', 'Paid'],
      default: 'Unpaid',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
