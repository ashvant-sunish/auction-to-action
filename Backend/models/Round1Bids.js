const mongoose = require('mongoose');

const round1BidsSchema = new mongoose.Schema({
  // Existing databases may use either ObjectId or the legacy "round1" string.
  _id: mongoose.Schema.Types.Mixed,
  item_list: [{
    itemCode: String,
    name: String,
    bidNumber: Number,
    basePrice: Number,
    resources: {
      'Technology Access': Number,
      'Land & Workspace': Number,
      'Tools & Equipment': Number,
      'Electricity & Energy': Number,
      'Skilled Labour': Number,
      'Basic Infrastructure': Number,
      'Community Network': Number,
      'Transportation & Logistics': Number,
      'Training & Expertise': Number,
      'Market Access & Partnerships': Number
    },
    image: String
  }],
  item_list_2: [{
    itemCode: String,
    name: String,
    bidNumber: Number,
    basePrice: Number,
    resources: {
      'Land & Workspace': Number,
      'Technology Access': Number,
      'Tools & Equipment': Number,
      'Electricity & Energy': Number,
      'Skilled Labour': Number,
      'Basic Infrastructure': Number,
      'Community Network': Number,
      'Transportation & Logistics': Number,
      'Training & Expertise': Number,
      'Market Access & Partnerships': Number
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