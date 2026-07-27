const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/dashboard-stats', authorize('Admin', 'Super Admin'), getDashboardStats);

router
  .route('/')
  .get(authorize('Admin', 'Super Admin'), getUsers)
  .post(authorize('Admin', 'Super Admin'), upload.single('profileImage'), createUser);

router
  .route('/:id')
  .get(authorize('Admin', 'Super Admin'), getUserById)
  .put(authorize('Admin', 'Super Admin'), upload.single('profileImage'), updateUser)
  .delete(authorize('Admin', 'Super Admin'), deleteUser);

module.exports = router;
