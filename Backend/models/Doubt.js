const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: true
  },
  answeredBy: {
    type: String,
    required: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const doubtSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  askedBy: {
    type: String,
    required: true
  },
  bountyPoints: {
    type: Number,
    default: 0
  },
  answers: {
    type: [answerSchema],
    default: []
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doubt', doubtSchema);
