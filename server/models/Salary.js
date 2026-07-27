const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
  {
    salaryId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    salaryType: {
      type: String,
      enum: ['Monthly', 'Task Based', 'Hybrid'],
      required: true,
    },
    fixedSalary: {
      type: Number,
      default: 0,
    },
    taskIncentive: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    penalty: {
      type: Number,
      default: 0,
    },
    advanceSalary: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentDate: Date,
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure unique payroll generation per user per month/year
salarySchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
