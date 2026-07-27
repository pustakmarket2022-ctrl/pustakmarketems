const express = require('express');
const router = express.Router();
const {
  generatePayroll,
  getSalaries,
  updateSalary,
  downloadSalarySlip,
} = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/generate', authorize('Admin', 'Super Admin'), generatePayroll);
router.get('/', getSalaries);
router.put('/:id', authorize('Admin', 'Super Admin'), updateSalary);
router.get('/:id/pdf', downloadSalarySlip);

module.exports = router;
