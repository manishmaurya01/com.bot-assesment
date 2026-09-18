const express = require('express');
const router = express.Router({ mergeParams: true });
const { addComment, getCommentsByFeature, updateComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');
const { commentValidation } = require('../middlewares/validateMiddleware');

router.get('/', getCommentsByFeature);
router.post('/', protect, commentValidation.create, addComment);
router.put('/:commentId', protect, commentValidation.create, updateComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;