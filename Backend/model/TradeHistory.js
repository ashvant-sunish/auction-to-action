// models/TradeHistory.js

const mongoose = require('mongoose');

const tradeHistorySchema = new mongoose.Schema({
  teamOne: {
    name: { type: String, required: true },
    code: { type: String, required: true }
  },
  teamTwo: {
    name: { type: String, required: true },
    code: { type: String, required: true }
  },
  tradeDetails: {
    teamOneGivesItems: [{ type: String }], // Array of resource names
    teamOneGivesMoney: { type: Number, default: 0 },
    teamTwoGivesItems: [{ type: String }], // Array of resource names
    teamTwoGivesMoney: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TradeHistory', tradeHistorySchema);