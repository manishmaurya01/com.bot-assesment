const express = require('express');
const router = express.Router();
const {
  createFeature,
  getFeatures,
  getFeatureById,
  updateFeature,
  deleteFeature,
  toggleUpvote,
  getMyRequests
} = require('../controllers/featureController');
const { protect } = require('../middlewares/authMiddleware');
const { featureValidation } = require('../middlewares/validateMiddleware');

// Protected route to view all features with search/filters
router.get('/', protect, getFeatures);

// Protected route to view user's own requests
router.get('/my-requests', protect, getMyRequests);

// Protected route to view single feature details
router.get('/:id', protect, getFeatureById);

// Protected routes to create, update, delete, and upvote
router.post('/', protect, featureValidation.create, createFeature);
router.put('/:id', protect, featureValidation.update, updateFeature);
router.delete('/:id', protect, deleteFeature);
router.post('/:id/upvote', protect, toggleUpvote);

module.exports = router;