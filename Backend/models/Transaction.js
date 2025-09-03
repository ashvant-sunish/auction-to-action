const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  amount: {
    type: Number,
    required: true,
  },
  round: {
    type: Number,
    enum: [1, 2, 3],
    required: true,
  },
  type: {
    type: String,
    enum: ['Bid', 'Trade', 'ManualAdjustment'],
    required: true
  },
  // --- NEW: To group the two transactions that make up a single trade ---
  tradeId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  notes: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);