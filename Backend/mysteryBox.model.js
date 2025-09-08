// models/mysteryBox.model.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  bidNo: { type: Number, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  bidPrice: { type: Number, required: true },
});

const mysteryBoxSchema = new mongoose.Schema({
  boxId: { type: Number, required: true, unique: true },
  item_list: [itemSchema],        // Original items
  item_list_bidded: [itemSchema], // After bidding / given to team
  assignedTeam: { type: String, default: null }, // optional, track who got it
});

const MysteryBox = mongoose.model("MysteryBox", mysteryBoxSchema, "mysteryBoxes");

module.exports = MysteryBox;
