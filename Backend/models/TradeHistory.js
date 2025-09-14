// models/TradeHistory.js

const mongoose = require('mongoose');

const tradeHistorySchema = new mongoose.Schema({
  tradeId: { type: String, required: true, unique: true },
  round: { type: Number, default: 3 }, // Round number
  
  teamOne: {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamName: { type: String, required: true },
    teamCode: { type: String, required: true },
    teamNumber: { type: String } // Flexible team identifier
  },
  teamTwo: {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamName: { type: String, required: true },
    teamCode: { type: String, required: true },
    teamNumber: { type: String } // Flexible team identifier
  },
  
  // Flexible trade structure
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
  },
  
  // Mystery box specific data (for Round 2)
  mysteryBoxData: {
    reward: { type: String }, // Reward description
    rewardType: { type: String }, // cash, resources, challenge, nothing
    cashMultiplier: { type: Number, default: 1 },
    resourcesGained: { type: Map, of: Number, default: {} }
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'completed' 
  },
  executedBy: { type: String }, // Admin who executed the trade
  executedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('TradeHistory', tradeHistorySchema);