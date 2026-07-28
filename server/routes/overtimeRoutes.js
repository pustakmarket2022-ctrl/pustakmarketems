const express = require('express');
const router = express.Router();
const { requestOvertime, getOvertime, reviewOvertime } = require('../controllers/overtimeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', requestOvertime);
router.get('/', getOvertime);
router.put('/:id/review', authorize('Admin'), reviewOvertime);

module.exports = router;
