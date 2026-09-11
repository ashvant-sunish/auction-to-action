// seed/seedAll.js

//MONGO-DB OVER DEFAULT DNS
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['1.1.1.1', '8.8.8.8']);
//FIXED for now

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const GameItem = require('../models/GameItem');
const FinalProduct = require('../models/FinalProduct');
const Team = require('../models/Team');

// Import Data
const round1BidsData = require('./round1BidsData');
const cardsData = require('../../auction-to-action/src/assets/cards-data.json');
const productsData = require('../../auction-to-action/src/assets/products-data.json');

function parseRequirements(reqArray) {
  const reqObj = {};
  if (!reqArray) return reqObj;
  for (const req of reqArray) {
    const match = req.match(/(.+?)\s*\((\d+)\)/);
    if (match) {
      reqObj[match[1].trim()] = Number(match[2]);
    }
  }
  return reqObj;
}

const finalProductsData = [
  ...cardsData.map(c => ({
    productId: `ENT${String(c.id).padStart(2, '0')}`,
    type: 'Enterprise',
    name: c.title,
    reward: Number(c.worth),
    requirements: parseRequirements(c.requirements)
  })),
  ...productsData.map(p => ({
    productId: `PROD${String(p.id).padStart(2, '0')}`,
    type: 'Product',
    name: p.title,
    reward: Number(p.worth),
    requirements: parseRequirements(p.requirements),
    parentEnterpriseId: p.requiredEnterpriseId ? `ENT${String(p.requiredEnterpriseId).padStart(2, '0')}` : null
  }))
];

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

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

seedDatabase();