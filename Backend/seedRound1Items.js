// seedRound1Items.js
require("dotenv").config();
const mongoose = require("mongoose");
const Round1Item = require("./models/round1Items.model");

const bids = [
  {
    bidNo: 1,
    items: [
      { itemName: "Technology", quantity: 6 },
      { itemName: "Property", quantity: 5 },
    ],
    amount: 9500,
  },
  {
    bidNo: 2,
    items: [{ itemName: "Technology", quantity: 7 }],
    amount: 9000,
  },
  {
    bidNo: 3,
    items: [
      { itemName: "Property", quantity: 3 },
      { itemName: "Technology", quantity: 6 },
    ],
    amount: 8000,
  },
  {
    bidNo: 4,
    items: [
      { itemName: "Property", quantity: 5 },
      { itemName: "Technology", quantity: 4 },
    ],
    amount: 8000,
  },
  {
    bidNo: 5,
    items: [
      { itemName: "Property", quantity: 5 },
      { itemName: "Technology", quantity: 5 },
    ],
    amount: 8000,
  },
  {
    bidNo: 6,
    items: [
      { itemName: "Property", quantity: 5 },
      { itemName: "Technology", quantity: 4 },
      { itemName: "Electricity Supply", quantity: 4 },
    ],
    amount: 8000,
  },
  {
    bidNo: 7,
    items: [
      { itemName: "Technology", quantity: 4 },
      { itemName: "Property", quantity: 5 },
    ],
    amount: 7500,
  },
  {
    bidNo: 8,
    items: [
      { itemName: "Technology", quantity: 6 },
      { itemName: "Skilled Labour", quantity: 3 },
    ],
    amount: 7500,
  },
  {
    bidNo: 9,
    items: [
      { itemName: "Property", quantity: 5 },
      { itemName: "Machinery & Tools", quantity: 6 },
    ],
    amount: 7500,
  },
  {
    bidNo: 10,
    items: [
      { itemName: "Property", quantity: 5 },
      { itemName: "Machinery & Tools", quantity: 5 },
      { itemName: "Electricity Supply", quantity: 4 },
    ],
    amount: 7500,
  },
  // 👉 continue adding the rest up to BID 75 from your file
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear old data
    await Round1Item.deleteMany({});

    // Insert all bids: each as a document with list + backup
    const docs = bids.map((bid) => ({
      item_list: bid.items.map((i) => ({
        bidNo: bid.bidNo,
        itemName: i.itemName,
        quantity: i.quantity,
      })),
      item_backup: bid.items.map((i) => ({
        bidNo: bid.bidNo,
        itemName: i.itemName,
        quantity: i.quantity,
      })),
    }));

    await Round1Item.insertMany(docs);

    console.log("✅ Round 1 bids inserted successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting Round 1 bids:", err);
  }
}

seed();
