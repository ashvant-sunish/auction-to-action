const mongoose = require('mongoose');

const mysteryBoxRevealSchema = new mongoose.Schema({
  // Round information
  round: {
    type: Number,
    required: true,
    default: 2
  },
  
  // Box details
  boxId: {
    type: Number,
    required: true,
    min: 1,
    max: 25
  },
  
  // Box content
  itemName: {
    type: String,
    required: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  itemType: {
    type: String,
    enum: ['cash', 'nothing', 'resources', 'challenge'],
    required: true
  },
  
  // Admin who revealed it
  revealedBy: {
    type: String,
    required: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Reveal timestamp
  revealedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
mysteryBoxRevealSchema.index({ round: 1, revealedAt: -1 });
mysteryBoxRevealSchema.index({ boxId: 1, isActive: 1 });
mysteryBoxRevealSchema.index({ revealedAt: -1 });

// Static method to get latest revealed box for a round
mysteryBoxRevealSchema.statics.getLatestRevealedBox = function(round = 2) {
  return this.findOne({ 
    round, 
    isActive: true 
  }).sort({ revealedAt: -1 });
};

// Static method to get all revealed boxes for a round
mysteryBoxRevealSchema.statics.getAllRevealedBoxes = function(round = 2) {
  return this.find({ 
    round, 
    isActive: true 
  }).sort({ revealedAt: -1 });
};

// Static method to get revealed count for a round
mysteryBoxRevealSchema.statics.getRevealedCount = function(round = 2) {
  return this.countDocuments({ 
    round, 
    isActive: true 
  });
};

module.exports = mongoose.model('MysteryBoxReveal', mysteryBoxRevealSchema);