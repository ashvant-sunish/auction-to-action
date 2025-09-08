const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  roundStatus: {
    type: String,
    enum: ['not_started', 'ongoing', 'ended'],
    default: 'not_started'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Round', roundSchema);
