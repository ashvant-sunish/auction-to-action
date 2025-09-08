// round1ItemsActions.js
require("dotenv").config();
const mongoose = require("mongoose");
const Round1Item = require("./models/round1Items.model");

// Connect helper
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

// CREATE
async function createBid(bidNo, items, amount) {
  await connectDB();
  const newBid = new Round1Item({
    item_list: items.map(i => ({ bidNo, ...i })),
    item_backup: items.map(i => ({ bidNo, ...i })),
    amount,
  });
  return await newBid.save();
}

// READ
async function getAllBids() {
  await connectDB();
  return await Round1Item.find();
}

async function getBidByNo(bidNo) {
  await connectDB();
  return await Round1Item.findOne({ "item_list.bidNo": bidNo });
}

// UPDATE
async function updateBid(bidNo, updates) {
  await connectDB();
  return await Round1Item.findOneAndUpdate(
    { "item_list.bidNo": bidNo },
    { $set: updates },
    { new: true }
  );
}

// DELETE
async function deleteBid(bidNo) {
  await connectDB();
  return await Round1Item.findOneAndDelete({ "item_list.bidNo": bidNo });
}

module.exports = {
  createBid,
  getAllBids,
  getBidByNo,
  updateBid,
  deleteBid,
};
