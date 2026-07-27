const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaveRequests,
  reviewLeaveRequest,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getLeaveRequests).post(applyLeave);
router.put('/:id/review', authorize('Admin', 'Super Admin'), reviewLeaveRequest);

module.exports = router;
