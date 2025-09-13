// models/GameState.js
const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  // There should only ever be one document in this collection
  singleton: { type: String, default: 'main', unique: true }, 
  currentRound: { type: Number, default: 1 },
  isAuctionLive: { type: Boolean, default: false },
  currentItemUpForBidding: {                  // Stores information about the item currently up for bidding
                                              // This object contains key details of the item for frontend display
    itemCode: String,
    name: String,
    description: String,
    basePrice: Number,
    round: Number
  },
  liveMessage: { type: String, default: 'Auction has not started.' }          // Optional message for frontend/live feed updates (e.g., auction notifications)
});

module.exports = mongoose.model('GameState', gameStateSchema);
