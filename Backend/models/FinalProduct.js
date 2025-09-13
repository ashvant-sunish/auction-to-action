// models/FinalProduct.js
const mongoose = require('mongoose');

const finalProductSchema = new mongoose.Schema({
  // e.g., "ENT01", "PROD01"
  productId: { type: String, required: true, unique: true }, 
  
  // "Enterprise" or "Product"
  type: { type: String, required: true, enum: ['Enterprise', 'Product'] }, 
  name: { type: String, required: true },
  reward: { type: Number, required: true }, // The amount credited to the team
  
  // The resources needed to build it
  requirements: {
    type: Map,
    of: Number,
    required: true
  },
  
  // If it's a sub-product, this links to the parent enterprise ID
  parentEnterpriseId: { type: String } 
});

module.exports = mongoose.model('FinalProduct', finalProductSchema);