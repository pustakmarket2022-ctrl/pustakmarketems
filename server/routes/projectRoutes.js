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
  updateProjectProgress,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Route: Client & Author Project Tracking
router.get('/track/:identifier', trackProject);

router.use(protect);

router.get('/:id/contributors', getProjectContributors);
router.put('/:id/progress', updateProjectProgress);

router
  .route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(authorize('Admin'), updateProject)
  .delete(authorize('Admin'), deleteProject);

module.exports = router;
