const mongoose = require('mongoose');

const wheelSelectionSchema = new mongoose.Schema({
  // Round information
  round: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Selection event details
  eventType: {
    type: String,
    enum: ['RANDOM_SELECTED', 'CONFIRMED_REMOVED', 'SKIPPED'],
    required: true
  },
  
  // Item details
  itemDetails: {
    itemId: { type: String, required: true },
    itemCode: { type: String, required: true },
    bidNumber: { type: String, required: true },
    title: { type: String, required: true },
    basePrice: { type: Number },
    resources: { type: Object },
    image: { type: String },
    teamName: { type: String },
    teamCode: { type: String },
    bidAmount: { type: Number }
  },
  
  // Current wheel state
  wheelState: {
    availableItemsCount: { type: Number, required: true },
    selectedItemsCount: { type: Number, required: true },
    currentlySelectedItem: { type: Object, default: null }
  },
  
  // Admin who performed the action
  adminId: {
    type: String,
    required: true
  },
  
  // Real-time status
  isLive: {
    type: Boolean,
    default: true
  },
  
  // Additional metadata
  sessionId: { type: String },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
wheelSelectionSchema.index({ round: 1, eventType: 1, timestamp: -1 });
wheelSelectionSchema.index({ round: 1, isLive: 1 });
wheelSelectionSchema.index({ 'itemDetails.itemCode': 1 });

// Static method to get latest selection for a round
wheelSelectionSchema.statics.getLatestSelection = function(round) {
  return this.findOne({ 
    round, 
    eventType: 'RANDOM_SELECTED',
    isLive: true 
  }).sort({ timestamp: -1 });
};

// Static method to get wheel state for a round
wheelSelectionSchema.statics.getWheelState = function(round) {
  return this.findOne({ round }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('WheelSelection', wheelSelectionSchema);