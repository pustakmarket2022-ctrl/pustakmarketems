const mongoose = require('mongoose');

const bestEmployeeSchema = new mongoose.Schema(
  {
    employee: {
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
    awardTitle: {
      type: String,
      default: 'Best Employee of the Month',
    },
    reason: {
      type: String,
      default: 'Exceptional performance and dedication',
    },
    selectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

bestEmployeeSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('BestEmployee', bestEmployeeSchema);
