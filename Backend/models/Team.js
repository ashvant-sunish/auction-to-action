const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  // Custom, human-readable code like "TEAM01"
  teamCode: { 
    type: String, 
    unique: true, 
    required: true, 
    trim: true 
  },
  teamName: { 
    type: String, 
    required: true 
  },
  // The password will always be stored as a secure hash
  password: { 
    type: String, 
    required: true 
  },
  
  // Financials
  credit: { 
    type: Number, 
    default: 20000 
  },
  debit: { 
    type: Number, 
    default: 0 
  },
  
  // This stores the unique codes of the BIDs the team has won (e.g., "r1i001")
  inventory: [{ 
    type: String 
  }], 
  
  // This tracks the actual raw resources gained from their inventory items
  resources: {
    type: Map,
    of: Number,
    default: {}
  },

  // --- NEW FIELD ---
  isActive: {
    type: Boolean,
    default: false   // Team starts as inactive until login
  }

}, {
  // Options to enable virtuals (like 'balance') in the JSON output
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

// A "virtual" property that is calculated on the fly and not stored in the database.
teamSchema.virtual('balance').get(function() {
  return this.credit - this.debit;
});

module.exports = mongoose.model('Team', teamSchema);
