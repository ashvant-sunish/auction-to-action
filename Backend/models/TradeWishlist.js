// models/TradeWishlist.js

const mongoose = require('mongoose');

const tradeWishlistSchema = new mongoose.Schema({
  teamCode: { type: String, required: true },
  teamName: { type: String, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  round: { type: Number, default: 3 },
  itemsToTrade: [{
    name: { type: String, required: true },
    count: { type: Number, required: true, min: 1 }
  }],
  totalItems: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'tradelistings' // Use the existing tradelistings collection
});

// Index for faster queries
tradeWishlistSchema.index({ teamCode: 1, round: 1 });
tradeWishlistSchema.index({ status: 1 });

module.exports = mongoose.model('TradeWishlist', tradeWishlistSchema);