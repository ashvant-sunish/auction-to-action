const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  item_no: { type: Number, required: true },
  items: [
    {
      item_name: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  base_price: { type: Number, required: true },
  image_path: { type: String, required: true }
});

const emptyItemSchema = new mongoose.Schema({
  item_no: { type: Number },
  items: [
    {
      item_name: { type: String },
      quantity: { type: Number }
    }
  ],
  base_price: { type: Number },   // 🔹 now optional
  image_path: { type: String }
});

const roundOneSchema = new mongoose.Schema({
  ID: { type: Number, required: true },  // we’ll supply this in seeding
  item_list: [itemSchema],
  item_list_bidded: [emptyItemSchema]
});

module.exports = mongoose.model("RoundOne", roundOneSchema, "roundOne");

