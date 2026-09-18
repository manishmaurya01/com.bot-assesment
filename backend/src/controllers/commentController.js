const Comment = require('../models/Comment');
const FeatureRequest = require('../models/FeatureRequest');

exports.addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const featureId = req.params.featureId;

    const comment = await Comment.create({
      content,
      featureRequest: featureId,
      author: req.user.id,
      parentComment: parentComment || null
    });

    // Increment comment count on feature request
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