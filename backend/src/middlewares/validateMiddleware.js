const { validationResult, body } = require('express-validator');

// Generic error formatting middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Route-specific validation rulesets
const authValidation = {
  signup: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
  ],
  login: [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  verifyEmail: [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('code').trim().notEmpty().withMessage('Verification code is required'),
    validate
  ],
  resendVerification: [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    validate
  ],
  forgotPassword: [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    validate
  ],
  resetPassword: [
    body('token').trim().notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
  ]
};

const featureValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 120 })
      .withMessage('Title cannot exceed 120 characters'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('category')
      .isIn(['UI/UX', 'Integrations', 'Performance', 'General'])
      .withMessage('Invalid category specified'),
    validate
  ],
  update: [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 120 })
      .withMessage('Title cannot exceed 120 characters'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('category')
      .optional()
      .isIn(['UI/UX', 'Integrations', 'Performance', 'General'])
      .withMessage('Invalid category specified'),
    validate
  ]
};

const commentValidation = {
  create: [
    body('content').trim().notEmpty().withMessage('Comment text cannot be empty'),
    validate
  ]
};

module.exports = {
  validate,
  authValidation,
  featureValidation,
  commentValidation
};