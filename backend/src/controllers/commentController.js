const Comment = require('../models/Comment');
const FeatureRequest = require('../models/FeatureRequest');

exports.addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const featureId = req.params.featureId;

    const feature = await FeatureRequest.findById(featureId);
    if (!feature) return res.status(404).json({ message: 'Feature request not found' });

    const comment = await Comment.create({
      content,
      featureRequest: featureId,
      author: req.user.id,
      parentComment: parentComment || null
    });

    await FeatureRequest.findByIdAndUpdate(featureId, { $inc: { commentCount: 1 } });

    const populatedComment = await comment.populate('author', 'name');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommentsByFeature = async (req, res) => {
  try {
    const comments = await Comment.find({ featureRequest: req.params.featureId })
      .populate('author', 'name')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = req.body.content;
    await comment.save();
    const populated = await comment.populate('author', 'name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    await FeatureRequest.findByIdAndUpdate(comment.featureRequest, { $inc: { commentCount: -1 } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};