const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  selectBestEmployee,
  getBestEmployee,
  getAuditLogs,
  getDashboardStats,
  adminResetUserPassword,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/dashboard-stats', authorize('Admin'), getDashboardStats);
router.get('/best-employee', getBestEmployee);
router.post('/best-employee', authorize('Admin'), selectBestEmployee);
router.get('/audit-logs', authorize('Admin'), getAuditLogs);
router.put('/:id/restore', authorize('Admin'), restoreUser);
router.put('/:id/reset-password', authorize('Admin'), adminResetUserPassword);

router
  .route('/')
  .get(authorize('Admin'), getUsers)
  .post(authorize('Admin'), upload.single('profileImage'), createUser);

router
  .route('/:id')
  .get(getUserById)
  .put(authorize('Admin'), upload.single('profileImage'), updateUser)
  .delete(authorize('Admin'), deleteUser);

module.exports = router;
