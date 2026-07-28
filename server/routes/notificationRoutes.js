const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .delete(deleteAllNotifications);

router.put('/read-all', markAllAsRead);
router.post('/delete-multiple', deleteMultipleNotifications);

router.route('/:id')
  .put(markAsRead)
  .delete(deleteNotification);

module.exports = router;
