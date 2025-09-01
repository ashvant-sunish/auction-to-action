const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamNumber: { type: Number, unique: true, required: true },
  teamCredential: { type: String, unique: true, required: true },
  isActive: { type: Boolean, default: false },
  budget: { type: Number, default: 20000 },
  inventory: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item' 
  }],
  resources: {
    type: Map,
    of: Number,
    default: {}
  }
});

module.exports = mongoose.model('Team', teamSchema, 'teamData');