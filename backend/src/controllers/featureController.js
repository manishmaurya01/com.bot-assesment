const FeatureRequest = require('../models/FeatureRequest');

exports.createFeature = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const feature = await FeatureRequest.create({
      title,
      description,
      category,
      author: req.user.id
    });
    res.status(201).json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeatures = async (req, res) => {
  try {
    const { search, category, status, sortBy } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'upvotes') sortOption = { upvoteCount: -1 };
    if (sortBy === 'comments') sortOption = { commentCount: -1 };

    const features = await FeatureRequest.find(query)
      .populate('author', 'name')
      .sort(sortOption);

    res.json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeatureById = async (req, res) => {
  try {
    const feature = await FeatureRequest.findById(req.params.id).populate('author', 'name');
    if (!feature) return res.status(404).json({ message: 'Feature not found' });
    res.json(feature);
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

    const hasUpvoted = feature.upvotes.includes(userId);

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

    res.json({ upvoteCount: updatedFeature.upvoteCount, isUpvoted: !hasUpvoted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const features = await FeatureRequest.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};