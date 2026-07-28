const Note = require('../models/Note');
const logAudit = require('../utils/auditLogger');

// @desc    Get notes for entity
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;
    const query = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;

    const notes = await Note.find(query)
      .populate('author', 'fullName profileImage role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    next(err);
  }
};

// @desc    Create note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    const { entityType, entityId, title, content, isPrivate } = req.body;

    const note = await Note.create({
      author: req.user.id,
      entityType,
      entityId,
      title: title || 'Note',
      content,
      isPrivate: !!isPrivate,
    });

    const populated = await Note.findById(note._id).populate('author', 'fullName profileImage role');

    logAudit({ user: req.user.id, action: 'Note Created', details: `Added note to ${entityType} ${entityId}`, req });

    res.status(201).json({ success: true, message: 'Note added successfully', data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this note' });
    }

    const { title, content, isPrivate } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (isPrivate !== undefined) note.isPrivate = isPrivate;

    await note.save();
    const populated = await Note.findById(note._id).populate('author', 'fullName profileImage role');

    logAudit({ user: req.user.id, action: 'Note Updated', details: `Updated note ${note._id}`, req });

    res.status(200).json({ success: true, message: 'Note updated successfully', data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.author.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();

    logAudit({ user: req.user.id, action: 'Note Deleted', details: `Deleted note ${note._id}`, req });

    res.status(200).json({ success: true, message: 'Note removed successfully' });
  } catch (err) {
    next(err);
  }
};
