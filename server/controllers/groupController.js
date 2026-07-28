const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateGroupId } = require('../utils/idGenerators');
const { getUploadedFileInfo } = require('../utils/cloudinaryService');
const logAudit = require('../utils/auditLogger');

// @desc    Create new Discussion Group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;
    const groupId = await generateGroupId();

    const memberList = Array.isArray(members) ? members : [];
    if (!memberList.includes(req.user.id)) {
      memberList.push(req.user.id);
    }

    const group = await Group.create({
      groupId,
      name,
      description,
      members: memberList,
      createdBy: req.user.id,
    });

    const populated = await Group.findById(group._id)
      .populate('createdBy', 'fullName role')
      .populate('members', 'fullName employeeId department profileImage designation');

    logAudit({ user: req.user.id, action: 'Group Created', details: `Group Name: ${name}`, req });

    res.status(201).json({ success: true, message: 'Group created successfully', data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's discussion groups
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'Super Admin') {
      query.members = req.user.id;
    }

    const groups = await Group.find(query)
      .populate('createdBy', 'fullName role')
      .populate('members', 'fullName employeeId department designation profileImage email')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: groups.length, data: groups });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Group Messages
// @route   GET /api/groups/:id/messages
// @access  Private
exports.getGroupMessages = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const messages = await GroupMessage.find({ group: req.params.id })
      .populate('sender', 'fullName employeeId role profileImage designation')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Send Group Message (with file attachment support)
// @route   POST /api/groups/:id/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fileInfo = getUploadedFileInfo(file);
        attachments.push({
          fileName: file.originalname,
          filePath: fileInfo.path,
          fileType: file.mimetype,
        });
      });
    }

    const newMessage = await GroupMessage.create({
      group: group._id,
      sender: req.user.id,
      message: message || '',
      attachments,
    });

    group.updatedAt = new Date();
    await group.save();

    // Notify other members
    for (const memberId of group.members) {
      if (memberId.toString() !== req.user.id.toString()) {
        await Notification.create({
          recipient: memberId,
          title: `New Message in ${group.name}`,
          message: `${req.user.fullName}: ${message ? message.substring(0, 40) : 'Sent an attachment'}`,
          type: 'Discussion',
          link: '/employee/discussion',
        });
      }
    }

    const populated = await GroupMessage.findById(newMessage._id).populate(
      'sender',
      'fullName employeeId role profileImage designation'
    );

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};
