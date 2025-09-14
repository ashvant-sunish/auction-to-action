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

// Admin routes for trade management
router.post('/execute', protectAdmin, executeTrade);
router.post('/submit-trade', protectAdmin, submitTrade);
router.get('/all', protectAdmin, getAllTrades);
router.get('/stats', protectAdmin, getTradeStats);

// Team-specific trade history (can be accessed by teams)
router.get('/team/:teamNumber', getTeamTrades);

module.exports = router;