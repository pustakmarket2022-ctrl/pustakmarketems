const express = require('express');
const router = express.Router();
const { requestAdvance, getAdvances, reviewAdvance } = require('../controllers/advanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', requestAdvance);
router.get('/', getAdvances);
router.put('/:id/review', authorize('Admin'), reviewAdvance);

module.exports = router;
