const Department = require('../models/Department');
const logAudit = require('../utils/auditLogger');

// Default initial departments list
const DEFAULT_DEPARTMENTS = [
  'Editorial',
  'Content Writing',
  'Proofreading',
  'Graphic Design',
  'Marketing',
  'Sales',
  'Printing',
  'Warehouse',
  'Accounts',
  'HR',
  'IT',
];

// @desc    Get all departments (seed defaults if empty)
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    let departments = await Department.find().sort({ name: 1 });

    if (departments.length === 0) {
      // Seed default departments
      const initialData = DEFAULT_DEPARTMENTS.map((d) => ({ name: d, description: `${d} Department` }));
      departments = await Department.insertMany(initialData);
    }

    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin / Super Admin / HR)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const dept = await Department.create({
      name: name.trim(),
      description: description || '',
    });

    logAudit({ user: req.user.id, action: 'Department Created', details: `Created department '${dept.name}'`, req });

    res.status(201).json({ success: true, message: 'Department created successfully', data: dept });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin / Super Admin)
exports.deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await dept.deleteOne();

    logAudit({ user: req.user.id, action: 'Department Deleted', details: `Deleted department '${dept.name}'`, req });

    res.status(200).json({ success: true, message: `Department '${dept.name}' removed successfully` });
  } catch (err) {
    next(err);
  }
};
