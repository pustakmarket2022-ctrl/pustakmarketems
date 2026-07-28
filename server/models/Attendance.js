const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'],
      default: 'Present',
    },
    checkInLat: { type: Number, default: null },
    checkInLng: { type: Number, default: null },
    checkOutLat: { type: Number, default: null },
    checkOutLng: { type: Number, default: null },
    editHistory: [
      {
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editDate: { type: Date, default: Date.now },
        previousStatus: String,
        newStatus: String,
        previousCheckIn: Date,
        newCheckIn: Date,
        previousCheckOut: Date,
        newCheckOut: Date,
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate attendance per user per date
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
