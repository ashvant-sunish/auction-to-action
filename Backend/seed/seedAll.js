// seed/seedAll.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const GameItem = require('../models/GameItem');
const FinalProduct = require('../models/FinalProduct');
const Team = require('../models/Team');

// Import Data
const round1BidsData = require('./round1BidsData');
const finalProductsData = require('./enterprisesAndProductsData');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding...');

    // --- Seed Game Items (Replaces seedItems.js) ---
    await GameItem.deleteMany({});
    await GameItem.insertMany(round1BidsData);
    console.log(`🌱 Seeded ${round1BidsData.length} items for Round 1.`);

    // --- Seed Final Products ---
    await FinalProduct.deleteMany({});
    await FinalProduct.insertMany(finalProductsData);
    console.log(`🌱 Seeded ${finalProductsData.length} final enterprises and products.`);
    
    // --- Seed Teams (Replaces creatEventTeam.js) ---
    await Team.deleteMany({});
    const teamsToCreate = [];
    const numberOfTeams = 65; // Set how many teams you want to create

    for (let i = 1; i <= numberOfTeams; i++) {
      // Example: Password will be "team_pass_1", "team_pass_2", etc.
      const rawPassword = `team_pass_${i}`; 
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      
      teamsToCreate.push({
        teamCode: `TEAM${String(i).padStart(2, '0')}`,
        teamName: `Team ${i}`,
        password: hashedPassword,
        credit: 20000 // Initial starting balance
      });
    }
    await Team.insertMany(teamsToCreate);
    console.log(`🌱 Seeded ${teamsToCreate.length} teams.`);

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

seedDatabase();