const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  editAttendance,
  getAttendance,
  getMyAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my', getMyAttendance);
router.put('/:id/edit', authorize('Admin'), editAttendance);
router.get('/', authorize('Admin'), getAttendance);

module.exports = router;
