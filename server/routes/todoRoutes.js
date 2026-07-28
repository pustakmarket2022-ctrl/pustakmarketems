const express = require('express');
const router = express.Router();
const { getTodos, createTodo, toggleComplete, updateTodo, deleteTodo } = require('../controllers/todoController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getTodos).post(createTodo);
router.put('/:id/toggle', toggleComplete);
router.route('/:id').put(updateTodo).delete(deleteTodo);

module.exports = router;
