// controllers/tradeController.js

const TradeHistory = require('../models/TradeHistory');
const Team = require('../models/Team');
const BidHistory = require('../models/BidHistory');
const TradeWishlist = require('../models/TradeWishlist');

// CORRECT APPROACH - Remove traded items from the GIVING team's wishlist
const updateTradeWishlists = async (team1, team2, team1GaveItems, team2GaveItems) => {
  try {
    {
      {
      => {
  try {
    gave:', teamOneGives.items);
    