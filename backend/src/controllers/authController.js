const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Generate simulated 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationCode
    });
    
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      accessToken,
      simulation: {
        verificationCode,
        message: `Simulated email sent to ${email}. Verification code: ${verificationCode}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token missing' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Token refresh failed' });
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
  }
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ message: 'Logged out successfully' });
};

// Simulation: verify email using the 6-digit code
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select('+verificationCode');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.json({ message: 'Account is already verified', isVerified: true });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid or incorrect verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully! You can now use all portal features.',
      isVerified: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Simulation: resend email verification code
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    await user.save();

    res.json({
      message: 'Verification code resent successfully',
      simulation: {
        verificationCode,
        message: `Simulated email resent to ${email}. Verification code: ${verificationCode}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password: generate reset token valid for 15 minutes
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    res.json({
      message: 'Password reset instructions generated',
      simulation: {
        resetToken,
        resetUrl: `/reset-password?token=${resetToken}`,
        message: `Simulated reset link sent to ${email}. Reset token: ${resetToken}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password +resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current logged-in user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};