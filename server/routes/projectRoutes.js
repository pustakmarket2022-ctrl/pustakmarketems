const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  trackProject,
  getProjectContributors,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Route: Client & Author Project Tracking
router.get('/track/:identifier', trackProject);

router.use(protect);

router.get('/:id/contributors', getProjectContributors);

router
  .route('/')
  .get(getProjects)
  .post(authorize('Admin', 'Super Admin'), createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(authorize('Admin', 'Super Admin'), updateProject)
  .delete(authorize('Admin', 'Super Admin'), deleteProject);

module.exports = router;
