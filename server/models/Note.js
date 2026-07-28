const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Task', 'Employee', 'Meeting'],
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Note',
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add note content'],
      trim: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
