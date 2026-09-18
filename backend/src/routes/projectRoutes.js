const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.post('/', protect, createProject);

module.exports = router;
