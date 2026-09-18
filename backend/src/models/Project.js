const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text' });

module.exports = mongoose.model('Project', projectSchema);
