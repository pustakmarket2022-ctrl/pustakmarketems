const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getDepartments)
  .post(authorize('Admin'), createDepartment);

router.delete('/:id', authorize('Admin'), deleteDepartment);

module.exports = router;
