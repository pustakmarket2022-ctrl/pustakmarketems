const express = require('express');
const router = express.Router();
const { createMeeting, getMeetings, updateMeetingStatus } = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Admin'), createMeeting);
router.get('/', getMeetings);
router.put('/:id/status', authorize('Admin'), updateMeetingStatus);

module.exports = router;
