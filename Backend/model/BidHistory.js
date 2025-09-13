// models/BidHistory.js
// Define schema for storing bid history
const mongoose = require('mongoose');

const bidHistorySchema = new mongoose.Schema({
  // The auction round in which this bid was made (Round 1 or Round 2)
  round: { type: Number, enum: [1, 2], required: true },
  itemCode: { type: String, required: true },    // Unique code of the item being bid on (e.g., "r1i001")
  itemName: { type: String, required: true },     // Display name of the item (e.g., "BID 1")
  teamCode: { type: String, required: true },      // Code of the team who placed the bid (e.g., "TEAM01")
  teamName: { type: String, required: true },       // Name of the team who placed the bid (e.g., "Team 1")
  bidAmount: { type: Number, required: true }     // The amount of money the team bid for this item
}, {
  timestamps: true
});
// Export the BidHistory model to use in controllers and routes
module.exports = mongoose.model('BidHistory', bidHistorySchema);
