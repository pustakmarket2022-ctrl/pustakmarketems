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
  addComment,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('Admin', 'Super Admin'), createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(authorize('Admin', 'Super Admin'), updateTask)
  .delete(authorize('Admin', 'Super Admin'), deleteTask);

router.put('/:id/submit', upload.array('attachments', 5), submitTask);
router.put('/:id/review', authorize('Admin', 'Super Admin'), reviewTask);
router.post('/:id/comments', addComment);

module.exports = router;
