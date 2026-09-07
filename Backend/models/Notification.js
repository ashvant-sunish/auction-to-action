// models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientTeamCode: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  recipientTeamName: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  round: {
    type: Number,
    enum: [1, 2, 3],
    required: true
  },
  type: {
    type: String,
    enum: ['BID_WON', 'MYSTERY_BOX', 'TRADE_COMPLETED', 'RESOURCE_UPDATE', 'ADMIN_ACTION'],
    default: 'ADMIN_ACTION'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
