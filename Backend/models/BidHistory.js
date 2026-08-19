// models/BidHistory.js

const mongoose = require('mongoose');

const bidHistorySchema = new mongoose.Schema({
  round: { type: Number, enum: [1, 2], required: true },
  
  // Round 1 fields
  itemCode: { type: String }, // Optional for Round 2
  itemName: { type: String }, // Optional for Round 2
  
  // Common fields
  teamCode: { type: String, required: true },
  teamName: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  
  // Round 2 mystery box fields
  mysteryBoxReward: { type: String }, // Description of the reward
  rewardType: { type: String, enum: ['cash', 'resources', 'challenge', 'nothing'] },
  deductionAmount: { type: Number, default: 0 }, // Amount deducted from team
  cashReward: { type: Number, default: 0 }, // Cash amount gained
  cashMultiplier: { type: Number, default: 1 }, // Multiplier for cash rewards
  resourcesGained: { type: Map, of: Number, default: {} }, // Resources gained
  balanceAfter: { type: Number }, // Team balance after transaction
  tradeType: { type: String, default: 'bid' } // Type of transaction
}, {
  timestamps: true
});

module.exports = mongoose.model('BidHistory', bidHistorySchema);