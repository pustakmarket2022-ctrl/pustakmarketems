const Project = require('../models/Project');
const Task = require('../models/Task');
const { generateProjectId } = require('../utils/idGenerators');

// @desc    Get all projects with filters & search
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { publicationType, status, priority, category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (publicationType) query.publicationType = publicationType;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    // Filter by assigned employee if requested or if employee user role
    if (req.user.role === 'Employee') {
      query.assignedEmployees = req.user.id;
    }

    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { bookName: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { projectId: { $regex: search, $options: 'i' } },
        { ISBN: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('assignedEmployees', 'fullName email employeeId profileImage department designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'assignedEmployees',
      'fullName email employeeId profileImage department designation'
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin / Super Admin)
exports.createProject = async (req, res, next) => {
  try {
    const projectId = await generateProjectId();
    const project = await Project.create({
      ...req.body,
      projectId,
    });

    const populatedProject = await Project.findById(project._id).populate(
      'assignedEmployees',
      'fullName email employeeId profileImage department designation'
    );

    res.status(201).json({ success: true, data: populatedProject });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin / Super Admin)
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedEmployees', 'fullName email employeeId profileImage department designation');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin / Super Admin)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.deleteOne();
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Public Track Project by Project ID, ISBN, or Book Name
// @route   GET /api/projects/track/:identifier
// @access  Public
exports.trackProject = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const project = await Project.findOne({
      $or: [
        { projectId: { $regex: `^${identifier.trim()}$`, $options: 'i' } },
        { ISBN: { $regex: identifier.trim(), $options: 'i' } },
        { bookName: { $regex: identifier.trim(), $options: 'i' } },
      ],
    }).populate('assignedEmployees', 'fullName email employeeId profileImage department designation');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'No publication project found with that Project ID, ISBN, or Book Name.',
      });
    }

    const tasks = await Task.find({ project: project._id }).populate(
      'assignedTo',
      'fullName email employeeId profileImage department designation'
    );

    res.status(200).json({
      success: true,
      data: {
        _id: project._id,
        projectId: project.projectId,
        bookName: project.bookName,
        author: project.author,
        ISBN: project.ISBN || 'N/A',
        publicationType: project.publicationType,
        category: project.category,
        status: project.status,
        deadline: project.deadline,
        completionPercentage: project.completionPercentage,
        milestones: project.milestones || [],
        teamCount: project.assignedEmployees ? project.assignedEmployees.length : 0,
        assignedEmployees: project.assignedEmployees || [],
        tasks: tasks || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed breakdown of contributors and tasks for a book/project
// @route   GET /api/projects/:id/contributors
// @access  Private
exports.getProjectContributors = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'assignedEmployees',
      'fullName email employeeId profileImage department designation'
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await Task.find({ project: project._id }).populate(
      'assignedTo',
      'fullName email employeeId profileImage department designation'
    );

    res.status(200).json({
      success: true,
      data: {
        project,
        assignedEmployees: project.assignedEmployees || [],
        tasks: tasks || [],
      },
    });
  } catch (err) {
    next(err);
  }
// @desc    Employee / Admin Update Project Progress & Completion Percentage
// @route   PUT /api/projects/:id/progress
// @access  Private
exports.updateProjectProgress = async (req, res, next) => {
  try {
    const { completionPercentage, status, milestones } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (completionPercentage !== undefined) project.completionPercentage = Number(completionPercentage);
    if (status) project.status = status;
    if (milestones) project.milestones = milestones;

    await project.save();

    res.status(200).json({ success: true, message: 'Project progress updated successfully', data: project });
  } catch (err) {
    next(err);
  }
};

