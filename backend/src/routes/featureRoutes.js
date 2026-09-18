const express = require('express');
const router = express.Router();
const { createFeature } = require('../controllers/featureController');
const { protect } = require('../middlewares/authMiddleware');
const { featureValidation } = require('../middlewares/validateMiddleware');

router.post('/', protect, featureValidation.create, createFeature);

module.exports = router;