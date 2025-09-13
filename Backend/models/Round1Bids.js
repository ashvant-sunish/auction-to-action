const mongoose = require('mongoose');

const round1BidsSchema = new mongoose.Schema({
  _id: String,
  item_list: [{
    itemCode: String,
    name: String,
    bidNumber: Number,
    basePrice: Number,
    resources: {
      Technology: Number,
      Property: Number,
      'Office Space': Number,
      'Machinery & Tools': Number,
      'Electricity Supply': Number,
      'Skilled Labour': Number,
      'Construction Material': Number,
      Transportation: Number,
      Utilities: Number
    },
    image: String
  }],
  item_list_2: [{
    itemCode: String,
    name: String,
    bidNumber: Number,
    basePrice: Number,
    resources: {
      Technology: Number,
      Property: Number,
      'Office Space': Number,
      'Machinery & Tools': Number,
      'Electricity Supply': Number,
      'Skilled Labour': Number,
      'Construction Material': Number,
      Transportation: Number,
      Utilities: Number
    },
    image: String,
    teamCode: String,
    teamName: String,
    bidAmount: Number
  }]
}, {
  collection: 'round1bids' // Explicitly specify the collection name
});

module.exports = mongoose.model('Round1Bids', round1BidsSchema);