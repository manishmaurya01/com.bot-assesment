const FeatureRequest = require('../models/FeatureRequest');
const Comment = require('../models/Comment');

exports.createFeature = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const feature = await FeatureRequest.create({
      title,
      description,
      category,
      author: req.user.id
    });
    const populated = await feature.populate('author', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeatures = async (req, res) => {
  try {
    const { search, category, status, sortBy } = req.query;
    let query = {};

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 }; // default newest
    if (sortBy === 'upvotes') sortOption = { upvoteCount: -1 };
    if (sortBy === 'comments') sortOption = { commentCount: -1 };
    if (sortBy === 'oldest') sortOption = { createdAt: 1 };
    if (sortBy === 'newest') sortOption = { createdAt: -1 };

    const features = await FeatureRequest.find(query)
      .populate('author', 'name email')
      .sort(sortOption);

    res.json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeatureById = async (req, res) => {
  try {
    const feature = await FeatureRequest.findById(req.params.id).populate('author', 'name email');
    if (!feature) return res.status(404).json({ message: 'Feature request not found' });
    res.json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFeature = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const feature = await FeatureRequest.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({ message: 'Feature request not found' });
    }

    // Only the author or an admin can edit
    if (feature.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this feature request' });
    }

    if (title) feature.title = title;
    if (description) feature.description = description;
    if (category) feature.category = category;

    await feature.save();
    const updated = await feature.populate('author', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFeature = async (req, res) => {
  try {
    const feature = await FeatureRequest.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({ message: 'Feature request not found' });
    }

    // Only the author or an admin can delete
    if (feature.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feature request' });
    }

    // Delete associated comments
    await Comment.deleteMany({ featureRequest: feature._id });
    await FeatureRequest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Feature request and associated comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleUpvote = async (req, res) => {
  try {
    const userId = req.user.id;
    const featureId = req.params.id;

    const feature = await FeatureRequest.findById(featureId);
    if (!feature) return res.status(404).json({ message: 'Feature request not found' });

    const hasUpvoted = feature.upvotes.some((id) => id.toString() === userId.toString());

    let updatedFeature;
    if (hasUpvoted) {
      // Atomic Remove Upvote
      updatedFeature = await FeatureRequest.findByIdAndUpdate(
        featureId,
        { $pull: { upvotes: userId }, $inc: { upvoteCount: -1 } },
        { new: true }
      );
    } else {
      // Atomic Add Upvote
      updatedFeature = await FeatureRequest.findByIdAndUpdate(
        featureId,
        { $addToSet: { upvotes: userId }, $inc: { upvoteCount: 1 } },
        { new: true }
      );
    }

    res.json({
      upvoteCount: Math.max(0, updatedFeature.upvoteCount),
      isUpvoted: !hasUpvoted,
      upvotes: updatedFeature.upvotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const features = await FeatureRequest.find({ author: req.user.id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};