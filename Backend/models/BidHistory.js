// models/BidHistory.js

const mongoose = require('mongoose');

const bidHistorySchema = new mongoose.Schema({
  round: { type: Number, enum: [1, 2], required: true },
  itemCode: { type: String, required: true },
  itemName: { type: String, required: true },
  teamCode: { type: String, required: true },
  teamName: { type: String, required: true },
  bidAmount: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('BidHistory', bidHistorySchema);