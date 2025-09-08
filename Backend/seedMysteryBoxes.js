// seedMysteryBoxes.js
require("dotenv").config();
const mongoose = require("mongoose");
const MysteryBox = require("./models/mysteryBox.model");

const boxes = [
  // 1–4 Multipliers
  {
    boxId: 1,
    item_list: [{ bidNo: 1, itemName: "2x Bid Amount", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [{ bidNo: 1, itemName: "2x Bid Amount", quantity: 1, bidPrice: 0 }],
  },
  {
    boxId: 2,
    item_list: [{ bidNo: 2, itemName: "2x Bid Amount", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [{ bidNo: 2, itemName: "2x Bid Amount", quantity: 1, bidPrice: 0 }],
  },
  {
    boxId: 3,
    item_list: [{ bidNo: 3, itemName: "1.5x Bid Amount", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [{ bidNo: 3, itemName: "1.5x Bid Amount", quantity: 1, bidPrice: 0 }],
  },
  {
    boxId: 4,
    item_list: [{ bidNo: 4, itemName: "1.5x Bid Amount", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [{ bidNo: 4, itemName: "1.5x Bid Amount", quantity: 1, bidPrice: 0 }],
  },

  // 5–13 Nothing
  ...Array.from({ length: 9 }, (_, i) => ({
    boxId: 5 + i,
    item_list: [{ bidNo: 5 + i, itemName: "Nothing", quantity: 0, bidPrice: 0 }],
    item_list_bidded: [{ bidNo: 5 + i, itemName: "Nothing", quantity: 0, bidPrice: 0 }],
  })),

  // 14–20 Items
  {
    boxId: 14,
    item_list: [
      { bidNo: 14, itemName: "Technology", quantity: 6, bidPrice: 0 },
      { bidNo: 14, itemName: "Utilities", quantity: 2, bidPrice: 0 },
    ],
    item_list_bidded: [
      { bidNo: 14, itemName: "Technology", quantity: 6, bidPrice: 0 },
      { bidNo: 14, itemName: "Utilities", quantity: 2, bidPrice: 0 },
    ],
  },
  {
    boxId: 15,
    item_list: [
      { bidNo: 15, itemName: "Transportation", quantity: 6, bidPrice: 0 },
      { bidNo: 15, itemName: "Office Space", quantity: 2, bidPrice: 0 },
    ],
    item_list_bidded: [
      { bidNo: 15, itemName: "Transportation", quantity: 6, bidPrice: 0 },
      { bidNo: 15, itemName: "Office Space", quantity: 2, bidPrice: 0 },
    ],
  },
  {
    boxId: 16,
    item_list: [
      { bidNo: 16, itemName: "Property", quantity: 3, bidPrice: 0 },
      { bidNo: 16, itemName: "Machinery & Tools", quantity: 3, bidPrice: 0 },
      { bidNo: 16, itemName: "Electricity Supply", quantity: 2, bidPrice: 0 },
    ],
    item_list_bidded: [
      { bidNo: 16, itemName: "Property", quantity: 3, bidPrice: 0 },
      { bidNo: 16, itemName: "Machinery & Tools", quantity: 3, bidPrice: 0 },
      { bidNo: 16, itemName: "Electricity Supply", quantity: 2, bidPrice: 0 },
    ],
  },
  {
    boxId: 17,
    item_list: [
      { bidNo: 17, itemName: "Skilled Labour", quantity: 5, bidPrice: 0 },
      { bidNo: 17, itemName: "Technology", quantity: 1, bidPrice: 0 },
      { bidNo: 17, itemName: "Construction Material", quantity: 2, bidPrice: 0 },
    ],
    item_list_bidded: [
      { bidNo: 17, itemName: "Skilled Labour", quantity: 5, bidPrice: 0 },
      { bidNo: 17, itemName: "Technology", quantity: 1, bidPrice: 0 },
      { bidNo: 17, itemName: "Construction Material", quantity: 2, bidPrice: 0 },
    ],
  },
  {
    boxId: 18,
    item_list: [
      { bidNo: 18, itemName: "Technology", quantity: 3, bidPrice: 0 },
      { bidNo: 18, itemName: "Machinery & Tools", quantity: 3, bidPrice: 0 },
      { bidNo: 18, itemName: "Utilities", quantity: 2, bidPrice: 0 },
    ],
    item_list_bidded: [
      { bidNo: 18, itemName: "Technology", quantity: 3, bidPrice: 0 },
      { bidNo: 18, itemName: "Machinery & Tools", quantity: 3, bidPrice: 0 },
      { bidNo: 18, itemName: "Utilities", quantity: 2, bidPrice: 0 },
    ],
  },
  {
    boxId: 19,
    item_list: [
      { bidNo: 19, itemName: "Utilities", quantity: 6, bidPrice: 0 },
      { bidNo: 19, itemName: "Property", quantity: 2, bidPrice: 0 },
    ],
    item_list_bidded: [
      { bidNo: 19, itemName: "Utilities", quantity: 6, bidPrice: 0 },
      { bidNo: 19, itemName: "Property", quantity: 2, bidPrice: 0 },
    ],
  },
  {
    boxId: 20,
    item_list: [
      { bidNo: 20, itemName: "Electricity Supply", quantity: 4, bidPrice: 0 },
      { bidNo: 20, itemName: "Technology", quantity: 3, bidPrice: 0 },
      { bidNo: 20, itemName: "Skilled Labour", quantity: 1, bidPrice: 0 },
    ],
    item_list_bidded: [
      { bidNo: 20, itemName: "Electricity Supply", quantity: 4, bidPrice: 0 },
      { bidNo: 20, itemName: "Technology", quantity: 3, bidPrice: 0 },
      { bidNo: 20, itemName: "Skilled Labour", quantity: 1, bidPrice: 0 },
    ],
  },

  // 21–25 Challenges
  {
    boxId: 21,
    item_list: [{ bidNo: 21, itemName: "Challenge: Say phrase 5× → 2x Bid Amount", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [{ bidNo: 21, itemName: "2x Bid Amount", quantity: 1, bidPrice: 0 }],
  },
  {
    boxId: 22,
    item_list: [{ bidNo: 22, itemName: "Challenge: Say phrase 5× → Property + Skilled Labour", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [
      { bidNo: 22, itemName: "Property", quantity: 5, bidPrice: 0 },
      { bidNo: 22, itemName: "Skilled Labour", quantity: 3, bidPrice: 0 },
    ],
  },
  {
    boxId: 23,
    item_list: [{ bidNo: 23, itemName: "Challenge: Say phrase 5× → Machinery & Tools + Technology", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [
      { bidNo: 23, itemName: "Machinery & Tools", quantity: 4, bidPrice: 0 },
      { bidNo: 23, itemName: "Technology", quantity: 4, bidPrice: 0 },
    ],
  },
  {
    boxId: 24,
    item_list: [{ bidNo: 24, itemName: "Challenge: Say phrase 5× → 1.5x Bid Amount", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [{ bidNo: 24, itemName: "1.5x Bid Amount", quantity: 1, bidPrice: 0 }],
  },
  {
    boxId: 25,
    item_list: [{ bidNo: 25, itemName: "Challenge: Say phrase 5× → Electricity Supply + Machinery & Tools", quantity: 1, bidPrice: 0 }],
    item_list_bidded: [
      { bidNo: 25, itemName: "Electricity Supply", quantity: 5, bidPrice: 0 },
      { bidNo: 25, itemName: "Machinery & Tools", quantity: 3, bidPrice: 0 },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await MysteryBox.deleteMany({});
    await MysteryBox.insertMany(boxes);

    console.log("✅ Mystery Boxes inserted successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting Mystery Boxes:", err);
  }
}

seed();
