const mongoose = require('mongoose');

const advanceRequestSchema = new mongoose.Schema(
  {
    advanceId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please enter advance amount'],
      min: [1, 'Amount must be greater than 0'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for advance'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    deductionMonth: {
      type: Number,
      default: null,
    },
    deductionYear: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdvanceRequest', advanceRequestSchema);
