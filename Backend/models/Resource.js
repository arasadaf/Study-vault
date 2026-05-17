const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  upvotes: {
    type: [String],
    default: []
  },
  downvotes: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for calculating the score
resourceSchema.virtual('score').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Ensure virtuals are included in JSON
resourceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Resource', resourceSchema);
