const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return this.authProvider === 'local'; }
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },


  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to calculate level based on XP
userSchema.pre('save', function() {
  if (this.isModified('xp')) {
    // Level = floor(XP / 100) + 1
    this.level = Math.floor(this.xp / 100) + 1;
  }
});

// Virtual for Tier Ranking
userSchema.virtual('tier').get(function() {
  if (this.level >= 51) return 'Diamond';
  if (this.level >= 31) return 'Platinum';
  if (this.level >= 16) return 'Gold';
  if (this.level >= 6) return 'Silver';
  return 'Bronze';
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
