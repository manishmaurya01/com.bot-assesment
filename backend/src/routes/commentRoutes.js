const express = require('express');
const router = express.Router({ mergeParams: true });
const { addComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');
const { commentValidation } = require('../middlewares/validateMiddleware');

router.post('/', protect, commentValidation.create, addComment);

module.exports = router;