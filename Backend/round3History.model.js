const mongoose = require('mongoose');

const round3HistorySchema = new mongoose.Schema({
  fromTeam: { type: Number, required: true },
  toTeam: { type: Number, required: true },
  items: { type: [String], required: true }, // list of traded items
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Round3History = mongoose.model('Round3History', round3HistorySchema, 'round3History');

module.exports = Round3History;
