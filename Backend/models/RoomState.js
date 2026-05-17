const mongoose = require('mongoose');

const roomStateSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  participants: {
    type: Array,
    default: []
  },
  notes: {
    type: String,
    default: ''
  },
  whiteboard: {
    type: Array,
    default: []
  },
  chat: {
    type: Array,
    default: []
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Update lastActive automatically
roomStateSchema.pre('save', async function() {
  this.lastActive = Date.now();
});

module.exports = mongoose.model('RoomState', roomStateSchema);
