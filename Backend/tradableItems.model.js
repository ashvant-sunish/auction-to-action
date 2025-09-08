const mongoose = require('mongoose');

const tradableItemSchema = new mongoose.Schema({
  itemId: { type: Number, required: true, unique: true },
  itemName: { type: String, required: true },
  itemCode: { type: String, required: true, unique: true },
  teamName: { type: String, required: true }
});

const TradableItem = mongoose.model('TradableItem', tradableItemSchema, 'tradableItems');

module.exports = TradableItem;
