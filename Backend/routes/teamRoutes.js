const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protectTeam } = require('../middleware/authMiddleware');

// Public route for logging in
router.post('/login', teamController.loginTeam);

// Protected routes
router.get('/dashboard', protectTeam, teamController.getDashboardData);
router.get('/transactions', protectTeam, teamController.getTransactionHistory);

// --- NEW: Route for teams to view all auction items ---
router.get('/items', protectTeam, teamController.getAvailableItems);
router.get('/all-bids', protectTeam, teamController.getAllTeamBids);
module.exports = router;