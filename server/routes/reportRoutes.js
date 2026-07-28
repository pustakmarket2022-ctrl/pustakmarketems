const express = require('express');
const router = express.Router();
const {
  exportEmployeesReport,
  exportAttendanceReport,
  exportTasksReport,
  exportSalaryReport,
  exportAdvanceReport,
  exportOvertimeReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/employees/excel', exportEmployeesReport);
router.get('/attendance/excel', exportAttendanceReport);
router.get('/tasks/excel', exportTasksReport);
router.get('/salary/excel', exportSalaryReport);
router.get('/advance/excel', exportAdvanceReport);
router.get('/overtime/excel', exportOvertimeReport);

module.exports = router;
