const express = require('express');
const router = express.Router();
const {
  exportEmployeesReport,
  exportAttendanceReport,
  exportTasksReport,
  exportSalaryReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin', 'Super Admin'));

router.get('/employees/excel', exportEmployeesReport);
router.get('/attendance/excel', exportAttendanceReport);
router.get('/tasks/excel', exportTasksReport);
router.get('/salary/excel', exportSalaryReport);

module.exports = router;
