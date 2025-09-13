// models/Team.js

const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamCode: { type: String, unique: true, required: true, trim: true }, // e.g., "TEAM01", "TEAM65"
  teamName: { type: String, required: true },
  password: { type: String, required: true }, // Should always be a hash
  
  credit: { type: Number, default: 20000 },
  debit: { type: Number, default: 0 },
  
  // This will store the unique codes of the BIDs won, like "r1i001"
  inventory: [{ type: String }], 
  
  // This tracks the actual resources gained from the inventory items
  resources: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

// A virtual 'balance' property, calculated on the fly
teamSchema.virtual('balance').get(function() {
  return this.credit - this.debit;
});

module.exports = mongoose.model('Team', teamSchema);