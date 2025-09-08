require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./team.model');

// Connect to DB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

// 📌 Create a new team
async function createTeam(teamNumber, teamCredential, budget = 0) {
  await connectDB();
  const team = new Team({ teamNumber, teamCredential, budget, isActive: false });
  await team.save();
  console.log(`✅ Team ${teamNumber} created successfully!`);
}

// 📌 Read (get) all teams
async function getAllTeams() {
  await connectDB();
  const teams = await Team.find({});
  console.log("📋 All Teams:", teams);
  return teams;
}

// 📌 Update a team (budget, items, isActive, etc.)
async function updateTeam(teamNumber, updates) {
  await connectDB();
  const updated = await Team.findOneAndUpdate({ teamNumber }, updates, { new: true });
  console.log(`✏️ Team ${teamNumber} updated:`, updated);
  return updated;
}

// 📌 Delete a team
async function deleteTeam(teamNumber) {
  await connectDB();
  await Team.deleteOne({ teamNumber });
  console.log(`🗑️ Team ${teamNumber} deleted successfully!`);
}

// Export functions
module.exports = { createTeam, getAllTeams, updateTeam, deleteTeam };
