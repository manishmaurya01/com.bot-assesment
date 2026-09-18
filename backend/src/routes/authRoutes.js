const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { authValidation } = require('../middlewares/validateMiddleware');
const { protect } = require('../middlewares/authMiddleware');

router.post('/signup', authValidation.signup, signup);
router.post('/login', authValidation.login, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

router.post('/verify-email', authValidation.verifyEmail, verifyEmail);
router.post('/resend-verification', authValidation.resendVerification, resendVerification);
router.post('/forgot-password', authValidation.forgotPassword, forgotPassword);
router.post('/reset-password', authValidation.resetPassword, resetPassword);

router.get('/me', protect, getMe);

module.exports = router;