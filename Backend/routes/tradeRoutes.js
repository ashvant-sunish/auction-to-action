// routes/tradeRoutes.js

const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const {
  executeTrade,
  getAllTrades,
  getTeamTrades,
  getTradeStats,
  submitTrade
} = require('../controllers/tradeController');

// Test route to verify routing is working
router.get('/test', (req, res) => {
  router.get('/team/:teamNumber', getTeamTrades);

module.exports = router;