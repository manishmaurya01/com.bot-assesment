const mongoose = require('mongoose');

const featureRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['UI/UX', 'Integrations', 'Performance', 'General']
    },
    status: {
      type: String,
      enum: ['Under Review', 'Planned', 'In Progress', 'Completed'],
      default: 'Under Review'
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Indexes for fast searching and sorting
featureRequestSchema.index({ title: 'text', description: 'text' });
featureRequestSchema.index({ status: 1 });
featureRequestSchema.index({ category: 1 });

module.exports = mongoose.model('FeatureRequest', featureRequestSchema);