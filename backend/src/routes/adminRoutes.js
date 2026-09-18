const express = require('express');
const router = express.Router();
const { updateFeatureStatus, deleteFeature, deleteComment, getAllFeatures, getAllUsers, getStats } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/features', getAllFeatures);
router.get('/users', getAllUsers);
router.patch('/features/:id/status', updateFeatureStatus);
router.delete('/features/:id', deleteFeature);
router.delete('/comments/:id', deleteComment);

module.exports = router;