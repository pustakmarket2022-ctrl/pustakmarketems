const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupMessages,
  sendMessage,
  addGroupMember,
  removeGroupMember,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/').get(getGroups).post(createGroup);
router.get('/:id/messages', getGroupMessages);
router.post('/:id/messages', upload.array('attachments', 5), sendMessage);

router.post('/:id/members', addGroupMember);
router.delete('/:id/members/:memberId', removeGroupMember);

module.exports = router;
