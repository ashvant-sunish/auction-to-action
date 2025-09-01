require('dotenv').config({ path: './.env' }); // Corrected path
const mongoose = require('mongoose');
const Team = require('../models/Team');

async function createTeams() {
  try {
    // Check if the URI is loaded
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Check your .env file and path.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB...");

    await Team.deleteMany({});
    console.log("🔥 Cleared existing teams.");

    const teamsToCreate = [];
    for (let i = 1; i <= 65; i++) {
      const credential = `REG${String(i).padStart(3, '0')}`;
      teamsToCreate.push({
        teamNumber: i,
        teamCredential: credential,
        budget: 20000
      });
    }

    await Team.insertMany(teamsToCreate);
    console.log("✅ 65 teams have been created!");

    console.log("\n--- Generated Team Credentials ---");
    teamsToCreate.forEach(team => {
      console.log(`Team Number: ${team.teamNumber}, Credential: ${team.teamCredential}`);
    });

  } catch (err) {
    console.error("❌ An error occurred:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed.");
  }
}

createTeams();