const FeatureRequest = require('../models/FeatureRequest');
const Comment = require('../models/Comment');

exports.updateFeatureStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Under Review', 'Planned', 'In Progress', 'Completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    const feature = await FeatureRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!feature) return res.status(404).json({ message: 'Feature not found' });
    res.json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Decrement count
    await FeatureRequest.findByIdAndUpdate(comment.featureRequest, { $inc: { commentCount: -1 } });
    res.json({ message: 'Comment moderated/deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};