const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamNumber: { type: Number, unique: true, required: true },
  teamCredential: { type: String, unique: true, required: true }, // unique login code
  isActive: { type: Boolean, default: false },
  budget: { type: Number, default: 20000 },
  members: [{ type: String }],
});

// This explicitly tells Mongoose to name the collection 'teamData'
module.exports = mongoose.model('Team', teamSchema, 'teamData');