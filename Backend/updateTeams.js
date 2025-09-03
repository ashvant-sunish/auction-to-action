require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./team.model');

async function updateTeams() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Update all teams: add credit, debit, and items if not present
    const result = await Team.updateMany(
      {},
      {
        $set: { credit: 0, debit: 0, items: [] }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} teams with new fields.`);
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error updating teams:", err);
  }
}

updateTeams();
