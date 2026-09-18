const express = require('express');
const router = express.Router();
const { signup, login, refreshToken, logout } = require('../controllers/authController');
const { authValidation } = require('../middlewares/validateMiddleware');

router.post('/signup', authValidation.signup, signup);
router.post('/login', authValidation.login, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;