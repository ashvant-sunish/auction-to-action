// models/TradeHistory.js

const mongoose = require('mongoose');

const tradeHistorySchema = new mongoose.Schema({
  tradeId: { type: String, required: true, unique: true },
  teamOne: {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamName: { type: String, required: true },
    teamCode: { type: String, required: true }
  },
  teamTwo: {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamName: { type: String, required: true },
    teamCode: { type: String, required: true }
  },
  tradeDetails: {
    teamOneGives: {
      items: [{ 
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 }
      }],
      money: { type: Number, default: 0 }
    },
    teamTwoGives: {
      items: [{ 
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 }
      }],
      money: { type: Number, default: 0 }
    }
  },
  roundNumber: { type: Number, default: 3 },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'completed' 
  },
  executedBy: { type: String } // Admin who executed the trade
}, {
  timestamps: true
});

module.exports = mongoose.model('TradeHistory', tradeHistorySchema);