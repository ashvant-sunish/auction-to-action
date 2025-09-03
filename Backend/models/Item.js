const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['ResourceBundle', 'MysteryBox', 'Special'], 
    required: true 
  },
  basePrice: { type: Number, required: true },
  // --- NEW: Field to store the winning bid amount ---
  highestBidAmount: { type: Number, default: 0 },
  resources: { type: Map, of: Number }
});

module.exports = mongoose.model('Item', itemSchema);