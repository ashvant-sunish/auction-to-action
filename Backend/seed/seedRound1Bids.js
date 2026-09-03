// seed/seedRound1Bids.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Round1Bids = require('../models/Round1Bids');

const seedRound1BidsData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    
    `);

  } catch (error) {
    console.error('❌ Error seeding Round 1 Bids:', error);
  } finally {
    await mongoose.connection.close();
    