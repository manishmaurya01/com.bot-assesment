const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      author: req.user.id
    });
    const populated = await project.populate('author', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('author', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
