const FeatureRequest = require('../models/FeatureRequest');
const Comment = require('../models/Comment');
const User = require('../models/User');

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
    ).populate('author', 'name');

    if (!feature) return res.status(404).json({ message: 'Feature not found' });
    res.json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFeature = async (req, res) => {
  try {
    const feature = await FeatureRequest.findById(req.params.id);
    if (!feature) return res.status(404).json({ message: 'Feature not found' });

    await Comment.deleteMany({ featureRequest: feature._id });
    await FeatureRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feature and associated comments deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await FeatureRequest.findByIdAndUpdate(comment.featureRequest, { $inc: { commentCount: -1 } });
    res.json({ message: 'Comment moderated/deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllFeatures = async (req, res) => {
  try {
    const features = await FeatureRequest.find()
      .populate('author', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role isVerified createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalFeatures = await FeatureRequest.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();
    const statusCounts = await FeatureRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ totalFeatures, totalUsers, totalComments, statusCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};