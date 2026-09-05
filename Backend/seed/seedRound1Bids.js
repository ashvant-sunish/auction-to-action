// seed/seedRound1Bids.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Round1Bids = require('../models/Round1Bids');

const seedRound1BidsData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for Round 1 Bids seeding...');

    // Delete existing Round1Bids data
    await Round1Bids.deleteMany({});

    // Create the Round1Bids document with proper structure
    const round1BidsData = {
      _id: 'round1',
      item_list: [
        {
          itemCode: 'r1i001',
          name: 'BID 1',
          bidNumber: 1,
          basePrice: 9500,
          resources: { 'Technology': 6, 'Property': 5 },
          image: '/src/assets/images/Frame 1.png'
        },
        {
          itemCode: 'r1i002',
          name: 'BID 2',
          bidNumber: 2,
          basePrice: 9000,
          resources: { 'Technology': 7 },
          image: '/src/assets/images/Frame 2.png'
        },
        {
          itemCode: 'r1i003',
          name: 'BID 3',
          bidNumber: 3,
          basePrice: 8000,
          resources: { 'Property': 3, 'Technology': 6 },
          image: '/src/assets/images/Frame 3.png'
        },
        {
          itemCode: 'r1i004',
          name: 'BID 4',
          bidNumber: 4,
          basePrice: 8000,
          resources: { 'Property': 5, 'Technology': 4 },
          image: '/src/assets/images/Frame 4.png'
        },
        {
          itemCode: 'r1i005',
          name: 'BID 5',
          bidNumber: 5,
          basePrice: 8000,
          resources: { 'Property': 5, 'Technology': 5 },
          image: '/src/assets/images/Frame 5.png'
        },
        {
          itemCode: 'r1i006',
          name: 'BID 6',
          bidNumber: 6,
          basePrice: 8000,
          resources: { 'Property': 5, 'Technology': 4, 'Electricity Supply': 4 },
          image: '/src/assets/images/Frame 6.png'
        },
        {
          itemCode: 'r1i007',
          name: 'BID 7',
          bidNumber: 7,
          basePrice: 7500,
          resources: { 'Technology': 4, 'Property': 5 },
          image: '/src/assets/images/Frame 7.png'
        },
        {
          itemCode: 'r1i008',
          name: 'BID 8',
          bidNumber: 8,
          basePrice: 7500,
          resources: { 'Technology': 6, 'Skilled Labour': 3 },
          image: '/src/assets/images/Frame 8.png'
        },
        {
          itemCode: 'r1i009',
          name: 'BID 9',
          bidNumber: 9,
          basePrice: 7500,
          resources: { 'Property': 5, 'Machinery & Tools': 6 },
          image: '/src/assets/images/Frame 9 .png'
        },
        {
          itemCode: 'r1i010',
          name: 'BID 10',
          bidNumber: 10,
          basePrice: 7500,
          resources: { 'Property': 5, 'Machinery & Tools': 5, 'Electricity Supply': 4 },
          image: '/src/assets/images/Frame 10.png'
        },
        {
          itemCode: 'r1i011',
          name: 'BID 11',
          bidNumber: 11,
          basePrice: 7500,
          resources: { 'Property': 4, 'Technology': 4, 'Machinery & Tools': 4 },
          image: '/src/assets/images/Frame 11.png'
        },
        {
          itemCode: 'r1i012',
          name: 'BID 12',
          bidNumber: 12,
          basePrice: 7000,
          resources: { 'Property': 4, 'Technology': 4 },
          image: '/src/assets/images/Frame 12.png'
        },
        {
          itemCode: 'r1i013',
          name: 'BID 13',
          bidNumber: 13,
          basePrice: 7000,
          resources: { 'Property': 4, 'Office Space': 4, 'Technology': 4 },
          image: '/src/assets/images/Frame 13.png'
        },
        {
          itemCode: 'r1i014',
          name: 'BID 14',
          bidNumber: 14,
          basePrice: 7000,
          resources: { 'Property': 5, 'Construction Material': 4, 'Technology': 3 },
          image: '/src/assets/images/Frame 14.png'
        },
        {
          itemCode: 'r1i015',
          name: 'BID 15',
          bidNumber: 15,
          basePrice: 7000,
          resources: { 'Office Space': 4, 'Technology': 6 },
          image: '/src/assets/images/Frame 1.png'
        }
      ],
      item_list_2: [] // Empty initially, will be populated when items are selected
    };

    // Insert the Round1Bids document
    await Round1Bids.create(round1BidsData);
    
    console.log(`🌱 Round 1 Bids collection seeded successfully!`);
    console.log(`📦 Created ${round1BidsData.item_list.length} available items`);
    console.log(`📦 Created empty selected items list (item_list_2)`);

  } catch (error) {
    console.error('❌ Error seeding Round 1 Bids:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

seedRound1BidsData();