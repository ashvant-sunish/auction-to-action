const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamNumber: { type: String, unique: true, required: true }, 
  teamCredential: { type: String, unique: true, required: true },
  isActive: { type: Boolean, default: false },

  // 🔹 Round 3 fields
  credit: { type: Number, default: 0 }, // money earned / gained
  debit: { type: Number, default: 0 },  // money spent
  items: { type: [String], default: [] } // list of items the team owns
});

const Team = mongoose.model('TeamData', teamSchema, 'teamData'); 
// 👆 model name = TeamData, collection = teamData

module.exports = Team;
