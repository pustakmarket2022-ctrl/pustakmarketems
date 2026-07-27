const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
      required: true,
    },
    projectName: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
    },
    bookName: {
      type: String,
      required: [true, 'Please add a book name'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please add author name'],
      trim: true,
    },
    ISBN: {
      type: String,
      default: '',
    },
    publicationType: {
      type: String,
      enum: ['Book', 'eBook', 'Magazine', 'Journal', 'Research Paper'],
      default: 'Book',
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'Hold', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    deadline: {
      type: Date,
      required: true,
    },
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    estimatedBudget: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [
      {
        stepName: { type: String, required: true },
        status: { type: String, enum: ['Completed', 'In Progress', 'Pending'], default: 'Pending' },
        notes: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
