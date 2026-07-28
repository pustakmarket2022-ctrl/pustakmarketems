const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  trackProject,
  updateProjectProgress,
  addProjectMilestone,
  updateProjectMilestone,
  deleteProjectMilestone,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Route: Client & Author Project Tracking
router.get('/track/:identifier', trackProject);

router.use(protect);

router.put('/:id/progress', updateProjectProgress);

// Milestone routes
router.post('/:id/milestones', authorize('Admin'), addProjectMilestone);
router.route('/:id/milestones/:milestoneId')
  .put(authorize('Admin'), updateProjectMilestone)
  .delete(authorize('Admin'), deleteProjectMilestone);

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
