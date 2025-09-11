// models/GameItem.js

const mongoose = require('mongoose');

const gameItemSchema = new mongoose.Schema({
  // Custom unique ID like "r1i001" or "r2i043"
  itemCode: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  
  // Display name like "BID 1" or "Mystery Box"
  name: { 
    type: String, 
    required: true 
  },
  
  round: {         // Indicates which round this item belongs to (1 or 2)
    type: Number, 
    enum: [1, 2], 
    required: true 
  },
  
  description: { 
    type: String 
  },
  
  basePrice: {       // Base price or starting bid for the item
    type: Number, 
    required: true 
  },
  
  // A map of the resources this item contains, e.g., { "Technology": 5, "Property": 3 }
  resources: { 
    type: Map, 
    of: Number 
  },
  
  // A flag to track if the item has been auctioned and won
  isBidOn: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('GameItem', gameItemSchema);
