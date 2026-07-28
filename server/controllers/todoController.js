const Todo = require('../models/Todo');

// @desc    Get logged in user's todos
// @route   GET /api/todos
// @access  Private
exports.getTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ completed: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: todos.length, data: todos });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new todo item
// @route   POST /api/todos
// @access  Private
exports.createTodo = async (req, res, next) => {
  try {
    const { title, dueDate, priority } = req.body;
    const todo = await Todo.create({
      user: req.user.id,
      title,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
      completed: false,
    });
    res.status(201).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle todo completion status
// @route   PUT /api/todos/:id/toggle
// @access  Private
exports.toggleComplete = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo item not found' });
    }
    todo.completed = !todo.completed;
    await todo.save();
    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

// @desc    Edit todo item
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo item not found' });
    }
    res.status(200).json({ success: true, data: todo });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete todo item
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo item not found' });
    }
    res.status(200).json({ success: true, message: 'Todo deleted successfully' });
  } catch (err) {
    next(err);
  }
};
