require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');

const itemsToCreate = [
    { name: 'BID 1', description: '2x Property, 3x Skilled Labour', type: 'ResourceBundle', basePrice: 5000, resources: { 'Property': 2, 'Skilled Labour': 3 } },
    { name: 'BID 2', description: '1x Property, 2x Machinery & Tools, 1x Utilities', type: 'ResourceBundle', basePrice: 4000, resources: { 'Property': 1, 'Machinery & Tools': 2, 'Utilities': 1 } },
    { name: 'BID 3', description: '3x Technology', type: 'ResourceBundle', basePrice: 5250, resources: { 'Technology': 3 } },
    { name: 'BID 4', description: '2x Property, 2x Construction Material, 1x Skilled Labour', type: 'ResourceBundle', basePrice: 5000, resources: { 'Property': 2, 'Construction Material': 2, 'Skilled Labour': 1 } },
    { name: 'BID 5', description: '3x Machinery & Tools, 2x Skilled Labour', type: 'ResourceBundle', basePrice: 5250, resources: { 'Machinery & Tools': 3, 'Skilled Labour': 2 } },
    { name: 'BID 6', description: '2x Office Space, 3x Skilled Labour', type: 'ResourceBundle', basePrice: 4250, resources: { 'Office Space': 2, 'Skilled Labour': 3 } },
    { name: 'BID 7', description: '1x Technology, 2x Electricity Supply, 2x Skilled Labour', type: 'ResourceBundle', basePrice: 4500, resources: { 'Technology': 1, 'Electricity Supply': 2, 'Skilled Labour': 2 } },
    { name: 'BID 8', description: '3x Property, 2x Technology', type: 'ResourceBundle', basePrice: 8000, resources: { 'Property': 3, 'Technology': 2 } },
    { name: 'BID 9', description: '2x Construction Material, 3x Skilled Labour, 1x Utilities', type: 'ResourceBundle', basePrice: 4250, resources: { 'Construction Material': 2, 'Skilled Labour': 3, 'Utilities': 1 } },
    { name: 'BID 10', description: '1x Property, 1x Electricity Supply, 2x Machinery & Tools', type: 'ResourceBundle', basePrice: 3750, resources: { 'Property': 1, 'Electricity Supply': 1, 'Machinery & Tools': 2 } },
    { name: 'BID 11', description: '2x Property, 2x Technology', type: 'ResourceBundle', basePrice: 6000, resources: { 'Property': 2, 'Technology': 2 } },
    { name: 'BID 12', description: '3x Machinery & Tools, 2x Utilities', type: 'ResourceBundle', basePrice: 4000, resources: { 'Machinery & Tools': 3, 'Utilities': 2 } },
    { name: 'BID 13', description: '2x Property, 3x Office Space', type: 'ResourceBundle', basePrice: 5750, resources: { 'Property': 2, 'Office Space': 3 } },
    { name: 'BID 14', description: '2x Technology, 3x Skilled Labour', type: 'ResourceBundle', basePrice: 5250, resources: { 'Technology': 2, 'Skilled Labour': 3 } },
    { name: 'BID 15', description: '3x Property, 1x Transportation', type: 'ResourceBundle', basePrice: 5500, resources: { 'Property': 3, 'Transportation': 1 } },
    { name: 'BID 16', description: '1x Property, 3x Machinery & Tools, 2x Utilities', type: 'ResourceBundle', basePrice: 4750, resources: { 'Property': 1, 'Machinery & Tools': 3, 'Utilities': 2 } },
    { name: 'BID 17', description: '4x Technology', type: 'ResourceBundle', basePrice: 7000, resources: { 'Technology': 4 } },
    { name: 'BID 18', description: '3x Property, 2x Electricity Supply', type: 'ResourceBundle', basePrice: 6000, resources: { 'Property': 3, 'Electricity Supply': 2 } },
    { name: 'BID 19', description: '3x Machinery & Tools, 3x Construction Material', type: 'ResourceBundle', basePrice: 5000, resources: { 'Machinery & Tools': 3, 'Construction Material': 3 } },
    { name: 'BID 20', description: '2x Property, 3x Transportation', type: 'ResourceBundle', basePrice: 4750, resources: { 'Property': 2, 'Transportation': 3 } },
    { name: 'BID 21', description: '2x Office Space, 4x Skilled Labour', type: 'ResourceBundle', basePrice: 4500, resources: { 'Office Space': 2, 'Skilled Labour': 4 } },
    { name: 'BID 22', description: '3x Property, 2x Construction Material', type: 'ResourceBundle', basePrice: 5250, resources: { 'Property': 3, 'Construction Material': 2 } },
    { name: 'BID 23', description: '1x Technology, 3x Property', type: 'ResourceBundle', basePrice: 6250, resources: { 'Technology': 1, 'Property': 3 } },
    { name: 'BID 24', description: '2x Machinery & Tools, 2x Technology', type: 'ResourceBundle', basePrice: 5750, resources: { 'Machinery & Tools': 2, 'Technology': 2 } },
    { name: 'BID 25', description: '4x Electricity Supply, 2x Skilled Labour', type: 'ResourceBundle', basePrice: 5000, resources: { 'Electricity Supply': 4, 'Skilled Labour': 2 } },
    { name: 'BID 26', description: '3x Property, 2x Office Space', type: 'ResourceBundle', basePrice: 6250, resources: { 'Property': 3, 'Office Space': 2 } },
    { name: 'BID 27', description: '2x Property, 4x Skilled Labour, 2x Utilities', type: 'ResourceBundle', basePrice: 5500, resources: { 'Property': 2, 'Skilled Labour': 4, 'Utilities': 2 } },
    { name: 'BID 28', description: '4x Technology, 1x Skilled Labour', type: 'ResourceBundle', basePrice: 7250, resources: { 'Technology': 4, 'Skilled Labour': 1 } },
    { name: 'BID 29', description: '2x Property, 2x Machinery & Tools, 2x Electricity Supply', type: 'ResourceBundle', basePrice: 5500, resources: { 'Property': 2, 'Machinery & Tools': 2, 'Electricity Supply': 2 } },
    { name: 'BID 30', description: '3x Property, 3x Utilities', type: 'ResourceBundle', basePrice: 5250, resources: { 'Property': 3, 'Utilities': 3 } },
    { name: 'BID 31', description: '4x Machinery & Tools, 1x Technology', type: 'ResourceBundle', basePrice: 6000, resources: { 'Machinery & Tools': 4, 'Technology': 1 } },
    { name: 'BID 32', description: '2x Property, 3x Technology', type: 'ResourceBundle', basePrice: 7000, resources: { 'Property': 2, 'Technology': 3 } },
    { name: 'BID 33', description: '3x Construction Material, 2x Electricity Supply', type: 'ResourceBundle', basePrice: 4250, resources: { 'Construction Material': 3, 'Electricity Supply': 2 } },
    { name: 'BID 34', description: '3x Property, 3x Skilled Labour', type: 'ResourceBundle', basePrice: 5500, resources: { 'Property': 3, 'Skilled Labour': 3 } },
    { name: 'BID 35', description: '1x Property, 4x Technology', type: 'ResourceBundle', basePrice: 8000, resources: { 'Property': 1, 'Technology': 4 } },
    { name: 'BID 36', description: '4x Office Space, 2x Skilled Labour', type: 'ResourceBundle', basePrice: 5000, resources: { 'Office Space': 4, 'Skilled Labour': 2 } },
    { name: 'BID 37', description: '3x Electricity Supply, 3x Skilled Labour', type: 'ResourceBundle', basePrice: 4500, resources: { 'Electricity Supply': 3, 'Skilled Labour': 3 } },
    { name: 'BID 38', description: '2x Property, 2x Office Space, 2x Technology', type: 'ResourceBundle', basePrice: 7000, resources: { 'Property': 2, 'Office Space': 2, 'Technology': 2 } },
    { name: 'BID 39', description: '4x Machinery & Tools, 2x Skilled Labour', type: 'ResourceBundle', basePrice: 5250, resources: { 'Machinery & Tools': 4, 'Skilled Labour': 2 } },
    { name: 'BID 40', description: '3x Property, 2x Construction Material, 1x Technology', type: 'ResourceBundle', basePrice: 7000, resources: { 'Property': 3, 'Construction Material': 2, 'Technology': 1 } },
    { name: 'BID 41', description: '2x Property, 4x Electricity Supply', type: 'ResourceBundle', basePrice: 5500, resources: { 'Property': 2, 'Electricity Supply': 4 } },
    { name: 'BID 42', description: '3x Property, 3x Technology', type: 'ResourceBundle', basePrice: 8000, resources: { 'Property': 3, 'Technology': 3 } },
    { name: 'BID 43', description: '4x Machinery & Tools, 2x Utilities', type: 'ResourceBundle', basePrice: 5000, resources: { 'Machinery & Tools': 4, 'Utilities': 2 } },
    { name: 'BID 44', description: '1x Property, 2x Office Space, 2x Technology', type: 'ResourceBundle', basePrice: 6250, resources: { 'Property': 1, 'Office Space': 2, 'Technology': 2 } },
    { name: 'BID 45', description: '3x Property, 4x Skilled Labour', type: 'ResourceBundle', basePrice: 6000, resources: { 'Property': 3, 'Skilled Labour': 4 } },
    { name: 'BID 46', description: '2x Technology, 2x Machinery & Tools, 1x Electricity Supply', type: 'ResourceBundle', basePrice: 6000, resources: { 'Technology': 2, 'Machinery & Tools': 2, 'Electricity Supply': 1 } },
    { name: 'BID 47', description: '3x Property, 2x Transportation', type: 'ResourceBundle', basePrice: 5250, resources: { 'Property': 3, 'Transportation': 2 } },
    { name: 'BID 48', description: '2x Technology, 2x Office Space', type: 'ResourceBundle', basePrice: 6250, resources: { 'Technology': 2, 'Office Space': 2 } },
    { name: 'BID 49', description: '2x Property, 2x Skilled Labour, 2x Machinery & Tools', type: 'ResourceBundle', basePrice: 5250, resources: { 'Property': 2, 'Skilled Labour': 2, 'Machinery & Tools': 2 } },
    { name: 'BID 50', description: '3x Property, 1x Technology, 2x Utilities', type: 'ResourceBundle', basePrice: 6500, resources: { 'Property': 3, 'Technology': 1, 'Utilities': 2 } },
    { name: 'BID 51', description: '2x Office Space, 3x Technology', type: 'ResourceBundle', basePrice: 7000, resources: { 'Office Space': 2, 'Technology': 3 } },
    { name: 'BID 52', description: '2x Property, 3x Construction Material', type: 'ResourceBundle', basePrice: 4500, resources: { 'Property': 2, 'Construction Material': 3 } },
    { name: 'BID 53', description: '2x Technology, 3x Property', type: 'ResourceBundle', basePrice: 7250, resources: { 'Technology': 2, 'Property': 3 } },
    { name: 'BID 54', description: '1x Property, 2x Skilled Labour, 3x Machinery & Tools', type: 'ResourceBundle', basePrice: 4750, resources: { 'Property': 1, 'Skilled Labour': 2, 'Machinery & Tools': 3 } },
    { name: 'BID 55', description: '4x Electricity Supply, 1x Technology', type: 'ResourceBundle', basePrice: 6250, resources: { 'Electricity Supply': 4, 'Technology': 1 } },
    { name: 'BID 56', description: '2x Property, 3x Utilities, 2x Skilled Labour', type: 'ResourceBundle', basePrice: 4750, resources: { 'Property': 2, 'Utilities': 3, 'Skilled Labour': 2 } },
    { name: 'BID 57', description: '3x Property, 4x Machinery & Tools', type: 'ResourceBundle', basePrice: 7250, resources: { 'Property': 3, 'Machinery & Tools': 4 } },
    { name: 'BID 58', description: '2x Office Space, 4x Machinery & Tools', type: 'ResourceBundle', basePrice: 6250, resources: { 'Office Space': 2, 'Machinery & Tools': 4 } },
    { name: 'BID 59', description: '3x Property, 2x Skilled Labour, 2x Technology', type: 'ResourceBundle', basePrice: 7500, resources: { 'Property': 3, 'Skilled Labour': 2, 'Technology': 2 } },
    { name: 'BID 60', description: '3x Property, 2x Technology, 2x Electricity Supply', type: 'ResourceBundle', basePrice: 8000, resources: { 'Property': 3, 'Technology': 2, 'Electricity Supply': 2 } },
    { name: 'BID 61', description: '2x Property, 2x Transportation, 2x Machinery & Tools', type: 'ResourceBundle', basePrice: 5250, resources: { 'Property': 2, 'Transportation': 2, 'Machinery & Tools': 2 } },
    { name: 'BID 62', description: '1x Property, 3x Office Space, 2x Skilled Labour', type: 'ResourceBundle', basePrice: 4750, resources: { 'Property': 1, 'Office Space': 3, 'Skilled Labour': 2 } },
    { name: 'BID 63', description: '5x Technology', type: 'ResourceBundle', basePrice: 8750, resources: { 'Technology': 5 } },
    { name: 'BID 64', description: '3x Property, 3x Construction Material, 1x Skilled Labour', type: 'ResourceBundle', basePrice: 6000, resources: { 'Property': 3, 'Construction Material': 3, 'Skilled Labour': 1 } },
    { name: 'BID 65', description: '2x Property, 3x Electricity Supply, 2x Skilled Labour', type: 'ResourceBundle', basePrice: 5500, resources: { 'Property': 2, 'Electricity Supply': 3, 'Skilled Labour': 2 } },
    { name: 'BID 66', description: '1x Technology, 4x Machinery & Tools', type: 'ResourceBundle', basePrice: 6000, resources: { 'Technology': 1, 'Machinery & Tools': 4 } },
    { name: 'BID 67', description: '2x Property, 2x Office Space, 3x Skilled Labour', type: 'ResourceBundle', basePrice: 5250, resources: { 'Property': 2, 'Office Space': 2, 'Skilled Labour': 3 } },
    { name: 'BID 68', description: '3x Technology, 2x Utilities', type: 'ResourceBundle', basePrice: 5750, resources: { 'Technology': 3, 'Utilities': 2 } },
    { name: 'BID 69', description: '2x Property, 2x Electricity Supply, 2x Machinery & Tools', type: 'ResourceBundle', basePrice: 5500, resources: { 'Property': 2, 'Electricity Supply': 2, 'Machinery & Tools': 2 } },
    { name: 'BID 70', description: '1x Property, 2x Technology, 3x Electricity Supply', type: 'ResourceBundle', basePrice: 6500, resources: { 'Property': 1, 'Technology': 2, 'Electricity Supply': 3 } },
    { name: 'BID 71', description: '3x Property, 2x Office Space, 1x Technology', type: 'ResourceBundle', basePrice: 7000, resources: { 'Property': 3, 'Office Space': 2, 'Technology': 1 } },
    { name: 'BID 72', description: '2x Construction Material, 4x Skilled Labour, 2x Utilities', type: 'ResourceBundle', basePrice: 4250, resources: { 'Construction Material': 2, 'Skilled Labour': 4, 'Utilities': 2 } },
    { name: 'BID 73', description: '3x Property, 2x Transportation, 1x Technology', type: 'ResourceBundle', basePrice: 7000, resources: { 'Property': 3, 'Transportation': 2, 'Technology': 1 } },
    { name: 'BID 74', description: '1x Property, 3x Technology, 2x Utilities', type: 'ResourceBundle', basePrice: 6750, resources: { 'Property': 1, 'Technology': 3, 'Utilities': 2 } },
    { name: 'BID 75', description: '3x Property, 4x Skilled Labour, 2x Utilities', type: 'ResourceBundle', basePrice: 6000, resources: { 'Property': 3, 'Skilled Labour': 4, 'Utilities': 2 } }
];

async function seedItems() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in your .env file.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB...");

    await Item.deleteMany({});
    console.log("🔥 Cleared existing items.");

    await Item.insertMany(itemsToCreate);
    console.log(`✅ Successfully seeded ${itemsToCreate.length} items!`);

  } catch (err) {
    console.error("❌ An error occurred during seeding:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed.");
  }
}

seedItems();