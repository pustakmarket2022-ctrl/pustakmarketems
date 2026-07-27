const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatepassword', protect, changePassword);
router.put('/updateprofile', protect, upload.single('profileImage'), updateProfile);

module.exports = router;
