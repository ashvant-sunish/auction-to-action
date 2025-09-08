// models/round1Items.model.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  bidNo: { type: Number, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const round1ItemsSchema = new mongoose.Schema({
  item_list: [itemSchema],   // Active items
  item_backup: [itemSchema], // Backup copy
  amount: { type: Number, required: true }, // Bid amount
});

const Round1Item = mongoose.model("Round1Item", round1ItemsSchema, "round1Items");

module.exports = Round1Item;
