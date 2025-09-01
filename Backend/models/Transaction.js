const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team", // This is the corrected line
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  // 'price' is good, but 'amount' is more generic for trades
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Bid', 'Trade', 'ManualAdjustment'],
    required: true
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