const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  submitTask,
  reviewTask,
  updateTaskStatus,
  addComment,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('Admin'), upload.any(), createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(authorize('Admin'), upload.any(), updateTask)
  .delete(authorize('Admin'), deleteTask);

router.put('/:id/status', upload.any(), updateTaskStatus);
router.put('/:id/submit', upload.any(), submitTask);
router.put('/:id/review', authorize('Admin'), reviewTask);
router.post('/:id/comments', addComment);

module.exports = router;
