const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamNumber: { type: Number, unique: true, required: true },
  teamCredential: { type: String, unique: true, required: true },
  isActive: { type: Boolean, default: false },

  // --- MODIFIED: Replaced 'budget' with credit/debit system ---
  credit: { type: Number, default: 20000 },
  debit: { type: Number, default: 0 },

  inventory: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item' 
  }],
  resources: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  // Options to enable virtuals in JSON output
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- NEW: A virtual 'balance' property for easy calculations ---
// This is not stored in the database but calculated on the fly.
teamSchema.virtual('balance').get(function() {
  return this.credit - this.debit;
});

module.exports = mongoose.model('Team', teamSchema, 'teamData');