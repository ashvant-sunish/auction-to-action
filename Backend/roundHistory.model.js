const mongoose = require('mongoose');

const roundHistorySchema = new mongoose.Schema({
  teamNumber: { type: Number, required: true },
  round: { type: Number, enum: [1, 2], required: true },
  action: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const RoundHistory = mongoose.model('RoundHistory', roundHistorySchema, 'roundHistory');

module.exports = RoundHistory;
